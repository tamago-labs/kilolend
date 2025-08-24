// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@kaiachain/contracts/access/Ownable.sol";
import "../interfaces/IPriceOracle.sol";

/**
 * @title MockOracle
 * @dev Mock price oracle for testing with support for multiple currencies
 */
contract MockOracle is IPriceOracle, Ownable {
    
    // Price feeds (price in USD with 18 decimals)
    mapping(address => uint256) private prices;
    
    // stKAIA exchange rate (how much KAIA you get for 1 stKAIA)
    uint256 private stKaiaExchangeRate = 1.05e18; // 1 stKAIA = 1.05 KAIA (5% yield)
    
    // Currency exchange rates (how many units of currency per USD)
    uint256 private krwUsdRate = 1300e18;  // 1300 KRW per USD (18 decimals)
    uint256 private jpyUsdRate = 150;       // 150 JPY per USD (0 decimals)
    uint256 private thbUsdRate = 35e2;      // 35 THB per USD (2 decimals)
    
    event PriceUpdated(address indexed token, uint256 newPrice);
    event StKaiaExchangeRateUpdated(uint256 newRate);
    event KRWUSDRateUpdated(uint256 newRate);
    event JPYUSDRateUpdated(uint256 newRate);
    event THBUSDRateUpdated(uint256 newRate);
    
    constructor(
        address _wkaiaAddress,
        uint256 _initialPrice
    ) {
        // Set initial prices (in USD with 18 decimals) 
        prices[_wkaiaAddress] = _initialPrice;  
    }
    
    /**
     * @dev Get token price in USD (18 decimals)
     */
    function getPrice(address token) external view override returns (uint256) {
        uint256 price = prices[token];
        require(price > 0, "Price not set for token");
        return price;
    }
    
    /**
     * @dev Get stKAIA to KAIA exchange rate
     */
    function getStKaiaExchangeRate() external view override returns (uint256) {
        return stKaiaExchangeRate;
    }
    
    /**
     * @dev Get KRW to USD exchange rate
     */
    function getKRWUSDRate() external view override returns (uint256) {
        return krwUsdRate;
    }
    
    /**
     * @dev Get JPY to USD exchange rate
     */
    function getJPYUSDRate() external view override returns (uint256) {
        return jpyUsdRate;
    }
    
    /**
     * @dev Get THB to USD exchange rate
     */
    function getTHBUSDRate() external view override returns (uint256) {
        return thbUsdRate;
    }
    
    /**
     * @dev Update Pyth prices (mock implementation)
     */
    function updatePythPrices(bytes[] calldata) external payable override {
        // Mock implementation - does nothing
    }
    
    /**
     * @dev Get update fee for Pyth prices (mock implementation)
     */
    function getUpdateFee(bytes[] calldata) external pure override returns (uint256) {
        return 0; // Free updates in mock
    }
    
    // ============ Admin Functions ============
    
    /**
     * @dev Set price for a token (only owner)
     */
    function setPrice(address token, uint256 price) external onlyOwner {
        require(price > 0, "Price must be greater than 0");
        prices[token] = price;
        emit PriceUpdated(token, price);
    }
    
    /**
     * @dev Set stKAIA exchange rate (only owner)
     */
    function setStKaiaExchangeRate(uint256 rate) external onlyOwner {
        require(rate > 0, "Rate must be greater than 0");
        stKaiaExchangeRate = rate;
        emit StKaiaExchangeRateUpdated(rate);
    }
    
    /**
     * @dev Set KRW/USD exchange rate (only owner)
     */
    function setKRWUSDRate(uint256 rate) external onlyOwner {
        require(rate > 0, "Rate must be greater than 0");
        krwUsdRate = rate;
        emit KRWUSDRateUpdated(rate);
    }
    
    /**
     * @dev Set JPY/USD exchange rate (only owner)
     */
    function setJPYUSDRate(uint256 rate) external onlyOwner {
        require(rate > 0, "Rate must be greater than 0");
        jpyUsdRate = rate;
        emit JPYUSDRateUpdated(rate);
    }
    
    /**
     * @dev Set THB/USD exchange rate (only owner)
     */
    function setTHBUSDRate(uint256 rate) external onlyOwner {
        require(rate > 0, "Rate must be greater than 0");
        thbUsdRate = rate;
        emit THBUSDRateUpdated(rate);
    }
    
    /**
     * @dev Batch set prices (for convenience)
     */
    function setPrices(
        address[] calldata tokens, 
        uint256[] calldata _prices
    ) external onlyOwner {
        require(tokens.length == _prices.length, "Array length mismatch");
        
        for (uint256 i = 0; i < tokens.length; i++) {
            require(_prices[i] > 0, "Price must be greater than 0");
            prices[tokens[i]] = _prices[i];
            emit PriceUpdated(tokens[i], _prices[i]);
        }
    }
    
    /**
     * @dev Set all exchange rates at once (for convenience)
     */
    function setExchangeRates(
        uint256 _stKaiaRate,
        uint256 _krwRate,
        uint256 _jpyRate,
        uint256 _thbRate
    ) external onlyOwner {
        require(_stKaiaRate > 0, "stKAIA rate must be greater than 0");
        require(_krwRate > 0, "KRW rate must be greater than 0");
        require(_jpyRate > 0, "JPY rate must be greater than 0");
        require(_thbRate > 0, "THB rate must be greater than 0");
        
        stKaiaExchangeRate = _stKaiaRate;
        krwUsdRate = _krwRate;
        jpyUsdRate = _jpyRate;
        thbUsdRate = _thbRate;
        
        emit StKaiaExchangeRateUpdated(_stKaiaRate);
        emit KRWUSDRateUpdated(_krwRate);
        emit JPYUSDRateUpdated(_jpyRate);
        emit THBUSDRateUpdated(_thbRate);
    }
}