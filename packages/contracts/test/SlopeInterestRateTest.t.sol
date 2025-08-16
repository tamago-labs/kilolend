// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {InterestRateModel} from "../src/InterestRateModel.sol";
import {USDTMarket} from "../src/USDTMarket.sol";
import {PriceOracle} from "../src/PriceOracle.sol";
import {MockPriceOracle} from "../src/mocks/MockOracle.sol";
import {MockToken} from "../src/mocks/MockToken.sol";

contract SlopeInterestRateTest is Test {
    
    // Contracts
    InterestRateModel public interestModel;
    USDTMarket public usdtMarket;
    PriceOracle public priceOracle;
    MockPriceOracle public mockOracle;
    
    // Tokens
    MockToken public wkaia;
    MockToken public stkaia;
    MockToken public usdt;
    
    // Test accounts
    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob"); 
    
    // Interest Rate Model Constants (from contract)
    uint256 public constant BASE_RATE_BPS = 100;           // 1% APY
    uint256 public constant OPTIMAL_RATE_BPS = 800;        // 8% APY
    uint256 public constant MAX_RATE_BPS = 2500;           // 25% APY
    uint256 public constant OPTIMAL_UTILIZATION_BPS = 8000; // 80% utilization
    uint256 public constant RESERVE_FACTOR_BPS = 1000;     // 10% reserve factor
    uint256 public constant BPS_BASE = 10000;
    
    function setUp() public {
        // Deploy interest rate model
        interestModel = new InterestRateModel();
        
        // Deploy tokens
        wkaia = new MockToken("Wrapped KAIA", "WKAIA", 18, 1000000e18);
        stkaia = new MockToken("Staked KAIA", "stKAIA", 18, 500000e18);
        usdt = new MockToken("USD Tether", "USDT", 6, 100000e6);
        
        // Deploy oracle system
        mockOracle = new MockPriceOracle(address(wkaia), 0.15e18);
        priceOracle = new PriceOracle(
            address(0),
            address(mockOracle),
            address(wkaia),
            address(usdt)
        );
        
        // Set prices
        mockOracle.setPrice(address(wkaia), 0.15e18);
        mockOracle.setPrice(address(usdt), 1e18);
        mockOracle.setStKaiaExchangeRate(1.05e18);
        
        // Deploy USDT market for integration tests
        usdtMarket = new USDTMarket(
            address(wkaia),
            address(stkaia),
            address(usdt),
            address(priceOracle),
            address(interestModel)
        );
        
        // Setup test balances
        wkaia.transfer(alice, 100000e18);  // Give Alice more WKAIA
        stkaia.transfer(alice, 50000e18);
        usdt.transfer(alice, 50000e6);     // Give Alice more USDT
        
        wkaia.transfer(bob, 100000e18);    // Give Bob more WKAIA
        usdt.transfer(bob, 50000e6);       // Give Bob more USDT
         
    }
    
    // ============ Basic Interest Rate Model Tests ============
    
    function test_BaseRate() public {
        // At 0% utilization, should return base rate
        uint256 utilization = 0;
        uint256 borrowRate = interestModel.getBorrowRate(utilization);
        
        uint256 expectedRate = BASE_RATE_BPS * 1e18 / BPS_BASE; // Convert to 18 decimals
        assertEq(borrowRate, expectedRate);
        
        console.log("Base rate (0% utilization):", borrowRate);
        console.log("Expected rate:", expectedRate);
    }
    
    function test_OptimalRate() public {
        // At 80% utilization (optimal), should return optimal rate
        uint256 utilization = OPTIMAL_UTILIZATION_BPS * 1e18 / BPS_BASE; // 80% in 18 decimals
        uint256 borrowRate = interestModel.getBorrowRate(utilization);
        
        uint256 expectedRate = OPTIMAL_RATE_BPS * 1e18 / BPS_BASE; // Convert to 18 decimals
        assertEq(borrowRate, expectedRate);
        
        console.log("Optimal rate (80% utilization):", borrowRate);
        console.log("Expected rate:", expectedRate);
    }
    
    function test_MaxRate() public {
        // At 100% utilization, should return max rate
        uint256 utilization = 1e18; // 100% utilization
        uint256 borrowRate = interestModel.getBorrowRate(utilization);
        
        uint256 expectedRate = MAX_RATE_BPS * 1e18 / BPS_BASE; // Convert to 18 decimals
        assertEq(borrowRate, expectedRate);
        
        console.log("Max rate (100% utilization):", borrowRate);
        console.log("Expected rate:", expectedRate);
    }
    
    function test_RateProgression() public {
        uint256[] memory utilizationPoints = new uint256[](11);
        utilizationPoints[0] = 0;           // 0%
        utilizationPoints[1] = 0.1e18;      // 10%
        utilizationPoints[2] = 0.2e18;      // 20%
        utilizationPoints[3] = 0.3e18;      // 30%
        utilizationPoints[4] = 0.4e18;      // 40%
        utilizationPoints[5] = 0.5e18;      // 50%
        utilizationPoints[6] = 0.6e18;      // 60%
        utilizationPoints[7] = 0.7e18;      // 70%
        utilizationPoints[8] = 0.8e18;      // 80% (optimal)
        utilizationPoints[9] = 0.9e18;      // 90%
        utilizationPoints[10] = 1.0e18;     // 100%
        
        console.log("=== Interest Rate Progression ===");
        console.log("Utilization% | Borrow Rate% | Supply Rate%");
        
        for (uint256 i = 0; i < utilizationPoints.length; i++) {
            uint256 utilization = utilizationPoints[i];
            uint256 borrowRate = interestModel.getBorrowRate(utilization);
            uint256 supplyRate = interestModel.getSupplyRate(utilization, borrowRate);
            
            // Convert to percentage for display
            uint256 utilizationPercent = utilization * 100 / 1e18;
            uint256 borrowRatePercent = borrowRate * 100 / 1e18;
            uint256 supplyRatePercent = supplyRate * 100 / 1e18;
            
            console.log(utilizationPercent, borrowRatePercent, supplyRatePercent);
        }
    }
    
    // ============ Slope Testing ============
    
    function test_Slope1() public {
        // Test slope 1 (0% to 80% utilization)
        uint256 utilization40 = 0.4e18; // 40% utilization
        uint256 rate40 = interestModel.getBorrowRate(utilization40);
        
        // Should be halfway between base rate (1%) and optimal rate (8%)
        // Expected: 1% + (40/80) * (8% - 1%) = 1% + 0.5 * 7% = 4.5%
        uint256 expectedRate = (BASE_RATE_BPS + (4000 * (OPTIMAL_RATE_BPS - BASE_RATE_BPS) / OPTIMAL_UTILIZATION_BPS)) * 1e18 / BPS_BASE;
        
        assertApproxEqRel(rate40, expectedRate, 0.01e18); // 1% tolerance
        
        console.log("40% utilization rate:", rate40);
        console.log("Expected rate:", expectedRate);
    }
    
    function test_Slope2() public {
        // Test slope 2 (80% to 100% utilization)
        uint256 utilization90 = 0.9e18; // 90% utilization
        uint256 rate90 = interestModel.getBorrowRate(utilization90);
        
        // Should be halfway between optimal rate (8%) and max rate (25%)
        // 90% utilization = 50% through the second slope
        // Expected: 8% + 0.5 * (25% - 8%) = 8% + 8.5% = 16.5%
        uint256 expectedRate = (OPTIMAL_RATE_BPS + (1000 * (MAX_RATE_BPS - OPTIMAL_RATE_BPS) / (BPS_BASE - OPTIMAL_UTILIZATION_BPS))) * 1e18 / BPS_BASE;
        
        assertApproxEqRel(rate90, expectedRate, 0.01e18); // 1% tolerance
        
        console.log("90% utilization rate:", rate90);
        console.log("Expected rate:", expectedRate);
    }
    
    // ============ Supply Rate Tests ============
    
    function test_SupplyRate() public {
        uint256 utilization = 0.8e18; // 80% utilization
        uint256 borrowRate = interestModel.getBorrowRate(utilization);
        uint256 supplyRate = interestModel.getSupplyRate(utilization, borrowRate);
        
        // Supply rate = utilization * borrowRate * (1 - reserveFactor)
        // Expected: 80% * 8% * (1 - 10%) = 80% * 8% * 90% = 5.76%
        uint256 expectedSupplyRate = utilization * borrowRate * (BPS_BASE - RESERVE_FACTOR_BPS) / (1e18 * BPS_BASE);
        
        assertEq(supplyRate, expectedSupplyRate);
        
        console.log("Supply rate at 80% utilization:", supplyRate);
        console.log("Expected supply rate:", expectedSupplyRate);
        console.log("Borrow rate:", borrowRate);
    }
    
    function test_SupplyRateZeroUtilization() public {
        uint256 utilization = 0;
        uint256 borrowRate = interestModel.getBorrowRate(utilization);
        uint256 supplyRate = interestModel.getSupplyRate(utilization, borrowRate);
        
        // At 0% utilization, supply rate should be 0
        assertEq(supplyRate, 0);
        
        console.log("Supply rate at 0% utilization:", supplyRate);
    }
    
    // ============ Real Market Integration Tests ============
    
    function test_MarketUtilizationRate() public {
        // Start with no utilization
        assertEq(usdtMarket.getUtilizationRate(), 0);
        
        vm.startPrank(alice);
        
        // Alice supplies 1000 USDT
        usdt.approve(address(usdtMarket), 1000e6);
        usdtMarket.supplyStablecoin(1000e6);
        
        // Still 0% utilization (no borrowing yet)
        assertEq(usdtMarket.getUtilizationRate(), 0);
        
        // Alice deposits collateral and borrows 500 USDT
        wkaia.approve(address(usdtMarket), 10000e18); // Reasonable amount
        usdtMarket.depositWKaiaCollateral(10000e18);
        
        usdtMarket.borrowStablecoin(500e6);
        
        // Now should be 50% utilization (500 borrowed / 1000 supplied)
        uint256 utilizationRate = usdtMarket.getUtilizationRate();
        uint256 expectedUtilization = 0.5e18; // 50%
        
        assertEq(utilizationRate, expectedUtilization);
        
        console.log("Market utilization rate:", utilizationRate);
        console.log("Expected utilization:", expectedUtilization);
        
        vm.stopPrank();
    }
    
    function test_MarketInterestRates() public {
        vm.startPrank(alice);
        
        // Setup market with 80% utilization
        usdt.approve(address(usdtMarket), 1000e6);
        usdtMarket.supplyStablecoin(1000e6);
        
        wkaia.approve(address(usdtMarket), 15000e18); // Reasonable amount
        usdtMarket.depositWKaiaCollateral(15000e18);
        
        usdtMarket.borrowStablecoin(800e6); // 80% utilization
        
        vm.stopPrank();
        
        uint256 utilization = usdtMarket.getUtilizationRate();
        assertEq(utilization, 0.8e18); // 80%
        
        // Get the interest rates
        uint256 borrowRate = interestModel.getBorrowRate(utilization);
        uint256 supplyRate = interestModel.getSupplyRate(utilization, borrowRate);
        
        // At 80% utilization (optimal point)
        uint256 expectedBorrowRate = OPTIMAL_RATE_BPS * 1e18 / BPS_BASE; // 8%
        uint256 expectedSupplyRate = utilization * borrowRate * (BPS_BASE - RESERVE_FACTOR_BPS) / (1e18 * BPS_BASE);
        
        assertEq(borrowRate, expectedBorrowRate);
        assertEq(supplyRate, expectedSupplyRate);
        
        console.log("Market borrow rate at 80% utilization:", borrowRate);
        console.log("Market supply rate at 80% utilization:", supplyRate);
    }
    
    function test_DynamicUtilizationChanges() public {
        vm.startPrank(alice);
        
        // Start with some supply
        usdt.approve(address(usdtMarket), 1000e6);
        usdtMarket.supplyStablecoin(1000e6);
        
        wkaia.approve(address(usdtMarket), 10000e18); // Reasonable amount
        usdtMarket.depositWKaiaCollateral(10000e18);
        
        vm.stopPrank();
        
        // Setup Bob with collateral
        vm.startPrank(bob);
        wkaia.approve(address(usdtMarket), 10000e18);
        usdtMarket.depositWKaiaCollateral(10000e18);
        vm.stopPrank();
        
        // Test different utilization levels (smaller amounts)
        uint256[] memory borrowAmounts = new uint256[](3);
        borrowAmounts[0] = 100e6;  // 10% utilization
        borrowAmounts[1] = 200e6;  // 20% utilization  
        borrowAmounts[2] = 300e6;  // 30% utilization
        
        console.log("=== Dynamic Utilization Testing ===");
        console.log("Borrow Amount | Utilization% | Borrow Rate% | Supply Rate%");
        
        for (uint256 i = 0; i < borrowAmounts.length; i++) {
            // Bob borrows different amounts to test utilization
            vm.startPrank(bob);
            
            if (i > 0) {
                // Repay previous borrow
                uint256 currentDebt = usdtMarket.getBorrowBalance(bob);
                if (currentDebt > 0) {
                    usdt.approve(address(usdtMarket), currentDebt);
                    usdtMarket.repayStablecoin(currentDebt);
                }
            }
            
            // Borrow new amount
            usdtMarket.borrowStablecoin(borrowAmounts[i]);
            
            vm.stopPrank();
            
            // Check new rates
            uint256 utilization = usdtMarket.getUtilizationRate();
            uint256 borrowRate = interestModel.getBorrowRate(utilization);
            uint256 supplyRate = interestModel.getSupplyRate(utilization, borrowRate);
            
            // Convert to percentages for display
            uint256 utilizationPercent = utilization * 100 / 1e18;
            uint256 borrowRatePercent = borrowRate * 100 / 1e18;
            uint256 supplyRatePercent = supplyRate * 100 / 1e18;
            
            console.log(borrowAmounts[i], utilizationPercent, borrowRatePercent, supplyRatePercent);
        }
    }
    
    // ============ Edge Cases ============
    
    function test_ZeroUtilization() public {
        uint256 utilization = 0;
        uint256 borrowRate = interestModel.getBorrowRate(utilization);
        uint256 supplyRate = interestModel.getSupplyRate(utilization, borrowRate);
        
        // At 0% utilization
        uint256 expectedBorrowRate = BASE_RATE_BPS * 1e18 / BPS_BASE; // 1%
        uint256 expectedSupplyRate = 0; // No supply rate with no utilization
        
        assertEq(borrowRate, expectedBorrowRate);
        assertEq(supplyRate, expectedSupplyRate);
    }
    
    function test_ExtremeUtilization() public {
        // Test beyond 100% utilization (edge case)
        uint256 utilization = 1.2e18; // 120% utilization
        uint256 borrowRate = interestModel.getBorrowRate(utilization);
        
        // Should be even higher than max rate
        assertGt(borrowRate, MAX_RATE_BPS * 1e18 / BPS_BASE);
        
        console.log("Borrow rate at 120% utilization:", borrowRate);
    }
    
    function test_ReserveFactor() public {
        uint256 utilization = 0.5e18; // 50% utilization
        uint256 borrowRate = interestModel.getBorrowRate(utilization);
        uint256 supplyRate = interestModel.getSupplyRate(utilization, borrowRate);
        
        // Calculate expected supply rate with reserve factor
        uint256 expectedSupplyRate = utilization * borrowRate * (BPS_BASE - RESERVE_FACTOR_BPS) / (1e18 * BPS_BASE);
        
        assertEq(supplyRate, expectedSupplyRate);
        
        // Verify reserve factor is being applied (supply rate < utilization * borrow rate)
        uint256 maxPossibleSupplyRate = utilization * borrowRate / 1e18;
        assertLt(supplyRate, maxPossibleSupplyRate);
        
        console.log("Borrow rate:", borrowRate);
        console.log("Supply rate:", supplyRate);
        console.log("Max possible supply rate (without reserve):", maxPossibleSupplyRate);
    }
     
}