// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "../CErc20.sol";

/**
 * @title cWKAIA - WKAIA Collateral Market
 * @notice cToken implementation for WKAIA collateral (supply-only, no borrowing)
 */
contract CWkaia is CErc20 {
    
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
        "Kilo WKAIA",
        "cWKAIA",
        8,
        admin_
    ) {}
 
}