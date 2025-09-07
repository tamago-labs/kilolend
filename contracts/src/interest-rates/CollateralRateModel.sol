// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.20;

import "./JumpRateModelV2.sol";

contract CollateralRateModel is JumpRateModelV2 {
    
    constructor() JumpRateModelV2(
         0.001e18,   // baseRatePerYear: 0.1% fixed APY
         0,          // multiplierPerYear: 0 (no utilization sensitivity)
         0,          // jumpMultiplierPerYear: 0 (no jump)
         0.80e18,    // kink: irrelevant but kept for compatibility
         msg.sender  // owner
    ) {}
     
}
