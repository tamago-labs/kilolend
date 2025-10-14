// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import {Script, console} from "forge-std/Script.sol";
import "../../src/KiloVault.sol";

/**
 * @title BotWithdraw - Mainnet
 * @notice Bot withdraws assets from vault to manage externally
 * @dev Used to deploy funds to:
 *      - Leverage strategies (supply to lending, borrow, loop)
 *      - Yield farming protocols
 *      - AI trading strategies
 *      - External DeFi protocols
 * @dev IMPORTANT: After withdrawal, funds are managed off-vault
 *      - Remember to deposit back with profit/loss
 *      - Update managed assets to reflect external value
 * @dev Usage: 
 *   forge script script/utility/5-BotWithdraw.s.sol --rpc-url $KAIA_RPC_URL --broadcast
 */
contract BotWithdrawScript is Script {
    
    // Contract address - UPDATE THIS after vault deployment
    address public constant VAULT_ADDRESS = 0xFe575cdE21BEb23d9D9F35e11E443d41CE8e68E3; // TODO: Set vault address
    
    // Withdrawal amount in KAIA (change this value)
    // Common scenarios:
    // - Deploy to leverage strategy: 50-80% of liquid balance
    // - Emergency liquidity: Small amount for pending withdrawals
    // - Rebalancing: Calculated based on strategy allocation
    uint256 public constant  WITHDRAW_AMOUNT = 20e18; // Default: 100 KAIA
    
    // Reason for withdrawal (for transparency and tracking)
    // Examples:
    // - "Deploy to 3x leverage strategy on KiloLend"
    // - "Supply to yield farming protocol"
    // - "AI trading bot deployment"
    // - "Emergency liquidity for pending withdrawals"
    // - "Rebalancing: reduce exposure"
    string public constant WITHDRAW_REASON = "Deploy to leverage strategy";
    
    // Safety check: Minimum liquid balance to maintain after withdrawal
    // This ensures vault can still process some user withdrawals
    uint256 public constant MIN_LIQUID_BALANCE_AFTER = 10e18; // Default: 10 KAIA
    
    function run() external {
        string memory privateKeyString = vm.envString("PRIVATE_KEY");
        uint256 botPrivateKey = _parsePrivateKey(privateKeyString);
        address bot = vm.addr(botPrivateKey);
        
        console.log("===========================================");
        console.log("Bot Withdraw from KiloVault");
        console.log("===========================================");
        console.log("Chain ID:", block.chainid);
        require(block.chainid == 8217, "Must be on KAIA Mainnet (chain ID 8217)");
        require(VAULT_ADDRESS != address(0), "Vault address not set");
        
        console.log("Bot Address:", bot);
        console.log("Vault Address:", VAULT_ADDRESS);
        console.log("Withdraw Amount:", WITHDRAW_AMOUNT / 1e18, "KAIA");
        console.log("Reason:", WITHDRAW_REASON);
        
        // Check bot has gas
        uint256 balance = bot.balance;
        console.log("Bot KAIA Balance:", balance / 1e18, "KAIA");
        require(balance > 0.01 ether, "Insufficient KAIA for gas");
        
        // Get vault contract
        KiloVault vault = KiloVault(payable(VAULT_ADDRESS));
        
        // Verify bot is authorized
        address authorizedBot = vault.botAddress();
        address owner = vault.owner();
        console.log("Authorized Bot:", authorizedBot);
        console.log("Vault Owner:", owner);
        require(bot == authorizedBot || bot == owner, "Not authorized bot or owner");
        
        // Get vault state before withdrawal
        uint256 totalManagedBefore = vault.totalManagedAssets();
        uint256 liquidBalanceBefore = vault.liquidBalance();
        uint256 totalSupply = vault.totalSupply();
        uint256 sharePriceBefore = vault.sharePrice();
        uint256[] memory pendingRequests = vault.getPendingRequests();
        
        console.log("\n=== Vault State Before Withdrawal ===");
        console.log("Total Managed Assets:", totalManagedBefore / 1e18, "KAIA");
        console.log("Liquid Balance:", liquidBalanceBefore / 1e18, "KAIA");
        console.log("Total Shares:", totalSupply / 1e18);
        console.log("Share Price:", sharePriceBefore / 1e18);
        console.log("Pending Withdrawal Requests:", pendingRequests.length);
        
        // Safety checks
        console.log("\n=== Safety Checks ===");
        
        // 1. Check vault has enough liquid balance
        require(liquidBalanceBefore >= WITHDRAW_AMOUNT, "Insufficient liquid balance in vault");
        console.log("Vault has sufficient liquid balance");
        
        // 2. Check remaining liquid balance after withdrawal
        uint256 liquidBalanceAfterWithdraw = liquidBalanceBefore - WITHDRAW_AMOUNT;
        require(
            liquidBalanceAfterWithdraw >= MIN_LIQUID_BALANCE_AFTER,
            "Withdrawal would leave insufficient liquid balance"
        );
        console.log("Minimum liquid balance will be maintained:", MIN_LIQUID_BALANCE_AFTER / 1e18, "KAIA");
        
        // 3. Warn if there are pending withdrawal requests
        if (pendingRequests.length > 0) {
            console.log("  WARNING:", pendingRequests.length, "pending withdrawal requests");
            console.log("  Ensure sufficient liquidity remains for user withdrawals");
        } else {
            console.log(" No pending withdrawal requests");
        }
        
        // 4. Calculate withdrawal as percentage of managed assets
        uint256 withdrawPercent = (WITHDRAW_AMOUNT * 100) / totalManagedBefore;
        console.log("Withdrawing", withdrawPercent, "% of managed assets");
        
        if (withdrawPercent > 80) {
            console.log("  WARNING: Withdrawing >80% of managed assets!");
        } else if (withdrawPercent > 50) {
            console.log(" CAUTION: Withdrawing >50% of managed assets");
        } else {
            console.log(" Withdrawal amount is reasonable");
        }
        
        vm.startBroadcast(botPrivateKey);
        
        // Withdraw assets from vault
        console.log("\n=== Executing Bot Withdrawal ===");
        console.log("Withdrawing", WITHDRAW_AMOUNT / 1e18, "KAIA...");
        console.log("Reason:", WITHDRAW_REASON);
        
        vault.botWithdraw(WITHDRAW_AMOUNT, WITHDRAW_REASON);
        console.log(" Bot withdrawal successful");
        
        vm.stopBroadcast();
        
        // Get vault state after withdrawal
        uint256 totalManagedAfter = vault.totalManagedAssets();
        uint256 liquidBalanceAfter = vault.liquidBalance();
        uint256 sharePriceAfter = vault.sharePrice();
        // uint256 botBalanceAfter = bot.balance;
        
        console.log("\n=== Vault State After Withdrawal ===");
        console.log("Total Managed Assets:", totalManagedAfter / 1e18, "KAIA");
        console.log("Liquid Balance:", liquidBalanceAfter / 1e18, "KAIA");
        console.log("Total Shares:", totalSupply / 1e18);
        console.log("Share Price:", sharePriceAfter / 1e18);
        
        // console.log("\n=== Bot Wallet ===");
        // console.log("Bot Balance Before:", balance / 1e18, "KAIA");
        // console.log("Bot Balance After:", botBalanceAfter / 1e18, "KAIA");
        // console.log("Received:", (botBalanceAfter - balance) / 1e18, "KAIA");
        
        // Verify withdrawal
        uint256 liquidChange = liquidBalanceBefore - liquidBalanceAfter;
        require(liquidChange == WITHDRAW_AMOUNT, "Unexpected liquid balance change");
        console.log("\n  Withdrawal verified:", liquidChange / 1e18, "KAIA");
        
        // Calculate utilization
        uint256 externalAssets = totalManagedAfter - liquidBalanceAfter;
        uint256 utilization = (externalAssets * 100) / totalManagedAfter;
        
        console.log("\n=== Asset Allocation ===");
        console.log("Liquid (in vault):", liquidBalanceAfter / 1e18, "KAIA");
        console.log("External (managed by bot):", externalAssets / 1e18, "KAIA");
        console.log("Utilization:", utilization, "%");
        
        if (utilization > 90) {
            console.log("  WARNING: Very high utilization (>90%)");
            console.log("  Limited liquidity for user withdrawals");
        } else if (utilization > 70) {
            console.log("  High utilization (>70%)");
            console.log("  Monitor for withdrawal requests");
        } else {
            console.log("  Healthy utilization ratio");
        }
        
        console.log("\n===========================================");
        console.log("Bot Withdrawal Complete!");
        console.log("===========================================");
        
        console.log("\n  IMPORTANT NEXT STEPS:");
        console.log("1. Deploy withdrawn funds to intended strategy");
        console.log("2. Track external positions and their value");
        console.log("3. Monitor vault for withdrawal requests");
        console.log("4. When strategy generates returns/losses:");
        console.log("   - Deposit funds back: forge script script/mainnet/8-BotDeposit.s.sol");
        console.log("   - Update managed assets to reflect total value");
        
        console.log("\n  Monitoring Commands:");
        console.log("# Check liquid balance");
        console.log("cast call", VAULT_ADDRESS, '"liquidBalance()"');
        console.log("");
        console.log("# Check managed assets");
        console.log("cast call", VAULT_ADDRESS, '"totalManagedAssets()"');
        console.log("");
        console.log("# Check pending withdrawals");
        console.log("cast call", VAULT_ADDRESS, '"getPendingRequests()"');
        console.log("");
        console.log("# Check share price");
        console.log("cast call", VAULT_ADDRESS, '"sharePrice()"');
         
    }
    
    function _parsePrivateKey(string memory privateKeyString) internal pure returns (uint256) {
        if (bytes(privateKeyString)[0] == '0' && bytes(privateKeyString)[1] == 'x') {
            return vm.parseUint(privateKeyString);
        } else {
            return vm.parseUint(string(abi.encodePacked("0x", privateKeyString)));
        }
    }
}
