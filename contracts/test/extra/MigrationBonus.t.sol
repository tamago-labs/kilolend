// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "forge-std/Test.sol";
import "../../src/extra/MigrationBonus.sol"; 

contract MockV1Comptroller {
    mapping(address => address[]) public userAssets;
    
    /**
     * @notice Get assets in for a user
     * @param account User address
     * @return Array of asset addresses
     */
    function getAssetsIn(address account) external view returns (address[] memory) {
        return userAssets[account];
    }
    
    /**
     * @notice Add an asset for a user (for testing setup)
     * @param account User address
     * @param asset Asset address
     */
    function addAsset(address account, address asset) external {
        userAssets[account].push(asset);
    }
    
    /**
     * @notice Remove all assets for a user (for testing setup)
     * @param account User address
     */
    function clearAssets(address account) external {
        delete userAssets[account];
    }
    
    /**
     * @notice Set multiple assets for a user (for testing setup)
     * @param account User address
     * @param assets Array of asset addresses
     */
    function setAssets(address account, address[] calldata assets) external {
        userAssets[account] = assets;
    }
}


contract MigrationBonusTest is Test {
    MigrationBonus public migrationBonus;
    MockV1Comptroller public mockV1Comptroller;
    
    address public admin;
    address public user1;
    address public user2;
    address public user3;
    
    event BonusClaimed(address indexed user, uint256 amount);
    event HackathonEligibilitySet(address indexed user, bool eligible);
    
    function setUp() public {
        admin = makeAddr("admin");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        user3 = makeAddr("user3");
        
        // Deploy mock V1 Comptroller
        mockV1Comptroller = new MockV1Comptroller();
        
        // Deploy contract with mock comptroller
        vm.prank(admin);
        migrationBonus = new MigrationBonus(address(mockV1Comptroller));
        
        // Fund the contract
        vm.deal(address(migrationBonus), 100000 ether);
    }
    
    // ============ Constructor Tests ============
    
    function test_Constructor() public view {
        assertEq(migrationBonus.admin(), admin);
        assertEq(migrationBonus.v1Comptroller(), address(mockV1Comptroller));
        assertEq(migrationBonus.BONUS_AMOUNT(), 100 ether);
        assertFalse(migrationBonus.paused());
    }
    
    function test_ConstructorRevertsWithZeroAddress() public {
        vm.expectRevert(MigrationBonus.InvalidAddress.selector);
        new MigrationBonus(address(0));
    }
    
    // ============ Hackathon Eligibility Tests ============
    
    function test_SetHackathonEligibility() public {
        vm.expectEmit(true, false, false, true);
        emit HackathonEligibilitySet(user1, true);
        
        vm.prank(admin);
        migrationBonus.setHackathonEligibility(user1);
        
        assertTrue(migrationBonus.isHackathonEligible(user1));
        assertEq(migrationBonus.totalHackathonParticipants(), 1);
    }
    
    function test_SetBatchHackathonEligibility() public {
        address[] memory users = new address[](3);
        users[0] = user1;
        users[1] = user2;
        users[2] = user3;
        
        vm.prank(admin);
        migrationBonus.setBatchHackathonEligibility(users, true);
        
        assertTrue(migrationBonus.isHackathonEligible(user1));
        assertTrue(migrationBonus.isHackathonEligible(user2));
        assertTrue(migrationBonus.isHackathonEligible(user3));
        assertEq(migrationBonus.totalHackathonParticipants(), 3);
    }
    
    function test_RemoveBatchHackathonEligibility() public {
        // First add users
        address[] memory users = new address[](2);
        users[0] = user1;
        users[1] = user2;
        
        vm.prank(admin);
        migrationBonus.setBatchHackathonEligibility(users, true);
        assertEq(migrationBonus.totalHackathonParticipants(), 2);
        
        // Then remove them
        vm.prank(admin);
        migrationBonus.setBatchHackathonEligibility(users, false);
        
        assertFalse(migrationBonus.isHackathonEligible(user1));
        assertFalse(migrationBonus.isHackathonEligible(user2));
        assertEq(migrationBonus.totalHackathonParticipants(), 0);
    }
    
    function test_OnlyAdminCanSetHackathonEligibility() public {
        vm.prank(user1);
        vm.expectRevert(MigrationBonus.NotAdmin.selector);
        migrationBonus.setHackathonEligibility(user2);
    }
    
    function test_CannotSetZeroAddressAsEligible() public {
        vm.prank(admin);
        vm.expectRevert(MigrationBonus.InvalidAddress.selector);
        migrationBonus.setHackathonEligibility(address(0));
    }
    
    // ============ V1 Eligibility Tests ============
    
    function test_SetV1Eligibility() public {
        vm.prank(admin);
        migrationBonus.setV1Eligibility(user1);
        assertTrue(migrationBonus.isV1Eligible(user1));
    }
    
    function test_V1EligibilityChecksComptroller() public {
        // Test with mock comptroller
        address testUser = makeAddr("testUser");
        
        // Initially should be false (no assets)
        assertFalse(migrationBonus.isV1Eligible(testUser));
        
        // Add an asset to the mock comptroller
        mockV1Comptroller.addAsset(testUser, makeAddr("someAsset"));
        
        // Now should be true
        assertTrue(migrationBonus.isV1Eligible(testUser));
    }
    
    function test_CannotClaimWithoutV1Eligibility() public {
        vm.prank(admin);
        migrationBonus.setHackathonEligibility(user1);
        // Don't set V1 eligibility, so user should not be eligible
        
        vm.prank(user1);
        vm.expectRevert(MigrationBonus.NotEligible.selector);
        migrationBonus.claimBonus();
    }
    
    // ============ Bonus Status Tests ============
    
    function test_GetBonusStatus() public {
        vm.prank(admin);
        migrationBonus.setHackathonEligibility(user1);
        vm.prank(admin);
        migrationBonus.setV1Eligibility(user1);
        
        (bool eligible, bool claimed, uint256 amount) = migrationBonus.getBonusStatus(user1);
        
        assertTrue(eligible);
        assertFalse(claimed);
        assertEq(amount, 100 ether);
    }
    
    function test_BonusStatusAfterClaim() public {
        // Setup
        vm.prank(admin);
        migrationBonus.setHackathonEligibility(user1);
        vm.prank(admin);
        migrationBonus.setV1Eligibility(user1);
        vm.deal(user1, 1 ether); // Give user some ETH for gas
        
        // Claim
        vm.prank(user1);
        migrationBonus.claimBonus();
        
        // Check status
        (bool eligible, bool claimed, uint256 amount) = migrationBonus.getBonusStatus(user1);
        
        assertFalse(eligible); // No longer eligible after claiming
        assertTrue(claimed);
        assertEq(amount, 100 ether);
    }
    
    // ============ Claim Bonus Tests ============
    
    function test_ClaimBonus() public {
        // Setup
        vm.prank(admin);
        migrationBonus.setHackathonEligibility(user1);
        vm.prank(admin);
        migrationBonus.setV1Eligibility(user1);
        
        uint256 balanceBefore = user1.balance;
        
        vm.expectEmit(true, false, false, true);
        emit BonusClaimed(user1, 100 ether);
        
        vm.prank(user1);
        migrationBonus.claimBonus();
        
        uint256 balanceAfter = user1.balance;
        
        assertEq(balanceAfter - balanceBefore, 100 ether);
        assertTrue(migrationBonus.hasClaimed(user1));
        assertEq(migrationBonus.totalClaimed(), 1);
    }
    
    function test_CannotClaimWithoutHackathonEligibility() public {
        vm.prank(admin);
        migrationBonus.setV1Eligibility(user1);
        
        vm.prank(user1);
        vm.expectRevert(MigrationBonus.NotEligible.selector);
        migrationBonus.claimBonus();
    }
    
    function test_CannotClaimTwice() public {
        // Setup and first claim
        vm.prank(admin);
        migrationBonus.setHackathonEligibility(user1);
        vm.prank(admin);
        migrationBonus.setV1Eligibility(user1);
        
        vm.prank(user1);
        migrationBonus.claimBonus();
        
        // Try to claim again
        vm.prank(user1);
        vm.expectRevert(MigrationBonus.AlreadyClaimed.selector);
        migrationBonus.claimBonus();
    }
    
    function test_CannotClaimWhenPaused() public {
        vm.prank(admin);
        migrationBonus.setHackathonEligibility(user1);
        vm.prank(admin);
        migrationBonus.setV1Eligibility(user1);
        
        vm.prank(admin);
        migrationBonus.pause();
        
        vm.prank(user1);
        vm.expectRevert(MigrationBonus.ContractIsPaused.selector);
        migrationBonus.claimBonus();
    }
    
    function test_CannotClaimWithInsufficientBalance() public {
        // Deploy new contract with no balance
        vm.prank(admin);
        MigrationBonus emptyContract = new MigrationBonus(address(mockV1Comptroller));
        
        vm.prank(admin);
        emptyContract.setHackathonEligibility(user1);
        vm.prank(admin);
        emptyContract.setV1Eligibility(user1);
        
        vm.prank(user1);
        vm.expectRevert(MigrationBonus.InsufficientBalance.selector);
        emptyContract.claimBonus();
    }
    
    // ============ Pause/Unpause Tests ============
    
    function test_Pause() public {
        vm.prank(admin);
        migrationBonus.pause();
        assertTrue(migrationBonus.paused());
    }
    
    function test_Unpause() public {
        vm.prank(admin);
        migrationBonus.pause();
        vm.prank(admin);
        migrationBonus.unpause();
        assertFalse(migrationBonus.paused());
    }
    
    function test_OnlyAdminCanPause() public {
        vm.prank(user1);
        vm.expectRevert(MigrationBonus.NotAdmin.selector);
        migrationBonus.pause();
    }
    
    function test_OnlyAdminCanUnpause() public {
        vm.prank(admin);
        migrationBonus.pause();
        
        vm.prank(user1);
        vm.expectRevert(MigrationBonus.NotAdmin.selector);
        migrationBonus.unpause();
    }
    
    // ============ Admin Functions Tests ============
    
    function test_SetAdmin() public {
        vm.prank(admin);
        migrationBonus.setAdmin(user1);
        assertEq(migrationBonus.admin(), user1);
    }
    
    function test_OnlyAdminCanSetAdmin() public {
        vm.prank(user1);
        vm.expectRevert(MigrationBonus.NotAdmin.selector);
        migrationBonus.setAdmin(user2);
    }
    
    function test_CannotSetZeroAddressAsAdmin() public {
        vm.prank(admin);
        vm.expectRevert(MigrationBonus.InvalidAddress.selector);
        migrationBonus.setAdmin(address(0));
    }
    
    function test_WithdrawKAIA() public {
        uint256 adminBalanceBefore = admin.balance;
        uint256 withdrawAmount = 1000 ether;
        
        vm.prank(admin);
        migrationBonus.withdrawKAIA(withdrawAmount);
        
        uint256 adminBalanceAfter = admin.balance;
        assertEq(adminBalanceAfter - adminBalanceBefore, withdrawAmount);
    }
    
    function test_OnlyAdminCanWithdraw() public {
        vm.prank(user1);
        vm.expectRevert(MigrationBonus.NotAdmin.selector);
        migrationBonus.withdrawKAIA(100 ether);
    }
    
    function test_CannotWithdrawMoreThanBalance() public {
        uint256 contractBalance = address(migrationBonus).balance;
        
        vm.prank(admin);
        vm.expectRevert(MigrationBonus.InsufficientBalance.selector);
        migrationBonus.withdrawKAIA(contractBalance + 1 ether);
    }
    
    function test_CannotWithdrawZeroAmount() public {
        vm.prank(admin);
        vm.expectRevert(MigrationBonus.InvalidAmount.selector);
        migrationBonus.withdrawKAIA(0);
    }
    
    // ============ View Functions Tests ============
    
    function test_GetBalance() public view {
        uint256 balance = migrationBonus.getBalance();
        assertEq(balance, 100000 ether);
    }
    
    function test_GetBonusesRemaining() public view {
        uint256 remaining = migrationBonus.getBonusesRemaining();
        assertEq(remaining, 1000); // 100000 / 100 = 1000
    }
    
    function test_GetTotalBonusesDistributed() public {
        // Initially zero
        assertEq(migrationBonus.getTotalBonusesDistributed(), 0);
        
        // After one claim
        vm.prank(admin);
        migrationBonus.setHackathonEligibility(user1);
        vm.prank(admin);
        migrationBonus.setV1Eligibility(user1);
        vm.prank(user1);
        migrationBonus.claimBonus();
        
        assertEq(migrationBonus.getTotalBonusesDistributed(), 100 ether);
    }
    
    // ============ Receive Function Tests ============
    
    function test_ReceiveKAIA() public {
        uint256 balanceBefore = address(migrationBonus).balance;
        
        vm.deal(user1, 100 ether);
        vm.prank(user1);
        (bool success, ) = address(migrationBonus).call{value: 50 ether}("");
        
        assertTrue(success);
        assertEq(address(migrationBonus).balance, balanceBefore + 50 ether);
    }
    
    // ============ Integration Tests ============
    
    function test_CompleteUserJourney() public {
        // Admin adds user to hackathon list
        vm.prank(admin);
        migrationBonus.setHackathonEligibility(user1);
        
        // Admin sets V1 eligibility (or user has real V1 activity)
        vm.prank(admin);
        migrationBonus.setV1Eligibility(user1);
        
        // Check status before claim
        (bool eligibleBefore, bool claimedBefore, ) = migrationBonus.getBonusStatus(user1);
        assertTrue(eligibleBefore);
        assertFalse(claimedBefore);
        
        // User claims bonus
        uint256 balanceBefore = user1.balance;
        vm.prank(user1);
        migrationBonus.claimBonus();
        
        // Verify claim
        assertEq(user1.balance - balanceBefore, 100 ether);
        assertTrue(migrationBonus.hasClaimed(user1));
        
        // Check status after claim
        (bool eligibleAfter, bool claimedAfter, ) = migrationBonus.getBonusStatus(user1);
        assertFalse(eligibleAfter);
        assertTrue(claimedAfter);
    }
    
    function test_MultipleUsersClaim() public {
        // Setup multiple users
        address[] memory users = new address[](3);
        users[0] = user1;
        users[1] = user2;
        users[2] = user3;
        
        vm.prank(admin);
        migrationBonus.setBatchHackathonEligibility(users, true);
        
        for (uint i = 0; i < users.length; i++) {
            vm.prank(admin);
            migrationBonus.setV1Eligibility(users[i]);
        }
        
        // All users claim
        for (uint i = 0; i < users.length; i++) {
            vm.prank(users[i]);
            migrationBonus.claimBonus();
        }
        
        // Verify all claims
        assertEq(migrationBonus.totalClaimed(), 3);
        assertEq(migrationBonus.getTotalBonusesDistributed(), 300 ether);
        
        for (uint i = 0; i < users.length; i++) {
            assertTrue(migrationBonus.hasClaimed(users[i]));
            assertEq(users[i].balance, 100 ether);
        }
    }
    
    // ============ Fuzz Tests ============
    
    function testFuzz_SetHackathonEligibility(address user) public {
        vm.assume(user != address(0));
        
        vm.prank(admin);
        migrationBonus.setHackathonEligibility(user);
        assertTrue(migrationBonus.isHackathonEligible(user));
    }
    
    function testFuzz_WithdrawAmount(uint256 amount) public {
        uint256 contractBalance = address(migrationBonus).balance;
        vm.assume(amount > 0 && amount <= contractBalance);
        
        uint256 adminBalanceBefore = admin.balance;
        vm.prank(admin);
        migrationBonus.withdrawKAIA(amount);
        
        assertEq(admin.balance - adminBalanceBefore, amount);
    }
}
