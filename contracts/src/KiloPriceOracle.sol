// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.10;

import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";
import "@kaiachain/contracts/access/Ownable.sol";
import "./PriceOracle.sol";
import { CErc20 } from "./CErc20.sol";

contract KiloPriceOracle is Ownable, PriceOracle {
    IPyth public pyth;
    
    // Price feed mappings
    mapping(address => bytes32) public priceFeeds;
    
    // Pyth price feed IDs (need to setup seperately)
    bytes32 public constant KAIA_USD_PRICE_ID = 0x452d40e01473f95aa9930911b4392197b3551b37ac92a049e87487b654b4ebbe;
    bytes32 public constant USDT_USD_PRICE_ID = 0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b;
    bytes32 public constant USD_KRW_PRICE_ID = 0xe539120487c29b4defdf9a53d337316ea022a2688978a468f9efd847201be7e3;
    bytes32 public constant USD_JPY_PRICE_ID = 0xef2c98c804ba503c6a707e38be4dfbb16683775f195b091252bf24693042fd52;

    // Mock prices for testing (when Pyth unavailable)
    mapping(address => uint256) public mockPrices;
    bool public useMockPrices;
    
    uint256 public constant STALENESS_THRESHOLD = 3600; // 1 hour
    
    event PriceFeedSet(address token, bytes32 priceId);
    event MockPriceSet(address token, uint256 price);
    event MockModeToggled(bool enabled);
    
    constructor(address _pyth) {
        pyth = IPyth(_pyth);
        useMockPrices = true; // Start in mock mode for testing
    }
    
    function getUnderlyingPrice(address cToken) external view override returns (uint) {
        address underlying = getUnderlyingAddress(cToken);
        
        if (useMockPrices) {
            return mockPrices[underlying];
        }
        
        return getPythPrice(underlying);
    }
    
    function getPythPrice(address token) internal view returns (uint256) {
        bytes32 priceId = priceFeeds[token];
        require(priceId != bytes32(0), "Token not supported");
        
        PythStructs.Price memory price = pyth.getPriceUnsafe(priceId);
        require(block.timestamp - price.publishTime <= STALENESS_THRESHOLD, "Price too stale");
        require(price.price > 0, "Invalid price");
        
        return _adjustPythPrice(price.price, price.expo);
    }
    
    function _adjustPythPrice(int64 price, int32 expo) internal pure returns (uint256) {
        require(price > 0, "Price must be positive");
        
        uint256 adjustedPrice = uint256(uint64(price));
        
        if (expo >= 0) {
            adjustedPrice = adjustedPrice * (10 ** uint32(expo));
        } else {
            adjustedPrice = adjustedPrice / (10 ** uint32(-expo));
        }
        
        // Scale to 18 decimals (Pyth typically uses 8 decimals)
        return adjustedPrice * 1e18 / 1e8;
    }
    
    function getUnderlyingAddress(address cToken) internal view returns (address) { 
        try CErc20(address(cToken)).underlying() returns (address underlying) {
            return underlying;
        } catch {
            // If no underlying method, it's probably cEther (not applicable for us)
            return address(0);
        }
    }
    
    // Admin functions
    
    function setPriceFeed(address token, bytes32 priceId) external onlyOwner {
        priceFeeds[token] = priceId;
        emit PriceFeedSet(token, priceId);
    }
    
    function setMockPrice(address token, uint256 price) external onlyOwner {
        mockPrices[token] = price;
        emit MockPriceSet(token, price);
    }
    
    function toggleMockMode(bool enabled) external onlyOwner {
        useMockPrices = enabled;
        emit MockModeToggled(enabled);
    }
    
    function setPyth(address _pyth) external onlyOwner {
        pyth = IPyth(_pyth);
    }
    
    function updatePythPrices(bytes[] calldata updateData) external payable {
        require(!useMockPrices, "Not in Pyth mode");
        uint updateFee = pyth.getUpdateFee(updateData);
        require(msg.value >= updateFee, "Insufficient fee");
        
        pyth.updatePriceFeeds{value: updateFee}(updateData);
        
        if (msg.value > updateFee) {
            payable(msg.sender).transfer(msg.value - updateFee);
        }
    }
    
    function getUpdateFee(bytes[] calldata updateData) external view returns (uint256) {
        if (useMockPrices) {
            return 0;
        }
        return pyth.getUpdateFee(updateData);
    }
}
 