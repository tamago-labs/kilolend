// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.10;

import "./JumpRateModelV2.sol";

contract StablecoinJumpRateModel is JumpRateModelV2 {
    
    constructor() JumpRateModelV2(
        0.02e18,    // baseRatePerYear: 2% 
        0.12e18,    // multiplierPerYear: 12% slope before kink
        1.20e18,    // jumpMultiplierPerYear: 120% slope after kink  
        0.80e18,    // kink: 80% utilization
        msg.sender  // owner
    ) {}
}
