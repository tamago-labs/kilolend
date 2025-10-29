// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.10;

import "../interfaces/PriceOracle.sol";
import "../tokens/CErc20.sol";

/**
 * @title MockPriceOracle
 * @notice Simple price oracle for testing without deviation limits
 */
contract MockPriceOracle is PriceOracle {

    mapping(address => uint) public prices;
    address[] public assets;

    event PricePosted(address asset, uint previousPrice, uint requestedPrice, uint newPrice);

    function getUnderlyingPrice(CToken cToken) public view override returns (uint) {
        address underlying = _getUnderlyingAddress(cToken);
        uint8 underlyingDecimals = _getUnderlyingDecimals(underlying);

        uint256 basePrice = prices[underlying];
 
        // Apply decimal adjustment for Compound V2 compatibility
        uint256 decimalAdjustment = _getDecimalAdjustment(underlyingDecimals);
        
        // Avoid overflow by checking if we need to divide instead of multiply
        if (decimalAdjustment > 1e18) {
            return basePrice * (decimalAdjustment / 1e18);
        } else {
            return basePrice * decimalAdjustment / 1e18;
        }
    } 

    function setDirectPrice(address asset, uint price) external {
        uint previousPrice = prices[asset];
        prices[asset] = price;
        
        // Add to assets list if not already present
        bool found = false;
        for (uint i = 0; i < assets.length; i++) {
            if (assets[i] == asset) {
                found = true;
                break;
            }
        }
        if (!found) {
            assets.push(asset);
        }
        
        emit PricePosted(asset, previousPrice, price, price);
    }

    function setPrice(address cToken, uint price) external {
        address underlying = CErc20Interface(cToken).underlying();
        _setDirectPrice(underlying, price);
    }

    function _setDirectPrice(address asset, uint price) internal {
        uint previousPrice = prices[asset];
        prices[asset] = price;
        
        // Add to assets list if not already present 
        bool found = false;
        for (uint i = 0; i < assets.length; i++) {
            if (assets[i] == asset) {
                found = true;
                break;
            }
        }
        if (!found) {
            assets.push(asset);
        }
        
        emit PricePosted(asset, previousPrice, price, price);
    } 

    function getAssetPrice(address asset) external view returns (uint) {
        return prices[asset];
    }

    function getAssets() external view returns (address[] memory) {
        return assets;
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

    function compareStrings(string memory a, string memory b) internal pure returns (bool) {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
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

}
