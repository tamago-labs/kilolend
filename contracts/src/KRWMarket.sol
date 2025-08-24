// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./BaseLendingMarket.sol";

/**
 * @title KRWMarket
 * @dev KRW stablecoin lending market supporting wKAIA and stKAIA as collateral
 */
contract KRWMarket is BaseLendingMarket {
    
    constructor(
        address _wkaia,
        address _stKaia,
        address _krw,
        address _oracle,
        address _interestRateModel
    ) BaseLendingMarket(
        _wkaia,
        _stKaia,
        _krw,
        1000e18,  // 1000 KRW minimum borrow (18 decimals, ~$0.75)
        _oracle,
        _interestRateModel
    ) {}

    // ============ Abstract Function Implementations ============

    /**
     * @dev Convert USD amount to KRW amount
     * @param usdAmount Amount in USD (18 decimals)
     * @return KRW amount (18 decimals)
     */
    function _convertUSDToStablecoin(uint256 usdAmount) internal view override returns (uint256) {
        // Get USD/KRW exchange rate from oracle
        uint256 usdKrwRate = oracle.getKRWUSDRate();  // How many KRW per USD
        
        // Convert USD to KRW
        return usdAmount * usdKrwRate / 1e18;
    }

    /**
     * @dev Convert KRW amount to USD
     * @param stablecoinAmount KRW amount (18 decimals)
     * @return USD amount (18 decimals)
     */
    function _convertStablecoinToUSD(uint256 stablecoinAmount) internal view override returns (uint256) {
        // Get USD/KRW exchange rate from oracle
        uint256 usdKrwRate = oracle.getKRWUSDRate();  // How many KRW per USD
        
        // Convert KRW to USD
        return stablecoinAmount * 1e18 / usdKrwRate;
    }

    /**
     * @dev Calculate collateral value to seize including liquidation penalty
     * @param repayAmount Amount being repaid in KRW (18 decimals)
     * @return USD value of collateral to seize (18 decimals)
     */
    function _calculateCollateralValue(uint256 repayAmount) internal view override returns (uint256) {
        // Convert repay amount to USD
        uint256 repayValueUSD = _convertStablecoinToUSD(repayAmount);
        
        // Add liquidation penalty
        return repayValueUSD * (10000 + LIQUIDATION_PENALTY) / 10000;
    }

    // ============ View Functions Specific to KRW ============

    /**
     * @dev Get the current KRW/USD exchange rate
     */
    function getKRWUSDRate() external view returns (uint256) {
        return oracle.getKRWUSDRate();
    }

    /**
     * @dev Get user's borrow balance in USD
     */
    function getBorrowBalanceUSD(address user) external view returns (uint256) {
        uint256 borrowBalance = getBorrowBalance(user);
        return _convertStablecoinToUSD(borrowBalance);
    }

    /**
     * @dev Get user's borrow balance in KRW
     */
    function getBorrowBalanceKRW(address user) external view returns (uint256) {
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
     * @dev Get user's supply balance in KRW
     */
    function getSupplyBalanceKRW(address user) external view returns (uint256) {
        return getUserSupplyBalance(user);
    }

    /**
     * @dev Get max borrow amount in USD
     */
    function getMaxBorrowAmountUSD(address user) external view returns (uint256) {
        uint256 maxBorrowKRW = getMaxBorrowAmount(user);
        return _convertStablecoinToUSD(maxBorrowKRW);
    }

    /**
     * @dev Get max borrow amount in KRW
     */
    function getMaxBorrowAmountKRW(address user) external view returns (uint256) {
        return getMaxBorrowAmount(user);
    }

    /**
     * @dev Convert USD amount to KRW (external helper function)
     */
    function convertUSDToKRW(uint256 usdAmount) external view returns (uint256) {
        return _convertUSDToStablecoin(usdAmount);
    }

    /**
     * @dev Convert KRW amount to USD (external helper function)
     */
    function convertKRWToUSD(uint256 krwAmount) external view returns (uint256) {
        return _convertStablecoinToUSD(krwAmount);
    }

    /**
     * @dev Get market info specific to KRW stablecoin
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
        
        exchangeRate = oracle.getKRWUSDRate();
    }

}
        