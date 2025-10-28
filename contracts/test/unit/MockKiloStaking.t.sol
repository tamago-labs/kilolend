// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.10;

import "forge-std/Test.sol";
import "../../src/utils/MockToken.sol";
import "./MockKiloStaking.sol";

contract MockKiloStakingTest is Test {
    MockKiloStaking public kiloStaking;
    MockToken public kiloToken;
    
    address public admin;
    address public user1;
    address public user2;
    address public user3;
    address public user4;
    address public user5;
    
    function setUp() public {
        admin = address(this);
        user1 = address(0x1);
        user2 = address(0x2);
        user3 = address(0x3);
        user4 = address(0x4);
        user5 = address(0x5);
        
        // Deploy KILO token
        kiloToken = new MockToken("KILO Token", "KILO", 18, 10000000e18);
        
        // Deploy MockKiloStaking
        kiloStaking = new MockKiloStaking(address(kiloToken));
    }
    
    function testDeployment() public {
        assertEq(kiloStaking.admin(), admin);
        assertEq(kiloStaking.kiloToken(), address(kiloToken));
    }
    
    function testStakedAmount() public {
        // Initially no stake
        assertEq(kiloStaking.getStakedAmount(user1), 0);
        
        // Set staked balance
        kiloStaking.setStakedBalance(user1, 1000e18);
        assertEq(kiloStaking.getStakedAmount(user1), 1000e18);
    }
    
    function testStakingTiers() public {
        // Test Tier 0 (no stake)
        kiloStaking.setStakedBalance(user1, 0);
        assertEq(kiloStaking.getStakingTier(user1), 0);
        
        // Test Tier 1 (10,000 KILO)
        kiloStaking.setStakedBalance(user2, 10000e18);
        assertEq(kiloStaking.getStakingTier(user2), 1);
        
        // Test Tier 2 (100,000 KILO)
        kiloStaking.setStakedBalance(user3, 100000e18);
        assertEq(kiloStaking.getStakingTier(user3), 2);
        
        // Test Tier 3 (1,000,000 KILO)
        kiloStaking.setStakedBalance(user4, 1000000e18);
        assertEq(kiloStaking.getStakingTier(user4), 3);
        
        // Test Tier 4 (10,000,000 KILO)
        kiloStaking.setStakedBalance(user5, 10000000e18);
        assertEq(kiloStaking.getStakingTier(user5), 4);
    }
    
    function testLiquidationProtection() public {
        // Tier 0 should have no protection
        kiloStaking.setUserToTier(user1, 0);
        assertFalse(kiloStaking.hasLiquidationProtection(user1));
        
        // Tier 1+ should have protection
        kiloStaking.setUserToTier(user2, 1);
        assertTrue(kiloStaking.hasLiquidationProtection(user2));
        
        kiloStaking.setUserToTier(user3, 2);
        assertTrue(kiloStaking.hasLiquidationProtection(user3));
        
        kiloStaking.setUserToTier(user4, 3);
        assertTrue(kiloStaking.hasLiquidationProtection(user4));
        
        kiloStaking.setUserToTier(user5, 4);
        assertTrue(kiloStaking.hasLiquidationProtection(user5));
    }
    
    function testBorrowRateDiscount() public {
        // Tier 0: 0% discount
        kiloStaking.setUserToTier(user1, 0);
        assertEq(kiloStaking.getBorrowRateDiscount(user1), 0);
        
        // Tier 1: 5% discount (500 bps)
        kiloStaking.setUserToTier(user2, 1);
        assertEq(kiloStaking.getBorrowRateDiscount(user2), 500);
        
        // Tier 2: 10% discount (1000 bps)
        kiloStaking.setUserToTier(user3, 2);
        assertEq(kiloStaking.getBorrowRateDiscount(user3), 1000);
        
        // Tier 3: 15% discount (1500 bps)
        kiloStaking.setUserToTier(user4, 3);
        assertEq(kiloStaking.getBorrowRateDiscount(user4), 1500);
        
        // Tier 4: 20% discount (2000 bps)
        kiloStaking.setUserToTier(user5, 4);
        assertEq(kiloStaking.getBorrowRateDiscount(user5), 2000);
    }
    
    function testLiquidationThresholdBuffer() public {
        // Tier 0: 0% buffer
        kiloStaking.setUserToTier(user1, 0);
        assertEq(kiloStaking.getLiquidationThresholdBuffer(user1), 0);
        
        // Tier 1: 2% buffer (2e16)
        kiloStaking.setUserToTier(user2, 1);
        assertEq(kiloStaking.getLiquidationThresholdBuffer(user2), 2e16);
        
        // Tier 2: 3% buffer (3e16)
        kiloStaking.setUserToTier(user3, 2);
        assertEq(kiloStaking.getLiquidationThresholdBuffer(user3), 3e16);
        
        // Tier 3: 5% buffer (5e16)
        kiloStaking.setUserToTier(user4, 3);
        assertEq(kiloStaking.getLiquidationThresholdBuffer(user4), 5e16);
        
        // Tier 4: 7% buffer (7e16)
        kiloStaking.setUserToTier(user5, 4);
        assertEq(kiloStaking.getLiquidationThresholdBuffer(user5), 7e16);
    }
    
    function testSetUserToTier() public {
        // Test setting each tier
        kiloStaking.setUserToTier(user1, 0);
        assertEq(kiloStaking.getStakedAmount(user1), 0);
        assertEq(kiloStaking.getStakingTier(user1), 0);
        
        kiloStaking.setUserToTier(user1, 1);
        assertEq(kiloStaking.getStakedAmount(user1), 10000e18);
        assertEq(kiloStaking.getStakingTier(user1), 1);
        
        kiloStaking.setUserToTier(user1, 2);
        assertEq(kiloStaking.getStakedAmount(user1), 100000e18);
        assertEq(kiloStaking.getStakingTier(user1), 2);
        
        kiloStaking.setUserToTier(user1, 3);
        assertEq(kiloStaking.getStakedAmount(user1), 1000000e18);
        assertEq(kiloStaking.getStakingTier(user1), 3);
        
        kiloStaking.setUserToTier(user1, 4);
        assertEq(kiloStaking.getStakedAmount(user1), 10000000e18);
        assertEq(kiloStaking.getStakingTier(user1), 4);
    }
    
    function testSetUserToTierReverts() public {
        // Should revert for invalid tier
        vm.expectRevert("tier must be 0-4");
        kiloStaking.setUserToTier(user1, 5);
        
        // Should revert for non-admin
        vm.prank(user1);
        vm.expectRevert("only admin");
        kiloStaking.setUserToTier(user2, 1);
    }
    
    function testSetStakedBalanceReverts() public {
        // Should revert for non-admin
        vm.prank(user1);
        vm.expectRevert("only admin");
        kiloStaking.setStakedBalance(user2, 1000e18);
    }

    function testMultipleUsers() public {
        // Set different users to different tiers
        kiloStaking.setUserToTier(user1, 0);
        kiloStaking.setUserToTier(user2, 1);
        kiloStaking.setUserToTier(user3, 2);
        kiloStaking.setUserToTier(user4, 3);
        kiloStaking.setUserToTier(user5, 4);
        
        // Verify all users have correct settings
        assertEq(kiloStaking.getStakingTier(user1), 0);
        assertEq(kiloStaking.getStakingTier(user2), 1);
        assertEq(kiloStaking.getStakingTier(user3), 2);
        assertEq(kiloStaking.getStakingTier(user4), 3);
        assertEq(kiloStaking.getStakingTier(user5), 4);
        
        // Verify borrow rate discounts
        assertEq(kiloStaking.getBorrowRateDiscount(user1), 0);
        assertEq(kiloStaking.getBorrowRateDiscount(user2), 500);
        assertEq(kiloStaking.getBorrowRateDiscount(user3), 1000);
        assertEq(kiloStaking.getBorrowRateDiscount(user4), 1500);
        assertEq(kiloStaking.getBorrowRateDiscount(user5), 2000);
        
        // Verify liquidation buffers
        assertEq(kiloStaking.getLiquidationThresholdBuffer(user1), 0);
        assertEq(kiloStaking.getLiquidationThresholdBuffer(user2), 2e16);
        assertEq(kiloStaking.getLiquidationThresholdBuffer(user3), 3e16);
        assertEq(kiloStaking.getLiquidationThresholdBuffer(user4), 5e16);
        assertEq(kiloStaking.getLiquidationThresholdBuffer(user5), 7e16);
    }
}
