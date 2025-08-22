// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

interface IPriceOracle {
    function getPrice(address token) external view returns (uint256);
    function getStKaiaExchangeRate() external view returns (uint256);
    function getKRWUSDRate() external view returns (uint256);
    function updatePythPrices(bytes[] calldata updateData) external payable;
    function getUpdateFee(bytes[] calldata updateData) external view returns (uint256);
}