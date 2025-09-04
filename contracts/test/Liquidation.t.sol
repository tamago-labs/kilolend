// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.10;

import "forge-std/Test.sol";
import "../src/Comptroller.sol"; 
import "../src/KiloPriceOracle.sol";
import "../src/tokens/CErc20Immutable.sol"; 
import "../src/mocks/MockToken.sol";
import "../src/interest-rates/JumpRateModelV2.sol";

contract LiquidationTest is Test {
    Comptroller public comptroller;
    KiloPriceOracle public oracle;
    CErc20Immutable public cUSDT;
    CErc20Immutable public cETH;
    MockToken public usdt;
    MockToken public eth; // Using MockUSDT as mock ETH
    JumpRateModelV2 public interestRateModel;
    
    address public admin = address(0x1);
    address public borrower = address(0x2);
    address public liquidator = address(0x3);
    
    uint256 public constant INITIAL_EXCHANGE_RATE = 2e17;
    uint256 public constant USDT_PRICE = 1e18; // $1
    uint256 public constant ETH_PRICE = 2000e18; // $2000
    
    function setUp() public {
        vm.startPrank(admin);
        
        // Deploy core contracts
        comptroller = new Comptroller();
        oracle = new KiloPriceOracle();
        usdt = new MockToken("Tether USD", "USDT", 6,  1000000e6);
        eth = new MockToken("Wrapped ETH", "ETH", 18, 10000e18); // Mock ETH
        
        interestRateModel = new JumpRateModelV2(
            2e16,   // 2% base rate
            10e16,  // 10% multiplier
            200e16, // 200% jump multiplier
            8e17,   // 80% kink
            admin
        );
        
        // Deploy cTokens
        cUSDT = new CErc20Immutable(
            address(usdt),
            ComptrollerInterface(address(comptroller)),
            InterestRateModel(address(interestRateModel)),
            INITIAL_EXCHANGE_RATE,
            "Compound USDT",
            "cUSDT",
            8,
            payable(admin)
        );
        
        cETH = new CErc20Immutable(
            address(eth),
            ComptrollerInterface(address(comptroller)),
            InterestRateModel(address(interestRateModel)),
            INITIAL_EXCHANGE_RATE,
            "Compound ETH",
            "cETH",
            8,
            payable(admin)
        );
        
        // Configure oracle
        oracle.setDirectPrice(address(usdt), USDT_PRICE);
        oracle.setDirectPrice(address(eth), ETH_PRICE);
        
        // Configure comptroller
        comptroller._setPriceOracle(PriceOracle(address(oracle)));
        comptroller._supportMarket(CToken(address(cUSDT)));
        comptroller._supportMarket(CToken(address(cETH)));
        comptroller._setCloseFactor(5e17); // 50%
        comptroller._setLiquidationIncentive(108e16); // 8% bonus
        comptroller._setCollateralFactor(CToken(address(cUSDT)), 75e16); // 75%
        comptroller._setCollateralFactor(CToken(address(cETH)), 80e16); // 80%
        
        vm.stopPrank();
        
        // Distribute tokens 
        usdt.mint(borrower, 10000e6); 
        usdt.mint(liquidator, 50000e6); 
        eth.mint(borrower, 10000e18); 
        eth.mint(liquidator, 10000e18);
    }
    
    function testBasicLiquidation() public {

        // Admin supplies first
        vm.startPrank(admin);
        address[] memory markets_admin = new address[](3);
        markets_admin[0] = address(cUSDT);
        markets_admin[1] = address(cETH);
        comptroller.enterMarkets(markets_admin); 
        usdt.approve(address(cUSDT), 50000e6);
        eth.approve(address(cETH), 10000e18);
        
        cUSDT.mint(50000e6);
        cETH.mint(10000e18);

        vm.stopPrank();

        // Setup: borrower supplies ETH and borrows USDT
        vm.startPrank(borrower);
        address[] memory markets = new address[](2);
        markets[0] = address(cETH);
        markets[1] = address(cUSDT);
        comptroller.enterMarkets(markets);
        
        // Supply 1 ETH as collateral
        eth.approve(address(cETH), 1e18);
        cETH.mint(1e18);
        
        // Borrow 1000 USDT (should be safe at 80% collateral factor)
        cUSDT.borrow(1000e6);
        vm.stopPrank();
        
        // Price drops - ETH now worth $1000
        vm.prank(admin);
        oracle.setDirectPrice(address(eth), 1000e18);
        
        // Check borrower is underwater
        (uint error, uint liquidity, uint shortfall) = comptroller.getAccountLiquidity(borrower);
        assertEq(error, 0);
        assertEq(liquidity, 0);
        assertGt(shortfall, 0);
        
        // Liquidator liquidates
        vm.startPrank(liquidator);
        usdt.approve(address(cUSDT), 500e6);
        
        uint result = cUSDT.liquidateBorrow(
            borrower,
            500e6, // Repay 500 USDT (50% of borrow due to close factor)
            CTokenInterface(address(cETH))
        );
        
        assertEq(result, 0);
        
        // Check liquidator received cETH tokens
        assertGt(cETH.balanceOf(liquidator), 0);
        
        // Check borrower's borrow balance reduced
        assertLt(cUSDT.borrowBalanceCurrent(borrower), 1000e6);
        
        vm.stopPrank();
    }
    
    function testLiquidationIncentive() public {

        // Admin supplies first
        vm.startPrank(admin);
        address[] memory markets_admin = new address[](3);
        markets_admin[0] = address(cUSDT);
        markets_admin[1] = address(cETH);
        comptroller.enterMarkets(markets_admin); 
        usdt.approve(address(cUSDT), 50000e6);
        eth.approve(address(cETH), 10000e18);
        
        cUSDT.mint(50000e6);
        cETH.mint(10000e18);

        vm.stopPrank();

        // Setup similar to above
        vm.startPrank(borrower);
        address[] memory markets = new address[](2);
        markets[0] = address(cETH);
        markets[1] = address(cUSDT);
        comptroller.enterMarkets(markets);
        
        eth.approve(address(cETH), 2e18);
        cETH.mint(2e18);
        cUSDT.borrow(2000e6);
        vm.stopPrank();
        
        // Price drops
        vm.prank(admin);
        oracle.setDirectPrice(address(eth), 1200e18);
        
        uint liquidatorETHBefore = cETH.balanceOf(liquidator);
        
        vm.startPrank(liquidator);
        usdt.approve(address(cUSDT), 1000e6);
        
        cUSDT.liquidateBorrow(
            borrower,
            1000e6,
            CTokenInterface(address(cETH))
        );
        
        uint liquidatorETHAfter = cETH.balanceOf(liquidator);
        uint seizedTokens = liquidatorETHAfter - liquidatorETHBefore;
        
        // Should receive more than the proportional amount due to liquidation incentive 
        assertEq(seizedTokens, 4374000000000000000); 
        
        vm.stopPrank();
    }
    
    function testPartialLiquidation() public {

        // Admin supplies first
        vm.startPrank(admin);
        address[] memory markets_admin = new address[](3);
        markets_admin[0] = address(cUSDT);
        markets_admin[1] = address(cETH);
        comptroller.enterMarkets(markets_admin); 
        usdt.approve(address(cUSDT), 50000e6);
        eth.approve(address(cETH), 10000e18);
        
        cUSDT.mint(50000e6);
        cETH.mint(10000e18);

        vm.stopPrank();

        vm.startPrank(borrower);
        address[] memory markets = new address[](2);
        markets[0] = address(cETH);
        markets[1] = address(cUSDT);
        comptroller.enterMarkets(markets);
        
        eth.approve(address(cETH), 3e18);
        cETH.mint(3e18);
        cUSDT.borrow(3000e6);
        vm.stopPrank();
        
        // Price drops
        vm.prank(admin);
        oracle.setDirectPrice(address(eth), 1100e18);
        
        uint borrowBalanceBefore = cUSDT.borrowBalanceCurrent(borrower);
        
        vm.startPrank(liquidator);
        usdt.approve(address(cUSDT), 1500e6); // Max 50% due to close factor
        
        cUSDT.liquidateBorrow(
            borrower,
            1500e6,
            CTokenInterface(address(cETH))
        );
        
        uint borrowBalanceAfter = cUSDT.borrowBalanceCurrent(borrower);
        
        // Should have reduced by exactly the repaid amount
        assertEq(borrowBalanceBefore - borrowBalanceAfter, 1500e6);
        assertGt(borrowBalanceAfter, 0); // Still has remaining debt
        
        vm.stopPrank();
    }
    
    function testLiquidationFailsWhenHealthy() public {

        // Admin supplies first
        vm.startPrank(admin);
        address[] memory markets_admin = new address[](3);
        markets_admin[0] = address(cUSDT);
        markets_admin[1] = address(cETH);
        comptroller.enterMarkets(markets_admin); 
        usdt.approve(address(cUSDT), 50000e6);
        eth.approve(address(cETH), 10000e18);
        
        cUSDT.mint(50000e6);
        cETH.mint(10000e18);

        vm.stopPrank();

        vm.startPrank(borrower);
        address[] memory markets = new address[](2);
        markets[0] = address(cETH);
        markets[1] = address(cUSDT);
        comptroller.enterMarkets(markets);
        
        eth.approve(address(cETH), 2e18);
        cETH.mint(2e18);
        cUSDT.borrow(1000e6); // Safe borrow
        vm.stopPrank();
        
        // Borrower is healthy - liquidation should fail
        vm.startPrank(liquidator);
        usdt.approve(address(cUSDT), 500e6);
        
        vm.expectRevert();
        cUSDT.liquidateBorrow(
            borrower,
            500e6,
            CTokenInterface(address(cETH))
        );

        vm.stopPrank();
    }
    
    function testLiquidationExceedsCloseFactor() public {

        // Admin supplies first
        vm.startPrank(admin);
        address[] memory markets_admin = new address[](3);
        markets_admin[0] = address(cUSDT);
        markets_admin[1] = address(cETH);
        comptroller.enterMarkets(markets_admin); 
        usdt.approve(address(cUSDT), 50000e6);
        eth.approve(address(cETH), 10000e18);
        
        cUSDT.mint(50000e6);
        cETH.mint(10000e18);

        vm.stopPrank();

        vm.startPrank(borrower);
        address[] memory markets = new address[](2);
        markets[0] = address(cETH);
        markets[1] = address(cUSDT);
        comptroller.enterMarkets(markets);
        
        eth.approve(address(cETH), 1e18);
        cETH.mint(1e18);
        cUSDT.borrow(1000e6);
        vm.stopPrank();
        
        // Price drops
        vm.startPrank(admin);
        oracle.setDirectPrice(address(eth), 1000e18);
        vm.stopPrank();
        
        vm.startPrank(liquidator);
        usdt.approve(address(cUSDT), 800e6); // Try to repay 80% (exceeds 50% close factor)
        
        vm.expectRevert();
         cUSDT.liquidateBorrow(
            borrower,
            800e6,
            CTokenInterface(address(cETH))
        );
         
        vm.stopPrank();
    }
    
    function testSelfLiquidation() public {

        // Admin supplies first
        vm.startPrank(admin);
        address[] memory markets_admin = new address[](3);
        markets_admin[0] = address(cUSDT);
        markets_admin[1] = address(cETH);
        comptroller.enterMarkets(markets_admin); 
        usdt.approve(address(cUSDT), 50000e6);
        eth.approve(address(cETH), 10000e18);
        
        cUSDT.mint(50000e6);
        cETH.mint(10000e18);

        vm.stopPrank();

        vm.startPrank(borrower);
        address[] memory markets = new address[](2);
        markets[0] = address(cETH);
        markets[1] = address(cUSDT);
        comptroller.enterMarkets(markets);
        
        eth.approve(address(cETH), 1e18);
        cETH.mint(1e18);
        cUSDT.borrow(1000e6);
        
        // Price drops
        vm.stopPrank();
        vm.startPrank(admin);
        oracle.setDirectPrice(address(eth), 1000e18);
        vm.stopPrank();
        
        // Borrower tries to liquidate themselves
        vm.startPrank(borrower);
        usdt.approve(address(cUSDT), 100e6);
        
        vm.expectRevert();
        cUSDT.liquidateBorrow(
            borrower,
            100e6,
            CTokenInterface(address(cETH))
        );
        
        vm.stopPrank();
    }
}
