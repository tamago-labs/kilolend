// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./BaseLendingMarket.sol";

/**
 * @title JPYMarket
 * @dev JPY stablecoin lending market supporting wKAIA and stKAIA as collateral
 */
contract JPYMarket is BaseLendingMarket {
    
    constructor(
        address _wkaia,
        address _stKaia,
        address _jpy,
        address _oracle,
        address _interestRateModel
    ) BaseLendingMarket(
        _wkaia,
        _stKaia,
        _jpy,
        1000,  // 1000 JPY minimum borrow (0 decimals, ~$7)
        _oracle,
        _interestRateModel
    ) {}

    // ============ Abstract Function Implementations ============

    /**
     * @dev Convert USD amount to JPY amount
     * @param usdAmount Amount in USD (18 decimals)
     * @return JPY amount (0 decimals)
     */
    function _convertUSDToStablecoin(uint256 usdAmount) internal view override returns (uint256) {
        // Get USD/JPY exchange rate from oracle
        uint256 usdJpyRate = oracle.getJPYUSDRate();  // How many JPY per USD
        
        // Convert USD to JPY and adjust for decimals
        // USD has 18 decimals, JPY has 0 decimals
        return usdAmount * usdJpyRate / 1e18;
    }

    /**
     * @dev Convert JPY amount to USD
     * @param stablecoinAmount JPY amount (0 decimals)
     * @return USD amount (18 decimals)
     */
    function _convertStablecoinToUSD(uint256 stablecoinAmount) internal view override returns (uint256) {
        // Get USD/JPY exchange rate from oracle
        uint256 usdJpyRate = oracle.getJPYUSDRate();  // How many JPY per USD
        
        // Convert JPY to USD and adjust for decimals
        // JPY has 0 decimals, USD has 18 decimals
        return stablecoinAmount * 1e18 / usdJpyRate;
    }

    /**
     * @dev Calculate collateral value to seize including liquidation penalty
     * @param repayAmount Amount being repaid in JPY (0 decimals)
     * @return USD value of collateral to seize (18 decimals)
     */
    function _calculateCollateralValue(uint256 repayAmount) internal view override returns (uint256) {
        // Convert repay amount to USD
        uint256 repayValueUSD = _convertStablecoinToUSD(repayAmount);
        
        // Add liquidation penalty
        return repayValueUSD * (10000 + LIQUIDATION_PENALTY) / 10000;
    }

    // ============ View Functions Specific to JPY ============

    /**
     * @dev Get the current JPY/USD exchange rate
     */
    function getJPYUSDRate() external view returns (uint256) {
        return oracle.getJPYUSDRate();
    }

    /**
     * @dev Get user's borrow balance in USD
     */
    function getBorrowBalanceUSD(address user) external view returns (uint256) {
        uint256 borrowBalance = getBorrowBalance(user);
        return _convertStablecoinToUSD(borrowBalance);
    }

    /**
     * @dev Get user's borrow balance in JPY
     */
    function getBorrowBalanceJPY(address user) external view returns (uint256) {
        return getBorrowBalance(user);
    }

    /**
     * @dev Get user's supply balance in USD
     */
    function getSupplyBalanceUSD(address user) external view returns (uint256) {
        uint256 supplyBalance = getUserSupplyBalance(user);
        return _convertStablecoinToUSD(supplyBalance);
    }

    /**
     * @dev Get user's supply balance in JPY
     */
    function getSupplyBalanceJPY(address user) external view returns (uint256) {
        return getUserSupplyBalance(user);
    }

    /**
     * @dev Get max borrow amount in USD
     */
    function getMaxBorrowAmountUSD(address user) external view returns (uint256) {
        uint256 maxBorrowJPY = getMaxBorrowAmount(user);
        return _convertStablecoinToUSD(maxBorrowJPY);
    }

    /**
     * @dev Get max borrow amount in JPY
     */
    function getMaxBorrowAmountJPY(address user) external view returns (uint256) {
        return getMaxBorrowAmount(user);
    }

    /**
     * @dev Convert USD amount to JPY (external helper function)
     */
    function convertUSDToJPY(uint256 usdAmount) external view returns (uint256) {
        return _convertUSDToStablecoin(usdAmount);
    }

    /**
     * @dev Convert JPY amount to USD (external helper function)
     */
    function convertJPYToUSD(uint256 jpyAmount) external view returns (uint256) {
        return _convertStablecoinToUSD(jpyAmount);
    }

    /**
     * @dev Get market info specific to JPY stablecoin
     */
    function getMarketInfo() external view returns (
        uint256 totalSupply,
        uint256 totalBorrow,
        uint256 supplyAPY,
        uint256 borrowAPR,
        uint256 utilizationRate,
        uint256 exchangeRate
    ) {
        totalSupply = totalStablecoinSupplied;
        totalBorrow = totalStablecoinBorrowed;
        utilizationRate = getUtilizationRate();
        
        uint256 borrowRate = interestRateModel.getBorrowRate(utilizationRate);
        borrowAPR = borrowRate * 365 days / 1e18;
        supplyAPY = interestRateModel.getSupplyRate(utilizationRate, borrowRate) * 365 days / 1e18;
        
        exchangeRate = oracle.getJPYUSDRate();
    }
}
