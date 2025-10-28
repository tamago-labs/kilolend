// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.10;

/**
 * @title IKiloStaking Interface
 * @notice Interface for KILO token staking contract
 * @dev Used by Comptroller to query user staking status for utility features
 */
interface IKiloStaking {
    /**
     * @notice Get the amount of KILO tokens a user has staked
     * @param user The address of the user
     * @return The amount of KILO tokens staked
     */
    function getStakedAmount(address user) external view returns (uint256);

    /**
     * @notice Get the staking tier for a user
     * @dev Tier determines level of benefits (0 = no stake, 1-4 = increasing benefits)
     * @param user The address of the user
     * @return The staking tier (0-4)
     */
    function getStakingTier(address user) external view returns (uint256);

    /**
     * @notice Check if a user has liquidation protection active
     * @param user The address of the user
     * @return True if user has liquidation protection
     */
    function hasLiquidationProtection(address user) external view returns (bool);

    /**
     * @notice Get the borrow rate discount for a user in basis points
     * @dev Used to reduce borrow interest rates (e.g., 500 = 5% discount)
     * @param user The address of the user
     * @return Discount in basis points (0-2000, where 2000 = 20% max)
     */
    function getBorrowRateDiscount(address user) external view returns (uint256);

    /**
     * @notice Get liquidation threshold buffer for a user in mantissa format
     * @dev Shortfall required before liquidation (e.g., 2e16 = 2%)
     * @param user The address of the user
     * @return Buffer threshold in mantissa (0-10e16, where 10e16 = 10% max)
     */
    function getLiquidationThresholdBuffer(address user) external view returns (uint256);
}
