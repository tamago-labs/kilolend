// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.10;
 

abstract contract PriceOracle {
    bool public constant isPriceOracle = true;

    function getUnderlyingPrice(address cToken) virtual external view returns (uint);
}