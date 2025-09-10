// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.10;

import "forge-std/Test.sol";
import "../../src/interest-rates/CollateralRateModel.sol";
import "../../src/interest-rates/StablecoinJumpRateModel.sol";

contract SpecialRateModelsTest is Test {
    CollateralRateModel public collateralModel;
    StablecoinJumpRateModel public stablecoinModel;
    
    function setUp() public {
        collateralModel = new CollateralRateModel();
        stablecoinModel = new StablecoinJumpRateModel();
    }
    
    // function testCollateralRateModel() public {
    //     assertTrue(collateralModel.isInterestRateModel());
        
    //     uint borrowRate = collateralModel.getBorrowRate(1000e18, 500e18, 0);
    //     assertEq(borrowRate, 0);
        
    //     uint supplyRate = collateralModel.getSupplyRate(1000e18, 500e18, 0, 1e17);
    //     assertEq(supplyRate, 0.001e18);
    // }
    
    function testStablecoinModel() public {
        assertTrue(stablecoinModel.isInterestRateModel());
        
        uint borrowRateAtZero = stablecoinModel.getBorrowRate(1000e18, 0, 0);
        assertEq(borrowRateAtZero, 0.01e18 / stablecoinModel.blocksPerYear());
        
        uint borrowRateAtKink = stablecoinModel.getBorrowRate(200e18, 800e18, 0);
        uint expectedAtKink = (0.01e18 + 0.04e18) / stablecoinModel.blocksPerYear();
        assertApproxEqAbs(borrowRateAtKink, expectedAtKink, 1e10);
        
        uint borrowRateAfterKink = stablecoinModel.getBorrowRate(100e18, 900e18, 0);
        assertGt(borrowRateAfterKink, expectedAtKink);
    }
}
