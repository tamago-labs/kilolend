// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@kaiachain/contracts/access/Ownable.sol";

/**
 * @title MockOracle
 * @dev Mock price oracle for testing 
 */
contract MockPriceOracle is Ownable {
    
    // Price feeds (price in USD with 18 decimals)
    mapping(address => uint256) private prices;
    
    // stKAIA exchange rate (how much KAIA you get for 1 stKAIA)
    uint256 private stKaiaExchangeRate = 1.05e18; // 1 stKAIA = 1.05 KAIA (5% yield)
    
    event PriceUpdated(address indexed token, uint256 newPrice);
    event StKaiaExchangeRateUpdated(uint256 newRate);
    
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
    function getPrice(address token) external view returns (uint256) {
        uint256 price = prices[token];
        require(price > 0, "Price not set for token");
        return price;
    }
    
    /**
     * @dev Get stKAIA to KAIA exchange rate
     */
    function getStKaiaExchangeRate() external view returns (uint256) {
        return stKaiaExchangeRate;
    }
    
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
     * @dev Simulate stKAIA yield growth over time
     */
    function simulateStKaiaYield(uint256 additionalYield) external onlyOwner {
        stKaiaExchangeRate += additionalYield;
        emit StKaiaExchangeRateUpdated(stKaiaExchangeRate);
    }
}