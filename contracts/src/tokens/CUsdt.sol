// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "../CErc20.sol";

/**
 * @title cUSDT - USDT Lending Market
 * @notice cToken implementation for USDT lending
 */
contract CUsdt is CErc20 {
    
    constructor(
        address underlying_,
        ComptrollerInterface comptroller_,
        InterestRateModel interestRateModel_,
        uint initialExchangeRateMantissa_,
        address payable admin_
    ) CErc20(
        underlying_,
        comptroller_,
        interestRateModel_,
        initialExchangeRateMantissa_,
        "Kilo USDT",
        "cUSDT",
        8,
        admin_
    ) {}
}