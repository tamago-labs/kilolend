// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import {Script, console} from "forge-std/Script.sol";
import "../../src/KiloVault.sol";

/**
 * @title BotDeposit - Mainnet
 * @notice Bot deposits assets back to vault and updates managed assets
 * @dev Used after bot manages funds externally (leverage, yield farming, etc.)
 * @dev This is typically called after external strategies generate returns
 * @dev Usage: 
 *   forge script script/utility/4-BotDeposit.s.sol --rpc-url $KAIA_RPC_URL --broadcast
 */
contract BotDepositScript is Script {
    
    // Contract address - UPDATE THIS after vault deployment
    address public constant VAULT_ADDRESS = 0xFe575cdE21BEb23d9D9F35e11E443d41CE8e68E3; // TODO: Set vault address
    
    // Deposit amount in KAIA (change this value)
    // Example scenarios:
    // - Returning principal after strategy: Set to withdrawn amount
    // - Returning principal + profit: Set to withdrawn + profit amount
    // - Partial return: Set to partial amount
    uint256 public constant DEPOSIT_AMOUNT = 100e18; // Default: 100 KAIA
    
    // Updated total managed assets (after deposit)
    // This reflects the new total value including:
    // - User deposits
    // - Bot-managed funds (leveraged positions, yield farming, etc.)
    // - Accrued profits or losses
    // Set to 0 to skip updateManagedAssets (bot deposit only)
    uint256 public constant NEW_TOTAL_MANAGED_ASSETS = 0; // 0 = don't update, set value to update
    
    function run() external {
        string memory privateKeyString = vm.envString("PRIVATE_KEY");
        uint256 botPrivateKey = _parsePrivateKey(privateKeyString);
        address bot = vm.addr(botPrivateKey);
        
        console.log("===========================================");
        console.log("Bot Deposit to KiloVault");
        console.log("===========================================");
        console.log("Chain ID:", block.chainid);
        require(block.chainid == 8217, "Must be on KAIA Mainnet (chain ID 8217)");
        require(VAULT_ADDRESS != address(0), "Vault address not set");
        
        console.log("Bot Address:", bot);
        console.log("Vault Address:", VAULT_ADDRESS);
        console.log("Deposit Amount:", DEPOSIT_AMOUNT / 1e18, "KAIA");
        
        // Check bot balance
        uint256 balance = bot.balance;
        console.log("Bot KAIA Balance:", balance / 1e18, "KAIA");
        require(balance >= DEPOSIT_AMOUNT + 0.01 ether, "Insufficient KAIA balance (need deposit amount + gas)");
        
        // Get vault contract
        KiloVault vault = KiloVault(payable(VAULT_ADDRESS));
        
        // Verify bot is authorized
        address authorizedBot = vault.botAddress();
        address owner = vault.owner();
        console.log("Authorized Bot:", authorizedBot);
        console.log("Vault Owner:", owner);
        require(bot == authorizedBot || bot == owner, "Not authorized bot or owner");
        
        // Get vault state before deposit
        uint256 totalManagedBefore = vault.totalManagedAssets();
        uint256 liquidBalanceBefore = vault.liquidBalance();
        uint256 totalSupply = vault.totalSupply();
        uint256 sharePriceBefore = vault.sharePrice();
        
        console.log("\n=== Vault State Before Deposit ===");
        console.log("Total Managed Assets:", totalManagedBefore / 1e18, "KAIA");
        console.log("Liquid Balance:", liquidBalanceBefore / 1e18, "KAIA");
        console.log("Total Shares:", totalSupply / 1e18);
        console.log("Share Price:", sharePriceBefore / 1e18);
        
        vm.startBroadcast(botPrivateKey);
        
        // Deposit assets back to vault
        console.log("\n=== Executing Bot Deposit ===");
        console.log("Depositing", DEPOSIT_AMOUNT / 1e18, "KAIA...");
        
        vault.botDeposit{value: DEPOSIT_AMOUNT}(0);
        console.log("Bot deposit successful");
        
        // Update managed assets if specified
        if (NEW_TOTAL_MANAGED_ASSETS > 0) {
            console.log("\n=== Updating Managed Assets ===");
            console.log("Old Total:", totalManagedBefore / 1e18, "KAIA");
            console.log("New Total:", NEW_TOTAL_MANAGED_ASSETS / 1e18, "KAIA");
            
            int256 change = int256(NEW_TOTAL_MANAGED_ASSETS) - int256(totalManagedBefore);
            if (change > 0) {
                console.log("Profit:", uint256(change) / 1e18, "KAIA");
            } else if (change < 0) {
                console.log("Loss:", uint256(-change) / 1e18, "KAIA");
            } else {
                console.log("No change");
            }
            
            vault.updateManagedAssets(NEW_TOTAL_MANAGED_ASSETS);
            console.log(" Managed assets updated");
        }
        
        vm.stopBroadcast();
        
        // Get vault state after deposit
        uint256 totalManagedAfter = vault.totalManagedAssets();
        uint256 liquidBalanceAfter = vault.liquidBalance();
        uint256 sharePriceAfter = vault.sharePrice();
        
        console.log("\n=== Vault State After Deposit ===");
        console.log("Total Managed Assets:", totalManagedAfter / 1e18, "KAIA");
        console.log("Liquid Balance:", liquidBalanceAfter / 1e18, "KAIA");
        console.log("Total Shares:", totalSupply / 1e18);
        console.log("Share Price:", sharePriceAfter / 1e18);
        
        // Calculate changes
        uint256 liquidChange = liquidBalanceAfter - liquidBalanceBefore;
        int256 managedChange = int256(totalManagedAfter) - int256(totalManagedBefore);
        
        console.log("\n=== Summary ===");
        console.log("Liquid Balance Change:", liquidChange / 1e18, "KAIA");
        
        if (managedChange > 0) {
            console.log("Managed Assets Increased:", uint256(managedChange) / 1e18, "KAIA");
        } else if (managedChange < 0) {
            console.log("Managed Assets Decreased:", uint256(-managedChange) / 1e18, "KAIA");
        } else {
            console.log("Managed Assets: No change");
        }
        
        if (sharePriceAfter != sharePriceBefore) {
            if (sharePriceAfter > sharePriceBefore) {
                uint256 increase = ((sharePriceAfter - sharePriceBefore) * 10000) / sharePriceBefore;
                console.log("Share Price Increased:", increase / 100, ".", increase % 100, "%");
            } else {
                uint256 decrease = ((sharePriceBefore - sharePriceAfter) * 10000) / sharePriceBefore;
                console.log("Share Price Decreased:", decrease / 100, ".", decrease % 100, "%");
            }
        }
        
        console.log("\n===========================================");
        console.log("Bot Deposit Complete!");
        console.log("===========================================");
        
        console.log("\nNext Steps:");
        console.log("1. Monitor vault metrics");
        console.log("2. Check user share values increased (if profit was made)");
        console.log("3. Verify liquid balance is sufficient for withdrawals");
        
        console.log("\nVerification Commands:");
        console.log("cast call", VAULT_ADDRESS, '"totalManagedAssets()"');
        console.log("cast call", VAULT_ADDRESS, '"liquidBalance()"');
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
