// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.10;

import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";
import "@kaiachain/contracts/access/Ownable.sol";
import "./interfaces/PriceOracle.sol";
import "./tokens/CErc20.sol";
import "./interfaces/IOraklFeedRouter.sol";


/**
 * @title KiloPriceOracle
 * @notice A Compound V2-compatible price oracle with multiple modes:
 *         - Fallback mode (default): allows admins to manually set fallback prices for testing 
 *           or when external feeds are unavailable.
 *         - Pyth mode: fetches real-time prices from the Pyth oracle network, 
 *           including staleness checks and decimal adjustments.
 *         - Orakl mode: fetches real-time prices from Orakl Network feeds
 *
 * @dev Prices are normalized to account for underlying token decimals:
 *      - For 18-decimal tokens: price = USD_price * 1e18
 *      - For 6-decimal tokens:  price = USD_price * 1e30 (1e18 * 1e12 decimal adjustment)
 *      - For 8-decimal tokens:  price = USD_price * 1e28 (1e18 * 1e10 decimal adjustment)
 */

contract KiloPriceOracle is Ownable, PriceOracle {
    IPyth public pyth;
    IOraklFeedRouter public oraklRouter;

    // Pyth price feeds
    mapping(address => bytes32) public priceFeeds;
    
    // Orakl price feeds (feed names like "BTC-USDT", "AAVE-KRW")
    mapping(address => string) public oraklFeeds;

    // Oracle mode per token: 0=fallback, 1=pyth, 2=orakl
    mapping(address => uint8) public oracleMode;
    mapping(address => uint256) public fallbackPrices;

    // Invert mode per token (default: false)
    mapping(address => bool) public invertMode;

    uint256 public stalenessThreshold;

    mapping(address => bool) public whitelist;

    mapping(address => uint256) public lastValidPrice;
    uint256 public constant MAX_PRICE_DEVIATION_BPS = 2000; // 20% max change
    mapping(address => uint256) public lastPriceUpdateTime;
    uint256 public constant PRICE_UPDATE_DELAY = 1 hours;

    event PricePosted(address asset, uint previousPriceMantissa, uint requestedPriceMantissa, uint newPriceMantissa);
    event PythFeedSet(address token, bytes32 priceId);
    event OraklFeedSet(address token, string feedName);
    event OracleModeSet(address token, uint8 mode);
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

        uint8 mode = oracleMode[underlying];
        if (mode == 1) {
            // Pyth mode
            basePrice = _getPythPrice(underlying);
        } else if (mode == 2) {
            // Orakl mode
            basePrice = _getOraklPrice(underlying);
        } else {
            // Fallback mode (default)
            basePrice = fallbackPrices[underlying];
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

        // Automatically reverts if older than threshold or invalid
        PythStructs.Price memory price = pyth.getPriceNoOlderThan(priceId, stalenessThreshold);

        require(price.price > 0, "Invalid price value");
        require(price.expo >= -18 && price.expo <= 18, "Exponent out of range");

        uint256 adjustedPrice = _adjustPythPrice(price.price, price.expo);
        return adjustedPrice;
    }

    function _adjustPythPrice(int64 price, int32 expo) internal pure returns (uint256) {
        require(price > 0, "Price must be positive");

        uint256 adjustedPrice = uint256(uint64(price));

        if (expo >= 0) {
            adjustedPrice = adjustedPrice * (10 ** uint32(expo));
        } else {
            adjustedPrice = adjustedPrice / (10 ** uint32(-expo));
        }

        // Normalize to 18 decimals
        return adjustedPrice * 1e18 / 1e8;
    }

    function _getOraklPrice(address token) internal view returns (uint256) {
        string memory feedName = oraklFeeds[token];
        require(bytes(feedName).length > 0, "Token not supported");

        (, int256 answer, uint256 updatedAt) = oraklRouter.latestRoundData(feedName);

        require(block.timestamp - updatedAt <= stalenessThreshold, "Price too stale");
        require(answer > 0, "Invalid price");

        // Get feed decimals and adjust to 18 decimals
        uint8 feedDecimals = oraklRouter.decimals(feedName);
        uint256 price = uint256(answer);
        
        if (feedDecimals < 18) {
            price = price * (10 ** (18 - feedDecimals));
        } else if (feedDecimals > 18) {
            price = price / (10 ** (feedDecimals - 18));
        }
        
        return price;
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
        // automatically enable fallback mode if not set
        if (fallbackPrices[asset] == 0) {
            oracleMode[asset] = 0; // fallback mode
        }
        require(oracleMode[asset] == 0, "only fallback mode"); 
        require(price > 0, "price must be positive");

        if (lastPriceUpdateTime[asset] != 0) {
            require(block.timestamp >= lastPriceUpdateTime[asset] + PRICE_UPDATE_DELAY,
            "price update too frequent");
        }
        
        // ADD PRICE BOUNDS CHECK:
        uint256 lastPrice = lastValidPrice[asset];
        if (lastPrice > 0) {
            uint256 minPrice = lastPrice * (10000 - MAX_PRICE_DEVIATION_BPS) / 10000;
            uint256 maxPrice = lastPrice * (10000 + MAX_PRICE_DEVIATION_BPS) / 10000;
            require(price >= minPrice && price <= maxPrice, 
                    "price deviation too high");
        }

        emit PricePosted(asset, fallbackPrices[asset], price, price);
        fallbackPrices[asset] = price;
        lastValidPrice[asset] = price;
        lastPriceUpdateTime[asset] = block.timestamp;
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
        
        uint8 mode = oracleMode[underlying];
        if (mode == 1) {
            // Pyth mode
            basePrice = _getPythPrice(underlying);
        } else if (mode == 2) {
            // Orakl mode
            basePrice = _getOraklPrice(underlying);
        } else {
            // Fallback mode (default)
            basePrice = fallbackPrices[underlying];
        }
        
        decimalAdjustment = _getDecimalAdjustment(decimals);
        finalPrice = getUnderlyingPrice(cToken);
    }

    function compareStrings(string memory a, string memory b) internal pure returns (bool) {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
    }

    // Admin functions

    function setPythFeed(address token, bytes32 priceId) external onlyOwner {
        priceFeeds[token] = priceId;
        oracleMode[token] = 1; // Pyth mode
        emit PythFeedSet(token, priceId);
    }

    function setOraklFeed(address token, string calldata feedName) external onlyOwner {
        oraklFeeds[token] = feedName;
        oracleMode[token] = 2; // Orakl mode
        emit OraklFeedSet(token, feedName);
    }

    function setOracleMode(address token, uint8 mode) external onlyOwner {
        require(mode <= 2, "Invalid mode");
        oracleMode[token] = mode;
        emit OracleModeSet(token, mode);
    }

    function setPyth(address _pyth) external onlyOwner {
        pyth = IPyth(_pyth);
    }

    function setOraklRouter(address _oraklRouter) external onlyOwner {
        oraklRouter = IOraklFeedRouter(_oraklRouter);
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
        uint256 updateFee = pyth.getUpdateFee(updateData);
        require(msg.value >= updateFee, "Insufficient fee for update");

        // Perform Pyth price feed update
        pyth.updatePriceFeeds{value: updateFee}(updateData);

        // Refund any excess ETH safely
        if (msg.value > updateFee) {
            (bool sent, ) = msg.sender.call{value: msg.value - updateFee}("");
            require(sent, "Refund failed");
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
