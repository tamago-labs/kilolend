// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "forge-std/Test.sol";
import "../src/KiloVault.sol";

contract KiloVaultTest is Test {
    KiloVault public vault;
    
    address public owner;
    address public bot;
    address public user1;
    address public user2;
    address public feeRecipient;
    
    // Native KAIA
    address public constant NATIVE_ASSET = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    
    event Deposit(
        address indexed user,
        address indexed beneficiary,
        uint256 depositIndex,
        uint256 assets,
        uint256 shares,
        uint256 lockDuration,
        uint256 unlockBlock,
        bool isBotDeposit
    );
    
    event DepositMerged(
        address indexed beneficiary,
        uint256 depositIndex,
        uint256 addedAssets,
        uint256 addedShares,
        uint256 newUnlockBlock
    );
    
    event LockExtended(
        address indexed user,
        uint256 depositIndex,
        uint256 oldUnlockBlock,
        uint256 newUnlockBlock,
        uint256 extensionDays
    );
    
    function setUp() public {
        owner = address(this);
        bot = makeAddr("bot");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        feeRecipient = makeAddr("feeRecipient");
        
        // Deploy vault for native KAIA
        vault = new KiloVault(
            NATIVE_ASSET,
            "Kilo Vault KAIA",
            "kvKAIA",
            18
        );
        
        // Set bot address
        vault.setBotAddress(bot);
        
        // Fund test accounts
        vm.deal(user1, 10000 ether);
        vm.deal(user2, 10000 ether);
        vm.deal(bot, 10000 ether);
    }
    
    // ========================================================================
    // DEPLOYMENT TESTS
    // ========================================================================
    
    function testDeployment() public {
        assertEq(vault.asset(), NATIVE_ASSET);
        assertEq(vault.assetDecimals(), 18);
        assert(vault.isNative());
        assertEq(vault.botAddress(), bot);
        assertEq(vault.owner(), owner);
    }
    
    function testDefaultConfiguration() public {
        assertEq(vault.minDeposit(), 10 ether);
        assertEq(vault.maxDepositPerUser(), 1000 ether);
        assertEq(vault.maxTotalDeposits(), 500_000 ether); 
        assertEq(vault.earlyWithdrawalPenalty(), 500); // 5%
        assertFalse(vault.isPaused());
    }
    
    // ========================================================================
    // USER DEPOSIT TESTS
    // ========================================================================
    
    function testUserDepositNoLock() public {
        vm.startPrank(user1);
        
        uint256 depositAmount = 100 ether;
        uint256 depositIndex = vault.depositNative{value: depositAmount}();
        
        assertEq(depositIndex, 0);
        assertEq(vault.balanceOf(user1), depositAmount);
        assertEq(vault.totalManagedAssets(), depositAmount);
        assertEq(vault.userTotalDeposits(user1), depositAmount);
        
        (,,,,bool isLocked,,,,bool canWithdraw,) = vault.getUserDeposit(user1, depositIndex);
        assertFalse(isLocked); // Direct deposits have no lock
        assertTrue(canWithdraw); // Can withdraw immediately
        
        vm.stopPrank();
    }
    
    function testMultipleDirectDeposits() public {
        vm.startPrank(user1);
        
        // Deposit 1
        vault.depositNative{value: 50 ether}();
        
        // Deposit 2
        vault.depositNative{value: 75 ether}();
        
        assertEq(vault.getUserDepositCount(user1), 2);
        assertEq(vault.userTotalDeposits(user1), 125 ether);
        
        vm.stopPrank();
    }
    
    function testRevertBelowMinDeposit() public {
        vm.startPrank(user1);
        
        vm.expectRevert(KiloVault.BelowMinDeposit.selector);
        vault.depositNative{value: 5 ether}(); // Below 10 KAIA minimum
        
        vm.stopPrank();
    }
    
    function testRevertExceedsMaxDepositPerUser() public {
        vm.startPrank(user1);
        
        vm.expectRevert(KiloVault.ExceedsMaxDepositPerUser.selector);
        vault.depositNative{value: 1001 ether}(); // Exceeds 1000 KAIA per user cap
        
        vm.stopPrank();
    }
    
    // ========================================================================
    // BOT DEPOSIT ON-BEHALF TESTS (AUTO-MERGE)
    // ========================================================================
    
    function testBotDepositOnBehalfFirst() public {
        vm.startPrank(bot);
        
        uint256 depositAmount = 50 ether;
        uint256 depositIndex = vault.botDepositNativeOnBehalf{value: depositAmount}(user1);
        
        assertEq(depositIndex, 0);
        assertEq(vault.balanceOf(user1), depositAmount);
        assertTrue(vault.hasBotDeposit(user1));
        assertEq(vault.userBotDepositIndex(user1), 0);
        
        (uint256 shares,, uint256 unlockBlock,, bool isLocked,, bool isBotDeposit, uint256 depositBlock, bool canWithdraw,) = 
            vault.getUserDeposit(user1, depositIndex);
            
        assertEq(shares, depositAmount);
        assertTrue(isLocked);
        assertTrue(isBotDeposit);
        assertFalse(canWithdraw);
        assertEq(unlockBlock, depositBlock + 15 days);
        
        vm.stopPrank();
    }
    
    function testBotDepositAutoMerge() public {
        vm.startPrank(bot);
        
        // First deposit
        vault.botDepositNativeOnBehalf{value: 50 ether}(user1);
        
        uint256 firstUnlockBlock;
        {
            (,, uint256 unlock,,,,,,,) = vault.getUserDeposit(user1, 0);
            firstUnlockBlock = unlock;
        }
        
        // Fast forward 10 days
        vm.roll(block.number + 10 days);
        
        // Second deposit - should MERGE
        uint256 depositIndex = vault.botDepositNativeOnBehalf{value: 30 ether}(user1);
        
        // Should return same index (0) since it merged
        assertEq(depositIndex, 0);
        assertEq(vault.getUserDepositCount(user1), 1); // Still 1 deposit
        assertEq(vault.balanceOf(user1), 80 ether); // 50 + 30
        
        // shares, assets, unlockBlock, lockDuration, isLocked, (skip 5 more)
        (uint256 shares, uint256 assets, uint256 unlockBlock,, bool isLocked,,,,,) = 
            vault.getUserDeposit(user1, 0);
            
        assertEq(shares, 80 ether);
        assertEq(assets, 80 ether);
        assertTrue(isLocked);
        
        // Lock should have been EXTENDED to 15 days from NOW
        assertGt(unlockBlock, firstUnlockBlock); // New unlock is later
        assertEq(unlockBlock, block.number + 15 days);
        
        vm.stopPrank();
    }
    
    function testBotDepositMultipleMerges() public {
        vm.startPrank(bot);
        
        // Deposit 1: 50 KAIA
        vault.botDepositNativeOnBehalf{value: 50 ether}(user1);
        
        // Deposit 2: +30 KAIA (10 days later)
        vm.roll(block.number + 10 days);
        vault.botDepositNativeOnBehalf{value: 30 ether}(user1);
        
        // Deposit 3: +20 KAIA (5 days later)
        vm.roll(block.number + 5 days);
        vault.botDepositNativeOnBehalf{value: 20 ether}(user1);
        
        // Should still be 1 deposit
        assertEq(vault.getUserDepositCount(user1), 1);
        assertEq(vault.balanceOf(user1), 100 ether); // 50 + 30 + 20
        
        // shares, assets, unlockBlock, (skip 7 more)
        (uint256 shares, uint256 assets, uint256 unlockBlock,,,,,,,) = vault.getUserDeposit(user1, 0);
        
        assertEq(shares, 100 ether);
        assertEq(assets, 100 ether);
        assertEq(unlockBlock, block.number + 15 days); // Always 15 days from last deposit
        
        vm.stopPrank();
    }
    
    function testBotDepositAndDirectDepositSeparate() public {
        // Bot deposit
        vm.prank(bot);
        vault.botDepositNativeOnBehalf{value: 50 ether}(user1);
        
        // Direct deposit
        vm.prank(user1);
        vault.depositNative{value: 100 ether}();
        
        // Should have 2 separate deposits
        assertEq(vault.getUserDepositCount(user1), 2);
        
        // Deposit 0: Bot deposit (locked)
        (,, uint256 unlock0,, bool isLocked0,, bool isBotDeposit0,,, ) = vault.getUserDeposit(user1, 0);
        assertTrue(isLocked0);
        assertTrue(isBotDeposit0);
        assertGt(unlock0, block.number);
        
        // Deposit 1: Direct deposit (no lock)
        (,, uint256 unlock1,, bool isLocked1,, bool isBotDeposit1,,,) = vault.getUserDeposit(user1, 1);
        assertFalse(isLocked1);
        assertFalse(isBotDeposit1);
        assertEq(unlock1, block.number); // Unlocked immediately
    }
    
    function testRevertNonBotDepositOnBehalf() public {
        vm.startPrank(user2);
        
        vm.expectRevert(KiloVault.NotBot.selector);
        vault.botDepositNativeOnBehalf{value: 50 ether}(user1);
        
        vm.stopPrank();
    }
    
    // ========================================================================
    // LOCK EXTENSION TESTS
    // ========================================================================
    
    function testExtendLockPeriod() public {
        // Create bot deposit
        vm.prank(bot);
        vault.botDepositNativeOnBehalf{value: 100 ether}(user1);
        
        uint256 originalUnlock;
        {
            (,, uint256 unlock,,,,,,, ) = vault.getUserDeposit(user1, 0);
            originalUnlock = unlock;
        }
        
        // Fast forward 5 days
        vm.roll(block.number + 5 days);
        
        // Admin extends lock by 7 days
        vm.prank(bot);
        vault.extendLockPeriod(user1, 0, 7);
        
        (,, uint256 newUnlock,, bool isLocked,,,, bool canWithdraw, uint256 lastExtended) = 
            vault.getUserDeposit(user1, 0);
        
        assertTrue(isLocked);
        assertFalse(canWithdraw);
        assertEq(newUnlock, originalUnlock + 7 days);
        assertEq(lastExtended, block.number);
    }
    
    function testRevertExtendUnlockedDeposit() public {
        // Create direct deposit (no lock)
        vm.prank(user1);
        vault.depositNative{value: 100 ether}();
        
        // Try to extend - should fail
        vm.prank(bot);
        vm.expectRevert(KiloVault.CannotExtendUnlockedDeposit.selector);
        vault.extendLockPeriod(user1, 0, 7);
    }
    
    function testRevertExtendByZeroDays() public {
        // Create bot deposit
        vm.prank(bot);
        vault.botDepositNativeOnBehalf{value: 100 ether}(user1);
        
        vm.prank(bot);
        vm.expectRevert(KiloVault.InvalidExtensionDays.selector);
        vault.extendLockPeriod(user1, 0, 0);
    }
    
    // ========================================================================
    // WITHDRAWAL REQUEST TESTS
    // ========================================================================
    
    function testWithdrawalRequestDirectDeposit() public {
        vm.startPrank(user1);
        
        // Direct deposit (no lock)
        vault.depositNative{value: 100 ether}();
        uint256 shares = vault.balanceOf(user1);
        
        // Request withdrawal immediately
        uint256 requestId = vault.requestWithdrawal(0, shares);
        
        assertEq(requestId, 1);
        assertEq(vault.balanceOf(user1), 0); // Shares burned
        
        (,,, uint256 requestedAssets,,, ) = vault.withdrawalRequests(requestId);
        assertEq(requestedAssets, 100 ether); // No penalty since not locked
        
        vm.stopPrank();
    }
    
    function testWithdrawalRequestEarlyPenalty() public {
        vm.prank(bot);
        vault.botDepositNativeOnBehalf{value: 100 ether}(user1);
        
        vm.startPrank(user1);
        uint256 shares = vault.balanceOf(user1);
        
        // Request early withdrawal (before unlock)
        uint256 requestId = vault.requestWithdrawal(0, shares);
        
        (,,, uint256 requestedAssets,,, ) = vault.withdrawalRequests(requestId);
        
        // Should have 5% penalty
        assertEq(requestedAssets, 95 ether); // 100 - 5% = 95
        
        vm.stopPrank();
    }
    
    function testWithdrawalAfterUnlock() public {
        vm.prank(bot);
        vault.botDepositNativeOnBehalf{value: 100 ether}(user1);
        
        // Fast forward 15 days
        vm.roll(block.number + 15 days);
        
        vm.startPrank(user1);
        uint256 shares = vault.balanceOf(user1);
        uint256 requestId = vault.requestWithdrawal(0, shares);
        
        (,,, uint256 requestedAssets,,, ) = vault.withdrawalRequests(requestId);
        assertEq(requestedAssets, 100 ether); // No penalty
        
        vm.stopPrank();
    }
    
    function testProcessAndClaimWithdrawal() public {
        vm.startPrank(user1);
        vault.depositNative{value: 100 ether}();
        
        uint256 shares = vault.balanceOf(user1);
        uint256 requestId = vault.requestWithdrawal(0, shares);
        
        vm.stopPrank();

        vm.startPrank(bot);

        // Bot processes
        uint256[] memory requestIds = new uint256[](1);
        requestIds[0] = requestId;
        
        vault.processWithdrawals{value: 100 ether}(requestIds);
        
        vm.stopPrank();
        vm.startPrank(user1);

        // User claims
        uint256 user1BalanceBefore = user1.balance;
        
        vault.claimWithdrawal(requestId);
        
        vm.stopPrank();

        assertEq(user1.balance, user1BalanceBefore + 100 ether);
    }
    
    // ========================================================================
    // BOT WITHDRAW/DEPOSIT TESTS
    // ========================================================================
    
    function testBotWithdraw() public {
        vm.prank(user1);
        vault.depositNative{value: 100 ether}();
        
        uint256 botBalanceBefore = bot.balance;
        vm.prank(bot);
        vault.botWithdraw(50 ether, "Deploy to AI strategy");
        
        assertEq(bot.balance, botBalanceBefore + 50 ether);
    }
    
    function testBotDeposit() public {
        vm.startPrank(bot);
        vault.botDeposit{value: 100 ether}(0);
        assertEq(address(vault).balance, 100 ether);
        vm.stopPrank();
    }
    
    // ========================================================================
    // ADMIN FUNCTION TESTS
    // ========================================================================
    
    function testSetDepositCaps() public {
        vault.setDepositCaps(5000 ether, 1_000_000 ether);
        assertEq(vault.maxDepositPerUser(), 5000 ether);
        assertEq(vault.maxTotalDeposits(), 1_000_000 ether);
    }
    
    function testSetBotAddress() public {
        address newBot = makeAddr("newBot");
        vault.setBotAddress(newBot);
        assertEq(vault.botAddress(), newBot);
    }
    
    function testSetEarlyWithdrawalPenalty() public {
        vault.setEarlyWithdrawalPenalty(300); // 3%
        assertEq(vault.earlyWithdrawalPenalty(), 300);
    }
    
    function testPauseUnpause() public {
        vault.pause();
        assertTrue(vault.isPaused());
        
        vm.prank(user1);
        vm.expectRevert(KiloVault.VaultPaused.selector);
        vault.depositNative{value: 100 ether}();
        
        vault.unpause();
        assertFalse(vault.isPaused());
    }
    
    // ========================================================================
    // INTEGRATION TESTS
    // ========================================================================
    
    function testStarterPackageJourney() public {
        // Day 0: User buys $50 package
        vm.startPrank(bot);
        vault.botDepositNativeOnBehalf{value: 50 ether}(user1);
        
        // Day 10: User buys $25 package (merges + extends lock)
        vm.roll(block.number + 10 days); 
        vault.botDepositNativeOnBehalf{value: 25 ether}(user1);
        
        // Verify: still 1 deposit, 75 KAIA total
        assertEq(vault.getUserDepositCount(user1), 1);
        assertEq(vault.balanceOf(user1), 75 ether);
        
        (,, uint256 unlock,, bool isLocked,,,, bool canWithdraw,) = vault.getUserDeposit(user1, 0);
        assertTrue(isLocked);
        assertFalse(canWithdraw);
        assertEq(unlock, block.number + 15 days); // Lock reset
        
        // Fast forward 15 days
        vm.roll(block.number + 15 days);
        
        vm.stopPrank();

        // User can now withdraw
        vm.startPrank(user1);
        uint256 shares = vault.balanceOf(user1);
        uint256 requestId = vault.requestWithdrawal(0, shares);

        vm.stopPrank();

        (,,, uint256 assets,,, ) = vault.withdrawalRequests(requestId);
        assertEq(assets, 75 ether); // No penalty
    }
    
    function testMixedDepositJourney() public {
        // Bot deposit: 50 KAIA (locked 15 days)
        vm.prank(bot);
        vault.botDepositNativeOnBehalf{value: 50 ether}(user1);
        
        // Direct deposit: 100 KAIA (no lock)
        vm.prank(user1);
        vault.depositNative{value: 100 ether}();
        
        // User has 2 deposits
        assertEq(vault.getUserDepositCount(user1), 2);
        
        // Can withdraw direct deposit immediately
        vm.prank(user1);
        uint256 directShares = 100 ether;
        uint256 requestId = vault.requestWithdrawal(1, directShares);
        
        (,,, uint256 assets,,, ) = vault.withdrawalRequests(requestId);
        assertEq(assets, 100 ether); // No penalty
        
        // Cannot withdraw bot deposit yet (would have penalty)
        // Wait for lock to expire...
    }
    
    receive() external payable {}
}
