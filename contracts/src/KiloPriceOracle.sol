// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.10;

import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";
import "@kaiachain/contracts/access/Ownable.sol";
import "./interfaces/PriceOracle.sol";
import "./tokens/CErc20.sol";

/**
 * @title KiloPriceOracle
 * @notice A Compound V2-compatible price oracle with dual modes:
 *         - Mock mode (default): allows admins to manually set mock prices for testing 
 *           without relying on external feeds.
 *         - Pyth mode: fetches real-time prices from the Pyth oracle network, 
 *           including staleness checks and decimal adjustments.
 *
 * @dev Prices are normalized to account for underlying token decimals:
 *      - For 18-decimal tokens: price = USD_price * 1e18
 *      - For 6-decimal tokens:  price = USD_price * 1e30 (1e18 * 1e12 decimal adjustment)
 *      - For 8-decimal tokens:  price = USD_price * 1e28 (1e18 * 1e10 decimal adjustment)
 */

contract KiloPriceOracle is Ownable, PriceOracle {
    IPyth public pyth;

    // Pyth price feeds
    mapping(address => bytes32) public priceFeeds;

    // Mock mode per token (default: true unless overridden)
    mapping(address => bool) public mockMode;
    mapping(address => uint256) public mockPrices;

    // Invert mode per token (default: false)
    mapping(address => bool) public invertMode;

    uint256 public stalenessThreshold;

    mapping(address => bool) public whitelist;

    event PricePosted(address asset, uint previousPriceMantissa, uint requestedPriceMantissa, uint newPriceMantissa);
    event PriceFeedSet(address token, bytes32 priceId);
    event MockModeToggled(address token, bool enabled);
    event StalenessThresholdUpdated(uint256 newThreshold);

    modifier isWhitelisted() {
        require(whitelist[msg.sender], "Not whitelisted");
        _;
    }

    constructor() {
        stalenessThreshold = 3600; // 1 hour default
        whitelist[msg.sender] = true;
    }
 

    function _getUnderlyingAddress(CToken cToken) private view returns (address) {
        address asset;
        if (compareStrings(cToken.symbol(), "cKAIA")) {
            asset = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
        } else {
            asset = address(CErc20(address(cToken)).underlying());
        }
        return asset;
    }

    function getUnderlyingPrice(CToken cToken) public override view returns (uint) {
        address underlying = _getUnderlyingAddress(cToken);
        uint8 underlyingDecimals = _getUnderlyingDecimals(underlying);

        uint256 basePrice;

        // Default to mock unless explicitly turned off
        if (mockMode[underlying] || priceFeeds[underlying] == bytes32(0)) {
            basePrice = mockPrices[underlying];
        } else {
            basePrice = _getPythPrice(underlying);
        }

        // Apply inversion if enabled
        if (invertMode[underlying]) {
            require(basePrice > 0, "Price must be positive for inversion");
            // keep scale to 18 decimals
            return 1e36 / basePrice; 
        }

        // Apply decimal adjustment for Compound V2 compatibility
        uint256 decimalAdjustment = _getDecimalAdjustment(underlyingDecimals);
        
        // Avoid overflow by checking if we need to divide instead of multiply
        if (decimalAdjustment > 1e18) {
            return basePrice * (decimalAdjustment / 1e18);
        } else {
            return basePrice * decimalAdjustment / 1e18;
        }
    }

    function _getPythPrice(address token) internal view returns (uint256) {
        bytes32 priceId = priceFeeds[token];
        require(priceId != bytes32(0), "Token not supported");

        PythStructs.Price memory price = pyth.getPriceUnsafe(priceId);

        require(block.timestamp - price.publishTime <= stalenessThreshold, "Price too stale");
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

    function _getUnderlyingDecimals(address underlying) private view returns (uint8) {
        // Handle native token (KAIA/ETH)
        if (underlying == 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE) {
            return 18;
        }
        
        // Get decimals from ERC20 contract
        return EIP20Interface(underlying).decimals();
    }

    function _getDecimalAdjustment(uint8 tokenDecimals) private pure returns (uint256) {
        if (tokenDecimals >= 18) {
            return 1e18;
        }
        
        // For tokens with < 18 decimals, multiply by additional factor
        // This ensures borrowBalance * price calculation works correctly
        uint8 decimalDifference = 18 - tokenDecimals;
        return 1e18 * (10 ** decimalDifference);
    }

    function setDirectPrice(address asset, uint price) public isWhitelisted { 
        // automatically enable mock mode if not set
        if (mockPrices[asset] == 0) {
            mockMode[asset] = true;
        }
        require(mockMode[asset] == true , "only mock mode"); 
        emit PricePosted(asset, mockPrices[asset], price, price);
        mockPrices[asset] = price;
    }

    function getPriceInfo(CToken cToken) external view returns (
        address underlying,
        uint8 decimals,
        uint256 basePrice,
        uint256 finalPrice,
        uint256 decimalAdjustment
    ) {
        underlying = _getUnderlyingAddress(cToken);
        decimals = _getUnderlyingDecimals(underlying);
        
        if (mockMode[underlying] || priceFeeds[underlying] == bytes32(0)) {
            basePrice = mockPrices[underlying];
        } else {
            basePrice = _getPythPrice(underlying);
        }
        
        decimalAdjustment = _getDecimalAdjustment(decimals);
        finalPrice = getUnderlyingPrice(cToken);
    }

    function compareStrings(string memory a, string memory b) internal pure returns (bool) {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
    }

    // Admin functions

    function setPriceFeed(address token, bytes32 priceId) external onlyOwner {
        priceFeeds[token] = priceId;
        // When setting a feed, automatically disable mock mode
        mockMode[token] = false;
        emit PriceFeedSet(token, priceId);
    }

    function toggleMockMode(address token, bool enabled) external onlyOwner {
        mockMode[token] = enabled;
        emit MockModeToggled(token, enabled);
    }

    function setPyth(address _pyth) external onlyOwner {
        pyth = IPyth(_pyth);
    }
    
    function setStalenessThreshold(uint256 newThreshold) external onlyOwner {
        require(newThreshold > 0, "Invalid threshold");
        stalenessThreshold = newThreshold;
        emit StalenessThresholdUpdated(newThreshold);
    }

    function setInvertMode(address token, bool enabled) external onlyOwner {
        invertMode[token] = enabled;
    }

    function updatePythPrices(bytes[] calldata updateData) external payable {
        uint updateFee = pyth.getUpdateFee(updateData);
        require(msg.value >= updateFee, "Insufficient fee");

        pyth.updatePriceFeeds{value: updateFee}(updateData);

        if (msg.value > updateFee) {
            payable(msg.sender).transfer(msg.value - updateFee);
        }
    }

    function getUpdateFee(bytes[] calldata updateData) external view returns (uint256) {
        return pyth.getUpdateFee(updateData);
    }

    // Whitelist management functions

    /**
     * @notice Add address to whitelist for setDirectPrice function
     * @param user The address to add to whitelist
     */
    function addToWhitelist(address user) external onlyOwner {
        require(user != address(0), "Cannot whitelist zero address");
        whitelist[user] = true; 
    }

    /**
     * @notice Remove address from whitelist
     * @param user The address to remove from whitelist
     */
    function removeFromWhitelist(address user) external onlyOwner {
        whitelist[user] = false; 
    }

}
