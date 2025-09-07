// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../../src/interest-rates/JumpRateModelV2.sol";

contract JumpRateModelV2Test is Test {
    JumpRateModelV2 public model;
    
    address public admin = address(0x1);
    
    uint256 public constant BASE_RATE = 2e16;      // 2%
    uint256 public constant MULTIPLIER = 10e16;    // 10%
    uint256 public constant JUMP_MULTIPLIER = 200e16; // 200%
    uint256 public constant KINK = 8e17;           // 80%
    
    function setUp() public {
        model = new JumpRateModelV2(
            BASE_RATE,
            MULTIPLIER,
            JUMP_MULTIPLIER,
            KINK,
            admin
        );
    }
    
    function testInitialParameters() view public {
        assertEq(model.baseRatePerBlock(), BASE_RATE / model.blocksPerYear());
        assertEq(model.multiplierPerBlock(), (MULTIPLIER * 1e18 ) / (model.blocksPerYear() * model.kink() ));
        assertEq(model.jumpMultiplierPerBlock(), JUMP_MULTIPLIER / model.blocksPerYear());
        assertEq(model.kink(), KINK);
        assertTrue(model.isInterestRateModel());
    }
    
    function testBorrowRateAtZeroUtilization() public {
        uint cash = 1000e18;
        uint borrows = 0;
        uint reserves = 0;
        
        uint rate = model.getBorrowRate(cash, borrows, reserves);
        uint expectedRate = BASE_RATE / model.blocksPerYear();
        
        assertEq(rate, expectedRate);
    }
    
    function testBorrowRateBeforeKink() public {
        uint cash = 500e18;
        uint borrows = 300e18; // 37.5% utilization
        uint reserves = 0;
        
        uint utilizationRate = borrows * 1e18 / (cash + borrows);
        assertLt(utilizationRate, KINK);
        
        uint rate = model.getBorrowRate(cash, borrows, reserves);
        
        uint expectedRate = (BASE_RATE + (MULTIPLIER * utilizationRate / 1e18)) / model.blocksPerYear();
        
        assertApproxEqAbs(rate, expectedRate, 1e10);
    }
    
    function testBorrowRateAtKink() public {
        uint cash = 200e18;
        uint borrows = 800e18; // 80% utilization (at kink)
        uint reserves = 0;
        
        uint utilizationRate = borrows * 1e18 / (cash + borrows);
        assertEq(utilizationRate, KINK);
        
        uint rate = model.getBorrowRate(cash, borrows, reserves);
        
        uint expectedRate = (BASE_RATE + MULTIPLIER) / model.blocksPerYear();
        
        assertApproxEqAbs(rate, expectedRate, 1e10);
    }
    
    function testBorrowRateAfterKink() public {
        uint cash = 100e18;
        uint borrows = 900e18; // 90% utilization
        uint reserves = 0;
        
        uint utilizationRate = borrows * 1e18 / (cash + borrows);
        assertGt(utilizationRate, KINK);
        
        uint rate = model.getBorrowRate(cash, borrows, reserves);
        
        uint normalRate = BASE_RATE + MULTIPLIER;
        uint excessUtil = utilizationRate - KINK;
        uint expectedRate = (normalRate + (JUMP_MULTIPLIER * excessUtil / 1e18)) / model.blocksPerYear();
        
        assertApproxEqAbs(rate, expectedRate, 1e10);
    }
    
    function testSupplyRate() public {
        uint cash = 400e18;
        uint borrows = 600e18; // 60% utilization
        uint reserves = 0;
        uint reserveFactor = 1e17; // 10%
        
        uint borrowRate = model.getBorrowRate(cash, borrows, reserves);
        uint supplyRate = model.getSupplyRate(cash, borrows, reserves, reserveFactor);
        
        uint utilizationRate = borrows * 1e18 / (cash + borrows);
        uint rateToPool = borrowRate * (1e18 - reserveFactor) / 1e18;
        uint expectedSupplyRate = utilizationRate * rateToPool / 1e18;
        
        assertApproxEqAbs(supplyRate, expectedSupplyRate, 1e10);
    }
    
    function testSupplyRateWithReserves() public {
        uint cash = 300e18;
        uint borrows = 600e18;
        uint reserves = 100e18; // 10% of borrows
        uint reserveFactor = 2e17; // 20%
        
        uint supplyRate = model.getSupplyRate(cash, borrows, reserves, reserveFactor);
        
        uint utilizationRate = borrows * 1e18 / (cash + borrows - reserves);
        uint borrowRate = model.getBorrowRate(cash, borrows, reserves);
        uint rateToPool = borrowRate * (1e18 - reserveFactor) / 1e18;
        uint expectedSupplyRate = utilizationRate * rateToPool / 1e18;
        
        assertApproxEqAbs(supplyRate, expectedSupplyRate, 1e10);
    }
    
    function testExtremeUtilization() public {
        uint cash = 1e18;
        uint borrows = 99e18; // 99% utilization
        uint reserves = 0;
        
        uint rate = model.getBorrowRate(cash, borrows, reserves);
        
        assertGt(rate, BASE_RATE / model.blocksPerYear());
        
        uint maxExpectedRate = (BASE_RATE + MULTIPLIER + JUMP_MULTIPLIER) / model.blocksPerYear();
        assertLt(rate, maxExpectedRate);
    }
    
    function testZeroBorrows() public {
        uint cash = 1000e18;
        uint borrows = 0;
        uint reserves = 0;
        uint reserveFactor = 1e17;
        
        uint borrowRate = model.getBorrowRate(cash, borrows, reserves);
        uint supplyRate = model.getSupplyRate(cash, borrows, reserves, reserveFactor);
        
        assertEq(borrowRate, BASE_RATE / model.blocksPerYear());
        assertEq(supplyRate, 0);
    }
    
    function testUpdateJumpRateModel() public {
        uint newBase = 3e16;
        uint newMultiplier = 15e16;
        uint newJump = 300e16;
        uint newKink = 9e17;
        
        vm.prank(admin);
        model.updateJumpRateModel(newBase, newMultiplier, newJump, newKink);
        
        assertEq(model.baseRatePerBlock(), newBase / model.blocksPerYear());
        assertEq(model.multiplierPerBlock(),(newMultiplier * 1e18 ) / (model.blocksPerYear() * model.kink() ));
        assertEq(model.jumpMultiplierPerBlock(), newJump / model.blocksPerYear());
        assertEq(model.kink(), newKink);
    }
    
    function testUpdateJumpRateModelUnauthorized() public {
        vm.prank(address(0x999));
        vm.expectRevert("only the owner may call this function.");
        model.updateJumpRateModel(3e16, 15e16, 300e16, 9e17);
    }
}
