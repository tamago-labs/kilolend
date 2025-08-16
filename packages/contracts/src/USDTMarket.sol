// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./BaseLendingMarket.sol";

/**
 * @title USDTMarket
 * @dev USDT lending market supporting wKAIA and stKAIA as collateral
 */
contract USDTMarket is BaseLendingMarket {
       
    constructor(
        address _wkaia,
        address _stKaia,
        address _usdt,
        address _oracle,
        address _interestRateModel
    ) BaseLendingMarket(
        _wkaia,
        _stKaia,
        _usdt,
        1e6,  // 1 USDT minimum borrow (6 decimals)
        _oracle,
        _interestRateModel
    ) {}

    // ============ Abstract Function Implementations ============

    /**
     * @dev Convert USD amount to USDT amount
     * @param usdAmount Amount in USD (18 decimals)
     * @return USDT amount (6 decimals)
     */
    function _convertUSDToStablecoin(uint256 usdAmount) internal pure override returns (uint256) {
        // USDT has 6 decimals, USD has 18 decimals
        // 1 USD = 1 USDT, so we just need to adjust decimals
        return usdAmount / 1e12;  // Convert from 18 decimals to 6 decimals
    }

    /**
     * @dev Convert USDT amount to USD
     * @param stablecoinAmount USDT amount (6 decimals)
     * @return USD amount (18 decimals)
     */
    function _convertStablecoinToUSD(uint256 stablecoinAmount) internal pure override returns (uint256) {
        // Convert from 6 decimals to 18 decimals
        // 1 USDT = 1 USD
        return stablecoinAmount * 1e12;  // Convert from 6 decimals to 18 decimals
    }

    /**
     * @dev Calculate collateral value to seize including liquidation penalty
     * @param repayAmount Amount being repaid in USDT (6 decimals)
     * @return USD value of collateral to seize (18 decimals)
     */
    function _calculateCollateralValue(uint256 repayAmount) internal pure override returns (uint256) {
        // Convert repay amount to USD
        uint256 repayValueUSD = repayAmount * 1e12; // Convert 6 decimals to 18 decimals
        
        // Add liquidation penalty
        return repayValueUSD * (10000 + LIQUIDATION_PENALTY) / 10000;
    }

    // ============ View Functions Specific to USDT ============

    /**
     * @dev Get the USD price of USDT (should always be ~1.00)
     */
    function getUSDTPrice() external view returns (uint256) {
        return oracle.getPrice(address(STABLECOIN));
    }

    /**
     * @dev Get user's borrow balance in USD
     */
    function getBorrowBalanceUSD(address user) external view returns (uint256) {
        uint256 borrowBalance = getBorrowBalance(user);
        return _convertStablecoinToUSD(borrowBalance);
    }

    /**
     * @dev Get user's supply balance in USD
     */
    function getSupplyBalanceUSD(address user) external view returns (uint256) {
        uint256 supplyBalance = getUserSupplyBalance(user);
        return _convertStablecoinToUSD(supplyBalance);
    }

    /**
     * @dev Get max borrow amount in USD
     */
    function getMaxBorrowAmountUSD(address user) external view returns (uint256) {
        uint256 maxBorrowUSDT = getMaxBorrowAmount(user);
        return _convertStablecoinToUSD(maxBorrowUSDT);
    }
}