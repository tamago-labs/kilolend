// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

/**
 * @title InterestRateModel
 * @dev Dual slope interest rate model similar to Compound/Aave
 * Features two different slopes before and after the optimal point
 */
contract InterestRateModel {
    
    // Base rate when utilization = 0 (100 bps = 1% APY)
    uint256 public constant BASE_RATE_BPS = 100;
    
    // Rate at 100% utilization (2500 bps = 25% APY)
    uint256 public constant MAX_RATE_BPS = 2500;
    
    // Optimal utilization point (8000 bps = 80%)
    uint256 public constant OPTIMAL_UTILIZATION_BPS = 8000;
    
    // Rate at optimal point (800 bps = 8% APY)
    uint256 public constant OPTIMAL_RATE_BPS = 800;
    
    // Reserve factor (1000 bps = 10% of interest goes to reserves)
    uint256 public constant RESERVE_FACTOR_BPS = 1000;
    
    uint256 private constant BPS_BASE = 10000;
    
    /**
     * @dev Calculate borrow rate based on utilization
     * @param utilization Current utilization rate (18 decimals, 1e18 = 100%)
     * @return borrowRate Annual borrow rate (18 decimals)
     */
    function getBorrowRate(uint256 utilization) external pure returns (uint256) {
        // Convert utilization from 1e18 to basis points for calculation
        uint256 utilizationBps = utilization * BPS_BASE / 1e18;
        
        if (utilizationBps <= OPTIMAL_UTILIZATION_BPS) {
            // Slope 1: Linear increase from BASE_RATE to OPTIMAL_RATE
            uint256 rateDiff = OPTIMAL_RATE_BPS - BASE_RATE_BPS;
            uint256 utilizationRatio = utilizationBps * BPS_BASE / OPTIMAL_UTILIZATION_BPS;
            uint256 rateBps = BASE_RATE_BPS + (rateDiff * utilizationRatio / BPS_BASE);
            
            // Convert back to 18 decimals
            return rateBps * 1e18 / BPS_BASE;
        } else {
            // Slope 2: Steeper increase from OPTIMAL_RATE to MAX_RATE
            uint256 excessUtilization = utilizationBps - OPTIMAL_UTILIZATION_BPS;
            uint256 excessRange = BPS_BASE - OPTIMAL_UTILIZATION_BPS;
            uint256 rateDiff = MAX_RATE_BPS - OPTIMAL_RATE_BPS;
            uint256 utilizationRatio = excessUtilization * BPS_BASE / excessRange;
            uint256 rateBps = OPTIMAL_RATE_BPS + (rateDiff * utilizationRatio / BPS_BASE);
            
            // Convert back to 18 decimals
            return rateBps * 1e18 / BPS_BASE;
        }
    }
    
    /**
     * @dev Calculate supply rate based on utilization and borrow rate
     * @param utilization Current utilization rate (18 decimals)
     * @param borrowRate Current borrow rate (18 decimals)
     * @return supplyRate Annual supply rate (18 decimals)
     */
    function getSupplyRate(
        uint256 utilization, 
        uint256 borrowRate
    ) external pure returns (uint256) {
        // Supply rate = utilization * borrowRate * (1 - reserveFactor)
        uint256 reserveFactorMantissa = RESERVE_FACTOR_BPS * 1e18 / BPS_BASE;
        return utilization * borrowRate * (1e18 - reserveFactorMantissa) / (1e36);
    }
}