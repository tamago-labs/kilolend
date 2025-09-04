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
 * @dev Designed to simplify integration and testing:
 *      - Starts in mock mode by default for easier local development and unit tests.
 *      - Supports switching to Pyth mode in production.
 *      - Includes admin functions for managing feeds, toggling modes, and updating prices.
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

    event PricePosted(address asset, uint previousPriceMantissa, uint requestedPriceMantissa, uint newPriceMantissa);
    event PriceFeedSet(address token, bytes32 priceId);
    event MockModeToggled(address token, bool enabled);
    event StalenessThresholdUpdated(uint256 newThreshold);

    constructor() {
        stalenessThreshold = 3600; // 1 hour default
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

        uint256 price;

        // Default to mock unless explicitly turned off
        if (mockMode[underlying] || priceFeeds[underlying] == bytes32(0)) {
            price = mockPrices[underlying];
        } else {
            price = _getPythPrice(underlying);
        }

        // Apply inversion if enabled
        if (invertMode[underlying]) {
            require(price > 0, "Price must be positive for inversion");
            // keep scale to 18 decimals
            return 1e36 / price; 
        }

        return price;
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

    function setDirectPrice(address asset, uint price) public { 
        // automatically enable mock mode if not set
        if (mockPrices[asset] == 0) {
            mockMode[asset] = true;
        }
        require(mockMode[asset] == true , "only mock mode"); 
        emit PricePosted(asset, mockPrices[asset], price, price);
        mockPrices[asset] = price;
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

}
