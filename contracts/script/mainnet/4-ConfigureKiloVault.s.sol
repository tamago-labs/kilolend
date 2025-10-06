// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "forge-std/Script.sol";
import "../../src/KiloVault.sol";

/**
 * @title Configure KiloVault - Mainnet
 * @notice Configures KiloVault settings on mainnet
 * @dev Usage: forge script script/mainnet/4-ConfigureKiloVault.s.sol:ConfigureKiloVault --rpc-url $MAINNET_RPC_URL --private-key $PRIVATE_KEY --broadcast -vvvv
 */
contract ConfigureKiloVault is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address vaultAddress = vm.envAddress("MAINNET_VAULT_ADDRESS");
        address botAddress = vm.envAddress("BOT_ADDRESS");
        
        console.log("===========================================");
        console.log("Configuring KiloVault - MAINNET");
        console.log("===========================================");
        console.log("Network: Kaia Mainnet");
        console.log("Vault:", vaultAddress);
        console.log("Bot Address:", botAddress);
        console.log("");
        
        require(block.chainid == 8217, "Wrong network! Use Kaia Mainnet");
        
        KiloVault vault = KiloVault(payable(vaultAddress));
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Set bot address (CRITICAL)
        if (vault.botAddress() != botAddress) {
            console.log("Setting bot address...");
            vault.setBotAddress(botAddress);
            console.log("Bot address set to:", botAddress);
        } else {
            console.log("Bot address already set");
        }
        
        // Mainnet production configuration
        // Higher limits for production
        uint256 maxPerUser = 100_000 ether;  // 100k KAIA per user
        uint256 maxTotal = 5_000_000 ether;  // 5M KAIA total
        
        console.log("");
        console.log("Updating deposit caps for mainnet...");
        console.log("- Max Per User:", maxPerUser / 1e18, "KAIA");
        console.log("- Max Total:", maxTotal / 1e18, "KAIA");
        
        vault.setDepositCaps(maxPerUser, maxTotal);
        
        // Optional: Adjust early withdrawal penalty for mainnet
        // vault.setEarlyWithdrawalPenalty(300); // 3% instead of 5%
        
        vm.stopBroadcast();
        
        console.log("");
        console.log("===========================================");
        console.log("Configuration Complete!");
        console.log("===========================================");
        console.log("Current Settings:");
        console.log("- Bot Address:", vault.botAddress());
        console.log("- Max Per User:", vault.maxDepositPerUser() / 1e18, "KAIA");
        console.log("- Max Total:", vault.maxTotalDeposits() / 1e18, "KAIA");
        console.log("- Min Deposit:", vault.minDeposit() / 1e18, "KAIA");
        console.log("- Early Penalty:", vault.earlyWithdrawalPenalty() / 100, "%"); 
        console.log("- Is Paused:", vault.isPaused());
        console.log("- Owner:", vault.owner());
        console.log("");
    }
}
