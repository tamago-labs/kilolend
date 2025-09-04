// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.10;

import "forge-std/Test.sol";
import "../src/Comptroller.sol"; 
import "../src/KiloPriceOracle.sol";
import "../src/tokens/CErc20Immutable.sol"; 
import "../src/mocks/MockToken.sol";
import "../src/interest-rates/JumpRateModelV2.sol";

contract MultiMarketTest is Test {

    Comptroller public comptroller;
    KiloPriceOracle public oracle;
    CErc20Immutable public cUSDT;
    CErc20Immutable public cETH;
    CErc20Immutable public cBTC;
    MockToken public usdt;
    MockToken public eth;
    MockToken public btc;
    JumpRateModelV2 public stableRateModel;
    JumpRateModelV2 public volatileRateModel;
    
    address public admin = address(0x1);
    address public user1 = address(0x2);
    address public user2 = address(0x3);
    address public user3 = address(0x4);
    
    uint256 public constant INITIAL_EXCHANGE_RATE = 2e17;
    
    function setUp() public {
        vm.startPrank(admin);
        
        // Deploy core contracts
        comptroller = new Comptroller();
        oracle = new KiloPriceOracle();
        
        // Deploy mock tokens
        usdt = new MockToken("Tether USD", "USDT", 6, 10000000e6); // 10M USDT
        eth = new MockToken("Wrapped ETH", "ETH", 18, 100000e18);   // 100k ETH
        btc = new MockToken("Wrapped Bitcoin", "BTC", 8, 50000e8);     // 50k BTC
        
        // Deploy interest rate models
        stableRateModel = new JumpRateModelV2(
            1e16,   // 1% base rate for stables
            5e16,   // 5% multiplier
            100e16, // 100% jump multiplier
            9e17,   // 90% kink
            admin
        );
        
        volatileRateModel = new JumpRateModelV2(
            3e16,   // 3% base rate for volatile assets
            15e16,  // 15% multiplier
            300e16, // 300% jump multiplier
            8e17,   // 80% kink
            admin
        );
        
        // Deploy cTokens
        cUSDT = new CErc20Immutable(
            address(usdt),
            ComptrollerInterface(address(comptroller)),
            InterestRateModel(address(stableRateModel)),
            INITIAL_EXCHANGE_RATE,
            "Compound USDT",
            "cUSDT",
            8,
            payable(admin)
        );
        
        cETH = new CErc20Immutable(
            address(eth),
            ComptrollerInterface(address(comptroller)),
            InterestRateModel(address(volatileRateModel)),
            INITIAL_EXCHANGE_RATE,
            "Compound ETH",
            "cETH",
            8,
            payable(admin)
        );
        
        cBTC = new CErc20Immutable(
            address(btc),
            ComptrollerInterface(address(comptroller)),
            InterestRateModel(address(volatileRateModel)),
            INITIAL_EXCHANGE_RATE,
            "Compound BTC",
            "cBTC",
            8,
            payable(admin)
        );
        
        // Set oracle prices
        oracle.setDirectPrice(address(usdt), 1e18);      // $1
        oracle.setDirectPrice(address(eth), 2000e18);    // $2000
        oracle.setDirectPrice(address(btc), 50000e18);   // $50000
        
        // Configure comptroller
        comptroller._setPriceOracle(PriceOracle(address(oracle)));
        comptroller._supportMarket(CToken(address(cUSDT)));
        comptroller._supportMarket(CToken(address(cETH)));
        comptroller._supportMarket(CToken(address(cBTC)));
        comptroller._setCloseFactor(5e17); // 50%
        comptroller._setLiquidationIncentive(108e16); // 8%
        comptroller._setCollateralFactor(CToken(address(cUSDT)), 85e16); // 85% for stablecoin
        comptroller._setCollateralFactor(CToken(address(cETH)), 75e16);  // 75% for ETH
        comptroller._setCollateralFactor(CToken(address(cBTC)), 70e16);  // 70% for BTC
        
        vm.stopPrank();
        
        // Distribute tokens to users
        vm.startPrank(admin);
        usdt.transfer(user1, 100000e6);
        usdt.transfer(user2, 100000e6);
        usdt.transfer(user3, 100000e6);
        
        eth.transfer(user1, 100e18);
        eth.transfer(user2, 100e18);
        eth.transfer(user3, 100e18);
        
        btc.transfer(user1, 10e8);
        btc.transfer(user2, 10e8);
        btc.transfer(user3, 10e8);
        vm.stopPrank();
    }
    
    function testMultiAssetSupply() public {
        // User1 supplies multiple assets
        vm.startPrank(user1);
        address[] memory markets = new address[](3);
        markets[0] = address(cUSDT);
        markets[1] = address(cETH);
        markets[2] = address(cBTC);
        comptroller.enterMarkets(markets);
        
        // Supply to all markets
        usdt.approve(address(cUSDT), 10000e6);
        eth.approve(address(cETH), 10e18);
        btc.approve(address(cBTC), 1e8);
        
        cUSDT.mint(10000e6);
        cETH.mint(10e18);
        cBTC.mint(1e8);
        
        // Check balances
        assertGt(cUSDT.balanceOf(user1), 0);
        assertGt(cETH.balanceOf(user1), 0);
        assertGt(cBTC.balanceOf(user1), 0);
        
        vm.stopPrank();
    }
    
    function testCrossAssetBorrowing() public {
        // Admin supplies first
        vm.startPrank(admin);
        address[] memory markets_admin = new address[](3);
        markets_admin[0] = address(cUSDT);
        markets_admin[1] = address(cETH);
        markets_admin[2] = address(cBTC);
        comptroller.enterMarkets(markets_admin); 
        usdt.approve(address(cUSDT), 10000e6);
        eth.approve(address(cETH), 10000e18);
        btc.approve(address(cBTC), 10000e8);
        
        cUSDT.mint(10000e6);
        cETH.mint(10000e18);
        cBTC.mint(10000e8);

        vm.stopPrank();
        
        // Setup: User1 supplies ETH, borrows USDT and BTC
        vm.startPrank(user1);
        address[] memory markets = new address[](3);
        markets[0] = address(cUSDT);
        markets[1] = address(cETH);
        markets[2] = address(cBTC);
        comptroller.enterMarkets(markets);
        
        // Supply ETH as collateral (10 ETH = $20,000)
        eth.approve(address(cETH), 10e18);
        cETH.mint(10e18);
        
        // Borrow USDT (75% of 20k = 15k max, borrow 10k to be safe)
        cUSDT.borrow(10000e6);
        
        // Borrow BTC (remaining capacity ~5k, borrow 0.1 BTC = $5k)
        cBTC.borrow(1e7); // 0.1 BTC
        
        // Verify borrows
        assertEq(cUSDT.borrowBalanceCurrent(user1), 10000e6);
        assertEq(cBTC.borrowBalanceCurrent(user1), 1e7);
        
        vm.stopPrank();
    }
    
    function testComplexLiquidation() public {
         // Admin supplies first
        vm.startPrank(admin);
        address[] memory markets_admin = new address[](3);
        markets_admin[0] = address(cUSDT);
        markets_admin[1] = address(cETH);
        markets_admin[2] = address(cBTC);
        comptroller.enterMarkets(markets_admin); 
        usdt.approve(address(cUSDT), 50000e6);
        eth.approve(address(cETH), 10000e18);
        btc.approve(address(cBTC), 10000e8);
        
        cUSDT.mint(50000e6);
        cETH.mint(10000e18);
        cBTC.mint(10000e8);

        vm.stopPrank();


        // Setup borrowing scenario
        vm.startPrank(user1);
        address[] memory markets = new address[](3);
        markets[0] = address(cUSDT);
        markets[1] = address(cETH);
        markets[2] = address(cBTC);
        comptroller.enterMarkets(markets);
        
        // Supply ETH and BTC
        eth.approve(address(cETH), 5e18);
        btc.approve(address(cBTC), 5e7); // 0.5 BTC
        cETH.mint(5e18);
        cBTC.mint(5e7);
        
        // Borrow USDT close to limit
        cUSDT.borrow(20000e6); // Should be around limit
        vm.stopPrank();
        
        // Price drop: ETH to $1500, BTC to $40k
        vm.prank(admin);
        oracle.setDirectPrice(address(eth), 1500e18);
        vm.prank(admin);
        oracle.setDirectPrice(address(btc), 40000e18);
        
        // Check user is underwater
        (uint error, uint liquidity, uint shortfall) = comptroller.getAccountLiquidity(user1);
        assertEq(error, 0);
        assertGt(shortfall, 0);
        
        // User2 liquidates
        vm.startPrank(user2);
        usdt.mint(user2, 5000e6);
        usdt.approve(address(cUSDT), 5000e6);
        
        // Liquidate and seize ETH
        cUSDT.liquidateBorrow(
            user1,
            5000e6, // 50% of debt
            CTokenInterface(address(cETH))
        );
        
        // Check user2 received cETH
        assertGt(cETH.balanceOf(user2), 0);
        
        vm.stopPrank();
    }
    
    function testInterestAccrualMultiMarket() public {
         // Admin supplies first
        vm.startPrank(admin);
        address[] memory markets_admin = new address[](3);
        markets_admin[0] = address(cUSDT);
        markets_admin[1] = address(cETH);
        markets_admin[2] = address(cBTC);
        comptroller.enterMarkets(markets_admin); 
        usdt.approve(address(cUSDT), 10000e6);
        eth.approve(address(cETH), 10000e18);
        btc.approve(address(cBTC), 10000e8);
        
        cUSDT.mint(10000e6);
        cETH.mint(10000e18);
        cBTC.mint(10000e8);

        vm.stopPrank();


        // Setup borrowing in multiple markets
        vm.startPrank(user1);
        address[] memory markets = new address[](3);
        markets[0] = address(cUSDT);
        markets[1] = address(cETH);
        markets[2] = address(cBTC);
        comptroller.enterMarkets(markets);
        
        // Supply large collateral
        eth.approve(address(cETH), 20e18);
        cETH.mint(20e18);
        
        // Borrow from both USDT and BTC markets
        cUSDT.borrow(10000e6);
        cBTC.borrow(1e7); // 0.1 BTC
        vm.stopPrank();
        
        uint usdtBorrowBefore = cUSDT.borrowBalanceCurrent(user1);
        uint btcBorrowBefore = cBTC.borrowBalanceCurrent(user1);
        
        // Advance time by 1 year
        uint initialBlock = block.number;
        vm.roll(initialBlock + 31536000);
        
        // Accrue interest
        cUSDT.accrueInterest();
        cBTC.accrueInterest();
        
        uint usdtBorrowAfter = cUSDT.borrowBalanceCurrent(user1);
        uint btcBorrowAfter = cBTC.borrowBalanceCurrent(user1);
        
        // Interest should have accrued on both
        assertGt(usdtBorrowAfter, usdtBorrowBefore);
        assertGt(btcBorrowAfter, btcBorrowBefore);
    }
    
    function testMarketUtilization() public {
        // Admin supplies first
        vm.startPrank(admin);
        address[] memory markets_admin = new address[](3);
        markets_admin[0] = address(cUSDT);
        markets_admin[1] = address(cETH);
        markets_admin[2] = address(cBTC);
        comptroller.enterMarkets(markets_admin); 
        usdt.approve(address(cUSDT), 10000e6);
        eth.approve(address(cETH), 10000e18);
        btc.approve(address(cBTC), 10000e8);
        
        cUSDT.mint(10000e6);
        cETH.mint(10000e18);
        cBTC.mint(10000e8);

        vm.stopPrank();


        // User1 supplies to all markets
        vm.startPrank(user1);
        address[] memory markets = new address[](3);
        markets[0] = address(cUSDT);
        markets[1] = address(cETH);
        markets[2] = address(cBTC);
        comptroller.enterMarkets(markets);
        
        usdt.approve(address(cUSDT), 50000e6);
        eth.approve(address(cETH), 25e18);
        btc.approve(address(cBTC), 2e8);
        
        cUSDT.mint(50000e6);
        cETH.mint(25e18);
        cBTC.mint(2e8);
        vm.stopPrank();
        
        // User2 and User3 borrow to create utilization
        vm.startPrank(user2);
        comptroller.enterMarkets(markets);
        eth.approve(address(cETH), 10e18);
        cETH.mint(10e18);
        cUSDT.borrow(10000e6); // Create USDT utilization
        vm.stopPrank();
        
        vm.startPrank(user3);
        comptroller.enterMarkets(markets);
        btc.approve(address(cBTC), 1e8);
        cBTC.mint(1e8);
        cETH.borrow(5e18); // Create ETH utilization
        vm.stopPrank();
        
        // Check utilization ratios
        uint usdtCash = cUSDT.getCash();
        uint usdtBorrows = cUSDT.totalBorrows();
        uint usdtUtilization = usdtBorrows * 1e18 / (usdtCash + usdtBorrows);
        
        uint ethCash = cETH.getCash();
        uint ethBorrows = cETH.totalBorrows();
        uint ethUtilization = ethBorrows * 1e18 / (ethCash + ethBorrows);
        
        assertGt(usdtUtilization, 0);
        assertGt(ethUtilization, 0);
        assertLt(usdtUtilization, 1e18); // Less than 100%
        assertLt(ethUtilization, 1e18);
    }
    
    function testBorrowCapEnforcement() public {
        // Set borrow caps
        CToken[] memory cTokens = new CToken[](2);
        uint[] memory borrowCaps = new uint[](2);
        
        cTokens[0] = CToken(address(cUSDT));
        cTokens[1] = CToken(address(cBTC));
        borrowCaps[0] = 20000e6; // 20k USDT cap
        borrowCaps[1] = 5e7;     // 0.5 BTC cap
        
        vm.prank(admin);
        comptroller._setMarketBorrowCaps(cTokens, borrowCaps);
        
        // User tries to borrow beyond cap
        vm.startPrank(user1);
        address[] memory markets = new address[](3);
        markets[0] = address(cUSDT);
        markets[1] = address(cETH);
        markets[2] = address(cBTC);
        comptroller.enterMarkets(markets);
        
        // Supply massive collateral
        eth.approve(address(cETH), 50e18);
        cETH.mint(50e18);
        
        // Try to borrow beyond USDT cap
        vm.expectRevert("market borrow cap reached");
        cUSDT.borrow(25000e6); // Above 20k cap
       
        
        vm.stopPrank();
    }
}
