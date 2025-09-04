// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.10;

import "forge-std/Test.sol";
import "../src/Comptroller.sol"; 
import "../src/tokens/CErc20Immutable.sol"; 
import "../src/mocks/MockToken.sol";
import "../src/KiloPriceOracle.sol";
import "../src/interest-rates/CollateralRateModel.sol";
import "../src/interest-rates/StablecoinJumpRateModel.sol"; 

contract SingleMarketTest is Test {

    Comptroller public comptroller;
    KiloPriceOracle public oracle;
    CErc20Immutable public cUSDT;
    CErc20Immutable public cwKAIA;
    MockToken public usdt;
    MockToken public wKAIA;
    StablecoinJumpRateModel public stableRateModel;
    CollateralRateModel public collateralRateModel; 

    address public admin = address(0x1);
    address public alice = address(0x2);
    address public bob = address(0x3);
    address public charlie = address(0x4);
    address public liquidator = address(0x5);
    
    uint256 public constant INITIAL_EXCHANGE_RATE = 0.2e18;
    
    function setUp() public {
        vm.startPrank(admin);
        
        // Deploy full system
        deploySystem();
        configureSystem();
        
        vm.stopPrank();
        
        // Fund users
        fundUsers();
    }

    function deploySystem() internal {
        // Deploy core
        comptroller = new Comptroller();
        oracle = new KiloPriceOracle();
        
        // Deploy tokens
        usdt = new MockToken("Tether USD", "USDT", 6, 10000000e6);
        wKAIA = new MockToken("Wrapped KAIA", "wKAIA", 18, 1000000e18);
        
        // Deploy rate models
        stableRateModel = new StablecoinJumpRateModel();
        collateralRateModel = new CollateralRateModel();
        
        // Deploy cTokens
        cUSDT = new CErc20Immutable(
            address(usdt), ComptrollerInterface(address(comptroller)),
            InterestRateModel(address(stableRateModel)), INITIAL_EXCHANGE_RATE,
            "Compound USDT", "cUSDT", 8, payable(admin)
        );
        
        cwKAIA = new CErc20Immutable(
            address(wKAIA), ComptrollerInterface(address(comptroller)),
            InterestRateModel(address(collateralRateModel)), INITIAL_EXCHANGE_RATE,
            "Compound wKAIA", "cwKAIA", 8, payable(admin)
        );
    }

    function configureSystem() internal {
        // Set oracle prices
        oracle.setDirectPrice(address(usdt), 1e18); // $1  
        oracle.setDirectPrice(address(wKAIA), 0.15e18); // $0.15
        
        // Configure comptroller
        comptroller._setPriceOracle(PriceOracle(address(oracle)));
        comptroller._supportMarket(CToken(address(cUSDT)));
        comptroller._supportMarket(CToken(address(cwKAIA)));
        comptroller._setCloseFactor(5e17);
        comptroller._setLiquidationIncentive(108e16);
        comptroller._setCollateralFactor(CToken(address(cUSDT)), 0.85e18);
        comptroller._setCollateralFactor(CToken(address(cwKAIA)), 0.75e18);
        
        // Set borrow caps
        CToken[] memory cTokens = new CToken[](2);
        uint[] memory borrowCaps = new uint[](2);
        cTokens[0] = CToken(address(cUSDT));
        cTokens[1] = CToken(address(cwKAIA));
        borrowCaps[0] = 1000000e6;
        borrowCaps[1] = 100000e18;
        comptroller._setMarketBorrowCaps(cTokens, borrowCaps);
    }

    function fundUsers() internal {
        vm.startPrank(admin);
        
        usdt.mint(alice, 100000e6);
        usdt.mint(bob, 100000e6);
        usdt.mint(charlie, 100000e6);
        usdt.mint(liquidator, 200000e6);
        
        wKAIA.mint(alice, 1000e18);
        wKAIA.mint(bob, 1000e18);
        wKAIA.mint(charlie, 1000e18);
        wKAIA.mint(liquidator, 2000e18);
        
        vm.stopPrank();
    }

    function testSingleMarket() public {
        // Complete end-to-end system test
        
        // 1. Multi-user market participation
        simulateMarketActivity();
        
        // 2. Interest accrual over time
        simulateTimeProgression();
        
        // 3. Price volatility and liquidations
        simulateMarketVolatility();
        
        // 4. System recovery and stability
        verifySystemStability();
         
    }

    function simulateMarketActivity() internal {
         // Admin supplies assets
        vm.startPrank(admin);
        address[] memory markets_admin = new address[](1);
        markets_admin[0] = address(cwKAIA);
        comptroller.enterMarkets(markets_admin); 
        wKAIA.approve(address(cwKAIA), 50000e18);
        cwKAIA.mint(50000e18);
        vm.stopPrank();

        // Alice supplies USDT and borrows stKAIA
        vm.startPrank(alice);
        address[] memory markets = new address[](2);
        markets[0] = address(cUSDT);
        markets[1] = address(cwKAIA);
        comptroller.enterMarkets(markets);
    
        usdt.approve(address(cUSDT), 50000e6);
        cUSDT.mint(50000e6);
  
        cwKAIA.borrow(20000e18);
        vm.stopPrank();

        // Bob supplies stKAIA and borrows USDT
        vm.startPrank(bob);
        comptroller.enterMarkets(markets);
        wKAIA.mint( bob, 10000e18);
        wKAIA.approve(address(cwKAIA), 10000e18);
        cwKAIA.mint(10000e18);
        cUSDT.borrow(300e6);
        vm.stopPrank();
        
        // Charlie provides liquidity to both markets
        vm.startPrank(charlie);
        comptroller.enterMarkets(markets);
        usdt.approve(address(cUSDT), 30000e6);
        wKAIA.approve(address(cwKAIA), 200e18);
        cUSDT.mint(30000e6);
        cwKAIA.mint(200e18);
        vm.stopPrank();
        
        // Verify market states
        assertGt(cUSDT.totalSupply(), 0);
        assertGt(cwKAIA.totalSupply(), 0);
        assertGt(cUSDT.totalBorrows(), 0);
        assertGt(cwKAIA.totalBorrows(), 0);
    }

    function simulateTimeProgression() internal {
        uint bobBorrowBefore = cUSDT.borrowBalanceCurrent(bob);
        
        // Advance time by 6 months
        uint initialBlock = block.number;
        vm.roll(initialBlock + 15768000);
        
        // Accrue interest
        cUSDT.accrueInterest();
        
        uint bobBorrowAfter = cUSDT.borrowBalanceCurrent(bob);
        
        // Interest should have accrued
        assertGt(bobBorrowAfter, bobBorrowBefore);
        
        // Partial repayments  
        vm.startPrank(bob);
        usdt.approve(address(cUSDT), 100e6);
        cUSDT.repayBorrow(100e6);
        vm.stopPrank();
    }

    function simulateMarketVolatility() internal {
        // Crash wKAIA price to trigger liquidations
        vm.prank(admin);
        oracle.setDirectPrice(address(wKAIA), 8e17); // Down to $0.80
        
        // Check if Alice is liquidatable
        (uint error, uint liquidity, uint shortfall) = comptroller.getAccountLiquidity(alice);
        assertEq(error, 0);
        
        if (shortfall > 0) {
            // Liquidate Alice
            vm.startPrank(liquidator);
            uint repayAmount = cwKAIA.borrowBalanceCurrent(alice) / 2; // 50% due to close factor
            wKAIA.approve(address(cwKAIA), repayAmount);
            
            uint result = cwKAIA.liquidateBorrow(
                alice,
                repayAmount,
                CTokenInterface(address(cUSDT))
            );
            
            assertEq(result, 0);
            assertGt(cUSDT.balanceOf(liquidator), 0);
            vm.stopPrank();
        }
        
        // Recover price
        vm.prank(admin);
        oracle.setDirectPrice(address(wKAIA), 14e17); // $1.40
    }

    function verifySystemStability() internal {
        // Check all markets are still functional
        
        // New user can still interact
        address newUser = address(0x999);
        vm.startPrank(admin);
        usdt.transfer(newUser, 10000e6);
        vm.stopPrank();
        
        vm.startPrank(newUser);
        address[] memory markets = new address[](1);
        markets[0] = address(cUSDT);
        comptroller.enterMarkets(markets);
        
        usdt.approve(address(cUSDT), 5000e6);
        uint result = cUSDT.mint(5000e6);
        assertEq(result, 0);
        
        vm.stopPrank();
        
        // Check system invariants
        assertGe(cUSDT.getCash() + cUSDT.totalBorrows(), cUSDT.totalReserves());
        assertGe(cwKAIA.getCash() + cwKAIA.totalBorrows(), cwKAIA.totalReserves());
        
        // Verify exchange rates are reasonable
        uint usdtExchangeRate = cUSDT.exchangeRateStored();
        uint wKAIAExchangeRate = cwKAIA.exchangeRateStored();
        
        assertGe(usdtExchangeRate, INITIAL_EXCHANGE_RATE);
        assertGe(wKAIAExchangeRate, INITIAL_EXCHANGE_RATE);
    }
    
    function testEmergencyScenarios() public {
        // Test pause functionality
        vm.startPrank(admin);
        comptroller._setPauseGuardian(admin);
        comptroller._setMintPaused(CToken(address(cUSDT)), true);
        comptroller._setBorrowPaused(CToken(address(cwKAIA)), true);
        vm.stopPrank();
        
        // Verify paused operations fail
        vm.startPrank(alice);
        usdt.approve(address(cUSDT), 1000e6);
        vm.expectRevert("mint is paused");
        cUSDT.mint(1000e6); 
        
        vm.expectRevert("market borrow cap reached");
        cUSDT.borrow(100e18);
        vm.stopPrank();
        
        // Unpause
        vm.startPrank(admin);
        comptroller._setMintPaused(CToken(address(cUSDT)), false);
        comptroller._setBorrowPaused(CToken(address(cUSDT)), false);
        vm.stopPrank();
        
        // Verify operations work again
        vm.startPrank(alice);
        uint mintResult2 = cUSDT.mint(1000e6);
        assertEq(mintResult2, 0); // Should succeed
        vm.stopPrank();
         
    }

}