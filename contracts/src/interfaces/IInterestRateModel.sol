// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

interface IInterestRateModel {
    function getBorrowRate(uint256 utilization) external view returns (uint256);
    function getSupplyRate(uint256 utilization, uint256 borrowRate) external view returns (uint256);
}
