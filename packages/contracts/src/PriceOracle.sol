// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";
import "@kaiachain/contracts/access/Ownable.sol";

import { IPriceOracle } from "./interfaces/IPriceOracle.sol";

/**
 * @title PriceOracle
 * @dev Can switch between Mock and Pyth price feeds 
 */
contract PriceOracle is Ownable, IPriceOracle {
    
    // Oracle modes
    enum OracleMode { MOCK, PYTH }
    
    OracleMode public currentMode;
    IPyth public pythOracle;
    IPriceOracle public mockOracle;
    
    // Pyth price feed IDs
    bytes32 public constant KAIA_USD_PRICE_ID = 0x452d40e01473f95aa9930911b4392197b3551b37ac92a049e87487b654b4ebbe;
    bytes32 public constant USDT_USD_PRICE_ID = 0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b;
    bytes32 public constant USD_KRW_PRICE_ID = 0xe539120487c29b4defdf9a53d337316ea022a2688978a468f9efd847201be7e3;
    
    // Token mappings
    mapping(address => bytes32) public tokenToPythId;
    mapping(address => uint256) private mockPrices;
    
    // stKAIA exchange rate
    uint256 private stKaiaExchangeRate = 1.05e18; // 1 stKAIA = 1.05 KAIA
    
    // Price staleness threshold (5 minutes)
    // uint256 public constant STALENESS_THRESHOLD = 300;
    
    event OracleModeChanged(OracleMode oldMode, OracleMode newMode);
    event TokenMappingSet(address indexed token, bytes32 priceId);
    event MockPriceSet(address indexed token, uint256 price);
    event StKaiaExchangeRateUpdated(uint256 newRate);
    
    constructor(
        address _pythOracle,
        address _mockOracle,
        address _wkaia,
        address _usdt
    ) {
        pythOracle = IPyth(_pythOracle);
        mockOracle = IPriceOracle(_mockOracle);
        currentMode = OracleMode.MOCK; // Start with mock for testing
        
        // Set up token mappings for Pyth
        tokenToPythId[_wkaia] = KAIA_USD_PRICE_ID;
        tokenToPythId[_usdt] = USDT_USD_PRICE_ID;
    }
    
    /**
     * @dev Get token price in USD (18 decimals)
     */
    function getPrice(address token) external view override returns (uint256) {
        if (currentMode == OracleMode.MOCK) {
            return mockOracle.getPrice(token);
        } else {
            return getPythPrice(token);
        }
    }
    
    /**
     * @dev Get stKAIA to KAIA exchange rate
     */
    function getStKaiaExchangeRate() external view override returns (uint256) {
        if (currentMode == OracleMode.MOCK) {
            return mockOracle.getStKaiaExchangeRate();
        } else {
            return stKaiaExchangeRate;
        }
    }
    
    /**
     * @dev Get KRW/USD exchange rate for KRW stablecoin pricing
     */
    function getKRWUSDRate() external view returns (uint256) {
        if (currentMode == OracleMode.MOCK) {
            // Return mock rate: 1 USD = 1300 KRW (approximately)
            return 1300e18;
        } else {
            // TODO: Avoid getPriceUnsafe in production
            PythStructs.Price memory price = pythOracle.getPriceUnsafe(USD_KRW_PRICE_ID);
            // require(block.timestamp - price.publishTime <= STALENESS_THRESHOLD, "Price too stale");
            require(price.price > 0, "Invalid price");
            
            // Convert Pyth price to 18 decimals
            uint256 adjustedPrice = _adjustPythPrice(price.price, price.expo);
            return adjustedPrice;
        }
    }
    
    /**
     * @dev Update Pyth prices with data from Hermes
     */
    function updatePythPrices(bytes[] calldata updateData) external payable {
        require(currentMode == OracleMode.PYTH, "Not in Pyth mode");
        uint updateFee = pythOracle.getUpdateFee(updateData);
        require(msg.value >= updateFee, "Insufficient fee");
        
        pythOracle.updatePriceFeeds{value: updateFee}(updateData);
        
        // Refund excess
        if (msg.value > updateFee) {
            payable(msg.sender).transfer(msg.value - updateFee);
        }
    }
    
    /**
     * @dev Get required update fee for Pyth
     */
    function getUpdateFee(bytes[] calldata updateData) external view returns (uint256) {
        if (currentMode == OracleMode.PYTH) {
            return pythOracle.getUpdateFee(updateData);
        }
        return 0;
    }
    
    // ============ Internal Functions ============
    
    function getPythPrice(address token) internal view returns (uint256) {
        bytes32 priceId = tokenToPythId[token];
        require(priceId != bytes32(0), "Token not supported");
        
        // TODO: Avoid getPriceUnsafe in production
        PythStructs.Price memory price = pythOracle.getPriceUnsafe(priceId);
        // require(block.timestamp - price.publishTime <= STALENESS_THRESHOLD, "Price too stale");
        require(price.price > 0, "Invalid price");
        
        // Convert Pyth price to 18 decimals
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
        
        // Scale to 18 decimals
        return adjustedPrice * 1e18 / 1e8; // Pyth uses 8 decimals typically
    }
    
    // ============ Admin Functions ============
    
    /**
     * @dev Switch oracle mode between Mock and Pyth
     */
    function setOracleMode(OracleMode _mode) external onlyOwner {
        OracleMode oldMode = currentMode;
        currentMode = _mode;
        emit OracleModeChanged(oldMode, _mode);
    }
    
    /**
     * @dev Set Pyth oracle address
     */
    function setPythOracle(address _pythOracle) external onlyOwner {
        pythOracle = IPyth(_pythOracle);
    }
    
    /**
     * @dev Set mock oracle address
     */
    function setMockOracle(address _mockOracle) external onlyOwner {
        mockOracle = IPriceOracle(_mockOracle);
    }
    
    /**
     * @dev Set token to Pyth price ID mapping
     */
    function setTokenMapping(address token, bytes32 priceId) external onlyOwner {
        tokenToPythId[token] = priceId;
        emit TokenMappingSet(token, priceId);
    }
    
    /**
     * @dev Set stKAIA exchange rate (for Pyth mode)
     */
    function setStKaiaExchangeRate(uint256 rate) external onlyOwner {
        require(rate > 0, "Rate must be greater than 0");
        stKaiaExchangeRate = rate;
        emit StKaiaExchangeRateUpdated(rate);
    }
    
    /**
     * @dev Emergency function to set mock price (only in mock mode)
     */
    function setMockPrice(address token, uint256 price) external onlyOwner {
        require(currentMode == OracleMode.MOCK, "Only available in mock mode");
        mockPrices[token] = price;
        emit MockPriceSet(token, price);
    }
    
    /**
     * @dev Withdraw any ETH sent for Pyth updates
     */
    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}