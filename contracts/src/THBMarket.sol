// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./BaseLendingMarket.sol";

/**
 * @title THBMarket
 * @dev THB stablecoin lending market supporting wKAIA and stKAIA as collateral
 */
contract THBMarket is BaseLendingMarket {
    
    constructor(
        address _wkaia,
        address _stKaia,
        address _thb,
        address _oracle,
        address _interestRateModel
    ) BaseLendingMarket(
        _wkaia,
        _stKaia,
        _thb,
        100e2,  // 100 THB minimum borrow (2 decimals, ~$3)
        _oracle,
        _interestRateModel
    ) {}

    // ============ Abstract Function Implementations ============

    /**
     * @dev Convert USD amount to THB amount
     * @param usdAmount Amount in USD (18 decimals)
     * @return THB amount (2 decimals)
     */
    function _convertUSDToStablecoin(uint256 usdAmount) internal view override returns (uint256) {
        // Get USD/THB exchange rate from oracle
        uint256 usdThbRate = oracle.getTHBUSDRate();  // How many THB per USD
        
        // Convert USD to THB and adjust for decimals
        // USD has 18 decimals, THB has 2 decimals
        return usdAmount * usdThbRate / 1e18;
    }

    /**
     * @dev Convert THB amount to USD
     * @param stablecoinAmount THB amount (2 decimals)
     * @return USD amount (18 decimals)
     */
    function _convertStablecoinToUSD(uint256 stablecoinAmount) internal view override returns (uint256) {
        // Get USD/THB exchange rate from oracle
        uint256 usdThbRate = oracle.getTHBUSDRate();  // How many THB per USD
        
        // Convert THB to USD and adjust for decimals
        // THB has 2 decimals, USD has 18 decimals
        return stablecoinAmount * 1e18 / usdThbRate;
    }

    /**
     * @dev Calculate collateral value to seize including liquidation penalty
     * @param repayAmount Amount being repaid in THB (2 decimals)
     * @return USD value of collateral to seize (18 decimals)
     */
    function _calculateCollateralValue(uint256 repayAmount) internal view override returns (uint256) {
        // Convert repay amount to USD
        uint256 repayValueUSD = _convertStablecoinToUSD(repayAmount);
        
        // Add liquidation penalty
        return repayValueUSD * (10000 + LIQUIDATION_PENALTY) / 10000;
    }

    // ============ View Functions Specific to THB ============

    /**
     * @dev Get the current THB/USD exchange rate
     */
    function getTHBUSDRate() external view returns (uint256) {
        return oracle.getTHBUSDRate();
    }

    /**
     * @dev Get user's borrow balance in USD
     */
    function getBorrowBalanceUSD(address user) external view returns (uint256) {
        uint256 borrowBalance = getBorrowBalance(user);
        return _convertStablecoinToUSD(borrowBalance);
    }

    /**
     * @dev Get user's borrow balance in THB
     */
    function getBorrowBalanceTHB(address user) external view returns (uint256) {
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
     * @dev Get user's supply balance in THB
     */
    function getSupplyBalanceTHB(address user) external view returns (uint256) {
        return getUserSupplyBalance(user);
    }

    /**
     * @dev Get max borrow amount in USD
     */
    function getMaxBorrowAmountUSD(address user) external view returns (uint256) {
        uint256 maxBorrowTHB = getMaxBorrowAmount(user);
        return _convertStablecoinToUSD(maxBorrowTHB);
    }

    /**
     * @dev Get max borrow amount in THB
     */
    function getMaxBorrowAmountTHB(address user) external view returns (uint256) {
        return getMaxBorrowAmount(user);
    }

    /**
     * @dev Convert USD amount to THB (external helper function)
     */
    function convertUSDToTHB(uint256 usdAmount) external view returns (uint256) {
        return _convertUSDToStablecoin(usdAmount);
    }

    /**
     * @dev Convert THB amount to USD (external helper function)
     */
    function convertTHBToUSD(uint256 thbAmount) external view returns (uint256) {
        return _convertStablecoinToUSD(thbAmount);
    }

    /**
     * @dev Get market info specific to THB
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
        
        exchangeRate = oracle.getTHBUSDRate();
    }

}
