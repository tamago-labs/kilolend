// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "forge-std/Script.sol";
import "../../src/KiloVault.sol";

/**
 * @title Configure KiloVault - Testnet
 * @notice Configures KiloVault settings on testnet
 * @dev Usage: forge script script/testnet/5-ConfigureKiloVault.s.sol:ConfigureKiloVault --rpc-url $TESTNET_RPC_URL --private-key $PRIVATE_KEY --broadcast -vvvv
 */
contract ConfigureKiloVault is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address vaultAddress = vm.envAddress("TESTNET_VAULT_ADDRESS");
        address botAddress = vm.envAddress("BOT_ADDRESS");
        
        console.log("===========================================");
        console.log("Configuring KiloVault - TESTNET");
        console.log("===========================================");
        console.log("Network: Kaia Testnet (Kairos)");
        console.log("Vault:", vaultAddress);
        console.log("Bot Address:", botAddress);
        console.log("");
        
        require(block.chainid == 1001, "Wrong network! Use Kaia Testnet");
        
        KiloVault vault = KiloVault(payable(vaultAddress));
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Set bot address
        if (vault.botAddress() != botAddress) {
            console.log("Setting bot address...");
            vault.setBotAddress(botAddress);
            console.log("Bot address set to:", botAddress);
        } else {
            console.log("Bot address already set");
        }
        
        // Testnet-specific configuration
        // Keep lower limits for testing
        uint256 maxPerUser = 10_000 ether;  // 10k KAIA per user
        uint256 maxTotal = 500_000 ether;    // 500k KAIA total
        
        console.log("");
        console.log("Updating deposit caps for testnet...");
        console.log("- Max Per User:", maxPerUser / 1e18, "KAIA");
        console.log("- Max Total:", maxTotal / 1e18, "KAIA");
        
        vault.setDepositCaps(maxPerUser, maxTotal);
        
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
        console.log("");
        
        console.log("===========================================");
        console.log("Ready for Testing!");
        console.log("===========================================");
        console.log("Test Commands:");
        console.log("");
        console.log("1. Deposit 100 KAIA:");
        console.log('   cast send', vaultAddress, '"depositNative(uint256)" 0 --value 100ether');
        console.log("");
        console.log("2. Check balance:");
        console.log('   cast call', vaultAddress, '"balanceOf(address)" YOUR_ADDRESS');
        console.log("");
        console.log("3. Check deposits:");
        console.log('   cast call', vaultAddress, '"getUserDepositCount(address)" YOUR_ADDRESS');
        console.log("");
    }
}
