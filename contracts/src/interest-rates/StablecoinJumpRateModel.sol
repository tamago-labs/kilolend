// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.20;

import "./JumpRateModelV2.sol";

contract StablecoinJumpRateModel is JumpRateModelV2 {
    
    constructor() JumpRateModelV2(
        0.01e18,    // baseRatePerYear: 1% 
        0.04e18,    // multiplierPerYear: 4% slope before kink
        1.09e18,    // jumpMultiplierPerYear: 109% slope after kink  
        0.80e18,    // kink: 80% utilization
        msg.sender  // owner
    ) {}
}
