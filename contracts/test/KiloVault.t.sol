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
    
    event WithdrawalRequested(
        uint256 indexed requestId,
        address indexed user,
        uint256 depositIndex,
        uint256 shares,
        uint256 assets,
        bool isEarlyWithdrawal
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
        uint256 depositIndex = vault.depositNative{value: depositAmount}(0);
        
        assertEq(depositIndex, 0);
        assertEq(vault.balanceOf(user1), depositAmount);
        assertEq(vault.totalManagedAssets(), depositAmount);
        assertEq(vault.userTotalDeposits(user1), depositAmount);
        
        vm.stopPrank();
    }
    
    function testUserDeposit15DayLock() public {
        vm.startPrank(user1);
        
        uint256 depositAmount = 100 ether;
        uint256 depositIndex = vault.depositNative{value: depositAmount}(15);
        
        (
            uint256 shares,
            uint256 assets,
            uint256 unlockBlock,
            uint256 lockDuration,
            bool isLocked,
            ,
            bool isBotDeposit,
            ,
            bool canWithdraw
        ) = vault.getUserDeposit(user1, depositIndex);
        
        assertEq(shares, depositAmount);
        assertEq(assets, depositAmount);
        assertTrue(isLocked);
        assertFalse(isBotDeposit);
        assertFalse(canWithdraw);
        assertEq(lockDuration, 15 days);
        
        vm.stopPrank();
    }

    
    function testRevertInvalidLockDuration() public {
        vm.startPrank(user1);
        
        vm.expectRevert(KiloVault.InvalidLockDuration.selector);
        vault.depositNative{value: 100 ether}(10); // Invalid: only 0, 15 allowed
        
        vm.stopPrank();
    }
    
    function testRevertBelowMinDeposit() public {
        vm.startPrank(user1);
        
        vm.expectRevert(KiloVault.BelowMinDeposit.selector);
        vault.depositNative{value: 5 ether}(0); // Below 10 KAIA minimum
        
        vm.stopPrank();
    }
    
    function testRevertExceedsMaxDepositPerUser() public {
        vm.startPrank(user1);
        
        vm.expectRevert(KiloVault.ExceedsMaxDepositPerUser.selector);
        vault.depositNative{value: 1001 ether}(0); // Exceeds 1000 KAIA per user cap
        
        vm.stopPrank();
    }
    
    function testMultipleDepositsPerUser() public {
        vm.startPrank(user1);
        
        // Deposit 1: No lock
        vault.depositNative{value: 50 ether}(0);
        
        // Deposit 2: 15-day lock
        vault.depositNative{value: 75 ether}(15);
        
        assertEq(vault.getUserDepositCount(user1), 2);
        assertEq(vault.userTotalDeposits(user1), 125 ether);
        
        vm.stopPrank();
    }
    
    // ========================================================================
    // BOT DEPOSIT ON-BEHALF TESTS
    // ========================================================================
    
    function testBotDepositOnBehalf15Day() public {
        vm.startPrank(bot);
        
        uint256 depositAmount = 50 ether;
        uint256 depositIndex = vault.botDepositNativeOnBehalf{value: depositAmount}(user1, 15);
        
        assertEq(vault.balanceOf(user1), depositAmount); // User receives shares
        
        (,,,, bool isLocked,, bool isBotDeposit,,) = vault.getUserDeposit(user1, depositIndex);
        assertTrue(isLocked);
        assertTrue(isBotDeposit);
        
        vm.stopPrank();
    }

    
    function testRevertBotDepositNoLock() public {
        vm.startPrank(bot);
        
        vm.expectRevert(KiloVault.InvalidLockDuration.selector);
        vault.botDepositNativeOnBehalf{value: 50 ether}(user1, 0); // Bot must use 15
        
        vm.stopPrank();
    }
    
    function testRevertNonBotDepositOnBehalf() public {
        vm.startPrank(user2);
        
        vm.expectRevert(KiloVault.NotBot.selector);
        vault.botDepositNativeOnBehalf{value: 50 ether}(user1, 15);
        
        vm.stopPrank();
    }
    
    // ========================================================================
    // BOT WITHDRAW/DEPOSIT TESTS
    // ========================================================================
    
    function testBotWithdraw() public {
        // User deposits first
        vm.prank(user1);
        vault.depositNative{value: 100 ether}(0);
        
        // Bot withdraws
        uint256 botBalanceBefore = bot.balance;
        
        vm.prank(bot);
        vault.botWithdraw(50 ether, "Deploy to AI strategy");
        
        assertEq(bot.balance, botBalanceBefore + 50 ether);
    }
    
    function testBotDeposit() public {
        vm.startPrank(bot);
        
        uint256 depositAmount = 100 ether;
        vault.botDeposit{value: depositAmount}(0);
        
        assertEq(address(vault).balance, depositAmount);
        
        vm.stopPrank();
    }
    
    // ========================================================================
    // WITHDRAWAL REQUEST TESTS
    // ========================================================================
    
    function testWithdrawalRequestNoLock() public {
        vm.startPrank(user1);
        
        // Deposit
        vault.depositNative{value: 100 ether}(0);
        uint256 shares = vault.balanceOf(user1);
        
        // Request withdrawal
        uint256 requestId = vault.requestWithdrawal(0, shares);
        
        assertEq(requestId, 1);
        assertEq(vault.balanceOf(user1), 0); // Shares burned
        
        vm.stopPrank();
    }
    
    function testWithdrawalRequestEarlyPenalty() public {
        vm.startPrank(user1);
        
        // Deposit with 15-day lock
        vault.depositNative{value: 100 ether}(15);
        uint256 shares = vault.balanceOf(user1);
        
        // Request early withdrawal (before unlock)
        uint256 requestId = vault.requestWithdrawal(0, shares);
        
        // Check withdrawal request
        (,, uint256 requestedShares, uint256 requestedAssets,, bool processed,) = 
            vault.withdrawalRequests(requestId);
        
        assertEq(requestedShares, shares);
        // Assets should be less due to 5% penalty
        assertLt(requestedAssets, 100 ether);
        assertEq(requestedAssets, 95 ether); // 100 - 5% = 95
        assertFalse(processed);
        
        vm.stopPrank();
    }
    
    function testWithdrawalAfterUnlock() public {
        vm.startPrank(user1);
        
        // Deposit with 15-day lock
        vault.depositNative{value: 100 ether}(15);
        uint256 shares = vault.balanceOf(user1);
        
        // Fast forward 15 days
        vm.roll(block.number + 15 days);
        
        // Request withdrawal (no penalty)
        uint256 requestId = vault.requestWithdrawal(0, shares);
        
        (,,, uint256 requestedAssets,,, ) = vault.withdrawalRequests(requestId);
        assertEq(requestedAssets, 100 ether); // No penalty
        
        vm.stopPrank();
    }
    
    function testProcessAndClaimWithdrawal() public {
        vm.startPrank(user1);
        
        // Deposit
        vault.depositNative{value: 100 ether}(0);
        uint256 shares = vault.balanceOf(user1);
        
        // Request withdrawal
        uint256 requestId = vault.requestWithdrawal(0, shares);
        
        vm.stopPrank();
        
        // Bot processes withdrawal
        uint256[] memory requestIds = new uint256[](1);
        requestIds[0] = requestId;
        
        vm.prank(bot);
        vault.processWithdrawals{value: 100 ether}(requestIds);
        
        // User claims
        uint256 user1BalanceBefore = user1.balance;
        
        vm.prank(user1);
        vault.claimWithdrawal(requestId);
        
        assertEq(user1.balance, user1BalanceBefore + 100 ether);
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
    
    function testRevertPenaltyTooHigh() public {
        vm.expectRevert("Max 10%");
        vault.setEarlyWithdrawalPenalty(1500); // 15% - too high
    }
    
    function testPauseUnpause() public {
        vault.pause();
        assertTrue(vault.isPaused());
        
        // Should revert when paused
        vm.prank(user1);
        vm.expectRevert(KiloVault.VaultPaused.selector);
        vault.depositNative{value: 100 ether}(0);
        
        vault.unpause();
        assertFalse(vault.isPaused());
    }
    
    function testUpdateManagedAssets() public {
        // Initial deposit
        vm.prank(user1);
        vault.depositNative{value: 100 ether}(0);
        
        // Bot makes profit
        vault.updateManagedAssets(120 ether);
        
        assertEq(vault.totalManagedAssets(), 120 ether);
    }
    
    // ========================================================================
    // VIEW FUNCTION TESTS
    // ========================================================================
    
    function testSharePrice() public {
        // Initial price should be 1:1
        assertEq(vault.sharePrice(), 1e18);
        
        // After deposit
        vm.prank(user1);
        vault.depositNative{value: 100 ether}(0);
        
        assertEq(vault.sharePrice(), 1e18);
        
        // After profit
        vault.updateManagedAssets(118 ether); // 100 + 20 profit - 2 fee
        
        // Price should increase
        assertGt(vault.sharePrice(), 1e18);
    }
    
    function testPreviewDeposit() public {
        uint256 shares = vault.previewDeposit(100 ether);
        assertEq(shares, 100 ether); // 1:1 initially
    }
    
    function testGetUserDepositCapRemaining() public {
        vm.prank(user1);
        vault.depositNative{value: 200 ether}(0);
        
        uint256 remaining = vault.getUserDepositCapRemaining(user1);
        assertEq(remaining, 800 ether); // 1000 - 200
    }
    
    function testGetTotalDepositCapRemaining() public {
        vm.prank(user1);
        vault.depositNative{value: 1000 ether}(0);
        
        uint256 remaining = vault.getTotalDepositCapRemaining();
        assertEq(remaining, 499_000 ether); // 500,000 - 1,000
    }
    
    function testLiquidBalance() public {
        vm.prank(user1);
        vault.depositNative{value: 100 ether}(0);
        
        assertEq(vault.liquidBalance(), 100 ether);
    }
    
    // ========================================================================
    // INTEGRATION TESTS
    // ========================================================================
    
    function testCompleteUserJourney() public {
        // 1. User deposits with 15-day lock
        vm.startPrank(user1);
        vault.depositNative{value: 100 ether}(15);
        vm.stopPrank();
        
        // 2. Bot withdraws to manage
        vm.startPrank(bot);
        vault.botWithdraw(50 ether, "Leverage strategy");
        vm.stopPrank();
        
        // 3. Bot makes profit and deposits back
        vm.startPrank(bot);
        vault.botDeposit{value: 60 ether}(0); // 50 + 10 profit
        vm.stopPrank();
        
        // 4. Owner updates managed assets
        vault.updateManagedAssets(110 ether); // Reflects total value
        
        // 5. Fast forward past lock period
        vm.roll(block.number + 15 days);
        
        // 6. User withdraws
        vm.startPrank(user1);
        uint256 shares = vault.balanceOf(user1);
        uint256 requestId = vault.requestWithdrawal(0, shares);
        vm.stopPrank();
        
        // 7. Bot processes
        uint256[] memory ids = new uint256[](1);
        ids[0] = requestId;
        vm.prank(bot);
        vault.processWithdrawals{value: 110 ether}(ids);
        
        // 8. User claims (should get more than initial 100 due to profits)
        vm.prank(user1);
        vault.claimWithdrawal(requestId);
        
        // User should have profit
        assertGt(user1.balance, 9900 ether); // Started with 10000, deposited 100
    }
    
    receive() external payable {}
}
