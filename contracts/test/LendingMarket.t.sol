// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {USDTMarket} from "../src/USDTMarket.sol";
import {KRWMarket} from "../src/KRWMarket.sol";
import {PriceOracle} from "../src/PriceOracle.sol";
import {MockPriceOracle} from "../src/mocks/MockOracle.sol";
import {InterestRateModel} from "../src/InterestRateModel.sol";
import {MockToken} from "../src/mocks/MockToken.sol";

contract LendingMarketTest is Test {
    
    // Contracts
    USDTMarket public usdtMarket;
    KRWMarket public krwMarket;
    PriceOracle public priceOracle;
    MockPriceOracle public mockOracle;
    InterestRateModel public interestModel;
    
    // Tokens
    MockToken public wkaia;
    MockToken public stkaia;
    MockToken public usdt;
    MockToken public krw;
    
    // Test accounts
    address public owner = address(this);
    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");
    address public charlie = makeAddr("charlie");
    
    // Constants
    uint256 public constant INITIAL_WKAIA_PRICE = 0.15e18;  // $0.15
    uint256 public constant INITIAL_USDT_PRICE = 1e18;      // $1.00
    uint256 public constant INITIAL_STKAIA_RATE = 1.05e18;  // 1 stKAIA = 1.05 KAIA
    uint256 public constant INITIAL_USD_KRW_RATE = 1300e18; // 1 USD = 1300 KRW
    
    uint256 public constant WKAIA_SUPPLY = 1000000e18;      // 1M WKAIA
    uint256 public constant STKAIA_SUPPLY = 500000e18;      // 500K stKAIA
    uint256 public constant USDT_SUPPLY = 100000e6;         // 100K USDT
    uint256 public constant KRW_SUPPLY = 130000000e18;      // 130M KRW
    
    function setUp() public {
        // Deploy tokens
        wkaia = new MockToken("Wrapped KAIA", "WKAIA", 18, WKAIA_SUPPLY);
        stkaia = new MockToken("Staked KAIA", "stKAIA", 18, STKAIA_SUPPLY);
        usdt = new MockToken("USD Tether", "USDT", 6, USDT_SUPPLY);
        krw = new MockToken("KRW Stablecoin", "KRW", 18, KRW_SUPPLY);
        
        // Deploy oracle system
        mockOracle = new MockPriceOracle(
            address(wkaia),
            INITIAL_WKAIA_PRICE
        );
        priceOracle = new PriceOracle(
            address(0), // No Pyth oracle in tests
            address(mockOracle),
            address(wkaia),
            address(usdt)
        );
        
        // Set initial prices
        mockOracle.setPrice(address(wkaia), INITIAL_WKAIA_PRICE);
        mockOracle.setPrice(address(usdt), INITIAL_USDT_PRICE);
        mockOracle.setStKaiaExchangeRate(INITIAL_STKAIA_RATE); 
        
        // Deploy interest rate model
        interestModel = new InterestRateModel();
        
        // Deploy markets
        usdtMarket = new USDTMarket(
            address(wkaia),
            address(stkaia),
            address(usdt),
            address(priceOracle),
            address(interestModel)
        );
        
        krwMarket = new KRWMarket(
            address(wkaia),
            address(stkaia),
            address(krw),
            address(priceOracle),
            address(interestModel)
        );
        
        // Setup token balances for test accounts
        _setupTestBalances();
    }
    
    function _setupTestBalances() internal {
        // Give Alice tokens
        wkaia.transfer(alice, 10000e18);    // 10K WKAIA
        stkaia.transfer(alice, 5000e18);    // 5K stKAIA
        usdt.transfer(alice, 10000e6);      // 10K USDT
        krw.transfer(alice, 13000000e18);   // 13M KRW
        
        // Give Bob tokens
        wkaia.transfer(bob, 5000e18);       // 5K WKAIA
        stkaia.transfer(bob, 2500e18);      // 2.5K stKAIA
        usdt.transfer(bob, 5000e6);         // 5K USDT
        krw.transfer(bob, 6500000e18);      // 6.5M KRW
        
        // Give Charlie tokens (for liquidation tests)
        usdt.transfer(charlie, 20000e6);    // 20K USDT
        krw.transfer(charlie, 26000000e18); // 26M KRW
    }
    
    // ============ Collateral Tests ============
     
    
    function test_DepositWKaiaCollateral() public {
        uint256 depositAmount = 1000e18;
        
        vm.startPrank(alice);
        wkaia.approve(address(usdtMarket), depositAmount);
        
        uint256 balanceBefore = wkaia.balanceOf(alice);
        usdtMarket.depositWKaiaCollateral(depositAmount);
        uint256 balanceAfter = wkaia.balanceOf(alice);
        
        assertEq(balanceBefore - balanceAfter, depositAmount);
        
        (uint256 wkaiaAmount, uint256 stKaiaAmount,) = usdtMarket.userCollateral(alice);
        assertEq(wkaiaAmount, depositAmount);
        assertEq(stKaiaAmount, 0);
        vm.stopPrank();
    }
    
    function test_DepositStKaiaCollateral() public {
        uint256 depositAmount = 500e18;
        
        vm.startPrank(alice);
        stkaia.approve(address(usdtMarket), depositAmount);
        
        uint256 balanceBefore = stkaia.balanceOf(alice);
        usdtMarket.depositStKaiaCollateral(depositAmount);
        uint256 balanceAfter = stkaia.balanceOf(alice);
        
        assertEq(balanceBefore - balanceAfter, depositAmount);
        
        (uint256 wkaiaAmount, uint256 stKaiaAmount,) = usdtMarket.userCollateral(alice);
        assertEq(wkaiaAmount, 0);
        assertEq(stKaiaAmount, depositAmount);
        vm.stopPrank();
    }
    
    function test_WithdrawWKaiaCollateral() public {
        uint256 depositAmount = 1000e18;
        uint256 withdrawAmount = 300e18;
        
        vm.startPrank(alice);
        wkaia.approve(address(usdtMarket), depositAmount);
        usdtMarket.depositWKaiaCollateral(depositAmount);
        
        uint256 balanceBefore = wkaia.balanceOf(alice);
        usdtMarket.withdrawWKaiaCollateral(withdrawAmount);
        uint256 balanceAfter = wkaia.balanceOf(alice);
        
        assertEq(balanceAfter - balanceBefore, withdrawAmount);
        
        (uint256 wkaiaAmount,,) = usdtMarket.userCollateral(alice);
        assertEq(wkaiaAmount, depositAmount - withdrawAmount);
        vm.stopPrank();
    }
    
    function test_RevertInsufficientCollateral() public {
        uint256 depositAmount = 1000e18;
        uint256 withdrawAmount = 1500e18; // More than deposited
        
        vm.startPrank(alice);
        wkaia.approve(address(usdtMarket), depositAmount);
        usdtMarket.depositWKaiaCollateral(depositAmount);
        
        vm.expectRevert("Insufficient collateral");
        usdtMarket.withdrawWKaiaCollateral(withdrawAmount);
        vm.stopPrank();
    }
    
    // ============ Supply Tests ============
 
    
    function test_SupplyUSDT() public {
        uint256 supplyAmount = 1000e6;
        
        vm.startPrank(alice);
        usdt.approve(address(usdtMarket), supplyAmount);
        
        uint256 balanceBefore = usdt.balanceOf(alice);
        usdtMarket.supplyStablecoin(supplyAmount);  // Test convenience function
        uint256 balanceAfter = usdt.balanceOf(alice);
        
        assertEq(balanceBefore - balanceAfter, supplyAmount);
        assertEq(usdtMarket.getUserSupplyBalance(alice), supplyAmount);
        assertEq(usdtMarket.totalStablecoinSupplied(), supplyAmount);
        vm.stopPrank();
    }
    
    function test_SupplyKRW() public {
        uint256 supplyAmount = 1300000e18; // 1.3M KRW (~$1000)
        
        vm.startPrank(alice);
        krw.approve(address(krwMarket), supplyAmount);
        
        uint256 balanceBefore = krw.balanceOf(alice);
        krwMarket.supplyStablecoin(supplyAmount);
        uint256 balanceAfter = krw.balanceOf(alice);
        
        assertEq(balanceBefore - balanceAfter, supplyAmount);
        assertEq(krwMarket.getUserSupplyBalance(alice), supplyAmount);
        assertEq(krwMarket.totalStablecoinSupplied(), supplyAmount);
        vm.stopPrank();
    }

    function test_WithdrawStablecoin() public {
        uint256 supplyAmount = 1000e6;
        uint256 withdrawAmount = 300e6;
        
        vm.startPrank(alice);
        usdt.approve(address(usdtMarket), supplyAmount);
        usdtMarket.supplyStablecoin(supplyAmount);
        
        uint256 balanceBefore = usdt.balanceOf(alice);
        usdtMarket.withdrawStablecoin(withdrawAmount);
        uint256 balanceAfter = usdt.balanceOf(alice);
        
        assertEq(balanceAfter - balanceBefore, withdrawAmount);
        assertEq(usdtMarket.getUserSupplyBalance(alice), supplyAmount - withdrawAmount);
        vm.stopPrank();
    }
    
    // ============ Borrow Tests ============
    
    function test_BorrowStablecoin() public {
        uint256 collateralAmount = 1000e18; // 1000 WKAIA = $150
        uint256 borrowAmount = 50e6;        // $50 USDT (33% LTV)
        
        vm.startPrank(alice);
        
        // First, someone needs to supply liquidity
        usdt.approve(address(usdtMarket), 1000e6);
        usdtMarket.supplyStablecoin(1000e6);
        
        // Deposit collateral
        wkaia.approve(address(usdtMarket), collateralAmount);
        usdtMarket.depositWKaiaCollateral(collateralAmount);
        
        // Check max borrow amount
        uint256 maxBorrow = usdtMarket.getMaxBorrowAmount(alice);
        console.log("Max borrow amount:", maxBorrow);
        assertGt(maxBorrow, borrowAmount);
        
        // Borrow using base function
        uint256 balanceBefore = usdt.balanceOf(alice);
        usdtMarket.borrowStablecoin(borrowAmount);
        uint256 balanceAfter = usdt.balanceOf(alice);
        
        assertEq(balanceAfter - balanceBefore, borrowAmount);
        assertEq(usdtMarket.getBorrowBalance(alice), borrowAmount);
        assertEq(usdtMarket.totalStablecoinBorrowed(), borrowAmount);
        
        vm.stopPrank();
    }

    function test_BorrowUSDT() public {
        uint256 collateralAmount = 1000e18; // 1000 WKAIA = $150
        uint256 borrowAmount = 50e6;        // $50 USDT (33% LTV)
        
        vm.startPrank(alice);
        
        // Setup liquidity and collateral
        usdt.approve(address(usdtMarket), 1000e6);
        usdtMarket.supplyStablecoin(1000e6);
        
        wkaia.approve(address(usdtMarket), collateralAmount);
        usdtMarket.depositWKaiaCollateral(collateralAmount);
        
        // Borrow using convenience function
        uint256 balanceBefore = usdt.balanceOf(alice);
        usdtMarket.borrowStablecoin(borrowAmount);
        uint256 balanceAfter = usdt.balanceOf(alice);
        
        assertEq(balanceAfter - balanceBefore, borrowAmount);
        assertEq(usdtMarket.getBorrowBalance(alice), borrowAmount);
        assertEq(usdtMarket.totalStablecoinBorrowed(), borrowAmount);
        
        vm.stopPrank();
    }
    
    function test_BorrowKRW() public {
        uint256 collateralAmount = 1000e18; // 1000 WKAIA = $150
        uint256 borrowAmount = 65000e18;    // 65K KRW (~$50)
        
        vm.startPrank(alice);
        
        // Supply liquidity
        krw.approve(address(krwMarket), 1300000e18);
        krwMarket.supplyStablecoin(1300000e18);
        
        // Deposit collateral
        wkaia.approve(address(krwMarket), collateralAmount);
        krwMarket.depositWKaiaCollateral(collateralAmount);
        
        // Borrow
        uint256 balanceBefore = krw.balanceOf(alice);
        krwMarket.borrowStablecoin(borrowAmount);
        uint256 balanceAfter = krw.balanceOf(alice);
        
        assertEq(balanceAfter - balanceBefore, borrowAmount);
        assertEq(krwMarket.getBorrowBalance(alice), borrowAmount);
        
        vm.stopPrank();
    }

    function test_RepayStablecoin() public {
        uint256 collateralAmount = 1000e18;
        uint256 borrowAmount = 50e6;
        uint256 repayAmount = 25e6;
        
        vm.startPrank(alice);
        
        // Setup: supply liquidity, deposit collateral, borrow
        usdt.approve(address(usdtMarket), 1000e6);
        usdtMarket.supplyStablecoin(1000e6);
        
        wkaia.approve(address(usdtMarket), collateralAmount);
        usdtMarket.depositWKaiaCollateral(collateralAmount);
        
        usdtMarket.borrowStablecoin(borrowAmount);
        
        // Repay using base function
        usdt.approve(address(usdtMarket), repayAmount);
        uint256 balanceBefore = usdt.balanceOf(alice);
        usdtMarket.repayStablecoin(repayAmount);
        uint256 balanceAfter = usdt.balanceOf(alice);
        
        assertEq(balanceBefore - balanceAfter, repayAmount);
        assertEq(usdtMarket.getBorrowBalance(alice), borrowAmount - repayAmount);
        
        vm.stopPrank();
    }
    
    // ============ Health Factor Tests ============
    
    function test_HealthyPosition() public {
        uint256 collateralAmount = 1000e18; // $150 collateral
        uint256 borrowAmount = 50e6;        // $50 borrow (33% LTV)
        
        vm.startPrank(alice);
        
        usdt.approve(address(usdtMarket), 1000e6);
        usdtMarket.supplyStablecoin(1000e6);
        
        wkaia.approve(address(usdtMarket), collateralAmount);
        usdtMarket.depositWKaiaCollateral(collateralAmount);
        
        usdtMarket.borrowStablecoin(borrowAmount);
        
        assertTrue(usdtMarket.isHealthy(alice));
        
        vm.stopPrank();
    }
    
    function test_UnhealthyPosition() public {
        uint256 collateralAmount = 1000e18; // $150 collateral
        uint256 borrowAmount = 85e6;        // $85 borrow (close to liquidation threshold)
        
        vm.startPrank(alice);
        
        usdt.approve(address(usdtMarket), 1000e6);
        usdtMarket.supplyStablecoin(1000e6);
        
        wkaia.approve(address(usdtMarket), collateralAmount);
        usdtMarket.depositWKaiaCollateral(collateralAmount);
        
        usdtMarket.borrowStablecoin(borrowAmount);

        vm.stopPrank();

        vm.startPrank(owner);
        
        // Price drop makes position unhealthy
        mockOracle.setPrice(address(wkaia), 0.05e18); // Price drops to $0.05
        
        assertFalse(usdtMarket.isHealthy(alice));
        
        vm.stopPrank();
    }
    
    // ============ Currency Conversion Tests ============
    
    function test_KRWConversions() public {
        uint256 usdAmount = 1000e18;     // $1000
        uint256 krwAmount = 1300000e18;  // 1.3M KRW
        
        // Test USD to KRW conversion
        uint256 convertedKRW = krwMarket.convertUSDToKRW(usdAmount);
        assertEq(convertedKRW, krwAmount);
        
        // Test KRW to USD conversion
        uint256 convertedUSD = krwMarket.convertKRWToUSD(krwAmount);
        assertEq(convertedUSD, usdAmount);
        
        console.log("USD to KRW:", convertedKRW);
        console.log("KRW to USD:", convertedUSD);
    }
    
    function test_USDTConversions() public {
        // For USDT market, conversions should be 1:1 with decimal adjustment
        uint256 usdAmount = 1000e18;     // $1000 (18 decimals)
        uint256 expectedUSDT = 1000e6;   // 1000 USDT (6 decimals)
        
        // Get max borrow amount which uses internal conversion
        vm.startPrank(alice);
        wkaia.approve(address(usdtMarket), 1000e18);
        usdtMarket.depositWKaiaCollateral(1000e18);
        
        uint256 maxBorrowUSDT = usdtMarket.getMaxBorrowAmount(alice);
        uint256 maxBorrowUSD = usdtMarket.getMaxBorrowAmountUSD(alice);
        
        // Should maintain 1:1 ratio with decimal adjustment
        assertEq(maxBorrowUSDT * 1e12, maxBorrowUSD); // Convert 6 decimals to 18 decimals
        
        vm.stopPrank();
    }
      
    
    // ============ Liquidation Tests ============
    
    function test_Liquidation() public {
        uint256 collateralAmount = 1000e18;
        uint256 borrowAmount = 80e6; // High borrow amount
        uint256 liquidationAmount = 25e6;
        
        vm.startPrank(alice);
        
        // Setup borrower position
        usdt.approve(address(usdtMarket), 1000e6);
        usdtMarket.supplyStablecoin(1000e6);
        
        wkaia.approve(address(usdtMarket), collateralAmount);
        usdtMarket.depositWKaiaCollateral(collateralAmount);
        
        usdtMarket.borrowStablecoin(borrowAmount);
        
        vm.stopPrank();

        vm.startPrank(owner);
        
        // Price drop makes position liquidatable
        mockOracle.setPrice(address(wkaia), 0.05e18); // Price drops
        
        assertFalse(usdtMarket.isHealthy(alice));

        vm.stopPrank();
        
        // Charlie liquidates
        vm.startPrank(charlie);
        usdt.approve(address(usdtMarket), liquidationAmount);
        
        uint256 charlieWKaiaBefore = wkaia.balanceOf(charlie);
        usdtMarket.liquidate(alice, liquidationAmount);
        uint256 charlieWKaiaAfter = wkaia.balanceOf(charlie);
        
        // Charlie should receive collateral
        assertGt(charlieWKaiaAfter, charlieWKaiaBefore);
        
        // Alice's debt should be reduced
        assertLt(usdtMarket.getBorrowBalance(alice), borrowAmount);
        
        vm.stopPrank();
    }
    
    // ============ Interest Accrual Tests ============
    
    function test_InterestAccrual() public {
        uint256 supplyAmount = 5000e6;
        uint256 borrowAmount = 100e6;
        
        vm.startPrank(alice);
        
        // Setup supply and borrow
        usdt.approve(address(usdtMarket), supplyAmount);
        usdtMarket.supplyStablecoin(supplyAmount);
        
        wkaia.approve(address(usdtMarket), 5000e18);
        usdtMarket.depositWKaiaCollateral(5000e18);
        
        usdtMarket.borrowStablecoin(borrowAmount);
        
        vm.stopPrank();
        
        // Check initial values
        uint256 initialBorrowBalance = usdtMarket.getBorrowBalance(alice);
        uint256 initialSupplyBalance = usdtMarket.getUserSupplyBalance(alice);
        
        // Advance time by 1 year
        vm.warp(block.timestamp + 365 days);
        
        // Accrue interest
        usdtMarket.accrueInterest();
        
        // Check that interest accrued
        uint256 finalBorrowBalance = usdtMarket.getBorrowBalance(alice);
        uint256 finalSupplyBalance = usdtMarket.getUserSupplyBalance(alice);
        
        assertGt(finalBorrowBalance, initialBorrowBalance);
        assertGt(finalSupplyBalance, initialSupplyBalance);
        
        console.log("Initial borrow:", initialBorrowBalance);
        console.log("Final borrow:", finalBorrowBalance);
        console.log("Initial supply:", initialSupplyBalance);
        console.log("Final supply:", finalSupplyBalance);
    }
    
    // ============ Utility Functions ============
    
    function test_GetCollateralValue() public {
        uint256 wkaiaAmount = 1000e18;  // 1000 WKAIA = $150
        uint256 stKaiaAmount = 500e18;  // 500 stKAIA = 525 KAIA = $78.75
        
        vm.startPrank(alice);
        
        wkaia.approve(address(usdtMarket), wkaiaAmount);
        usdtMarket.depositWKaiaCollateral(wkaiaAmount);
        
        stkaia.approve(address(usdtMarket), stKaiaAmount);
        usdtMarket.depositStKaiaCollateral(stKaiaAmount);
        
        uint256 totalValue = usdtMarket.getCollateralValue(alice);
        uint256 expectedValue = (wkaiaAmount * INITIAL_WKAIA_PRICE / 1e18) + 
                               (stKaiaAmount * INITIAL_STKAIA_RATE / 1e18 * INITIAL_WKAIA_PRICE / 1e18);
        
        assertEq(totalValue, expectedValue);
        
        vm.stopPrank();
    }
    
    function test_GetMaxBorrowAmount() public {
        uint256 wkaiaAmount = 1000e18;  // 1000 WKAIA = $150
        
        vm.startPrank(alice);
        
        wkaia.approve(address(usdtMarket), wkaiaAmount);
        usdtMarket.depositWKaiaCollateral(wkaiaAmount);
        
        uint256 maxBorrow = usdtMarket.getMaxBorrowAmount(alice);
        
        // Max borrow should be collateral value * LTV
        // $150 * 60% = $90 = 90e6 USDT
        uint256 expectedMaxBorrow = wkaiaAmount * INITIAL_WKAIA_PRICE * 6000 / (1e18 * 10000);
        expectedMaxBorrow = expectedMaxBorrow / 1e12; // Convert to USDT decimals
        
        assertEq(maxBorrow, expectedMaxBorrow);
        
        vm.stopPrank();
    }
}