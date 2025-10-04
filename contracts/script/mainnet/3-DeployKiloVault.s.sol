// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "forge-std/Script.sol";
import "../../src/KiloVault.sol";

/**
 * @title Deploy KiloVault - Mainnet
 * @notice Deploys KiloVault on Kaia Mainnet
 * @dev Usage: forge script script/mainnet/3-DeployKiloVault.s.sol:DeployKiloVault --rpc-url $MAINNET_RPC_URL --private-key $PRIVATE_KEY --broadcast -vvvv
 * 
 */
contract DeployKiloVault is Script {
    // Native KAIA
    address constant NATIVE_ASSET = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("===========================================");
        console.log("Deploying KiloVault - MAINNET");
        console.log("===========================================");
        console.log("Network: Kaia Mainnet");
        console.log("Chain ID:", block.chainid);
        console.log("Deployer:", deployer);
        console.log("Balance:", deployer.balance / 1e18, "KAIA");
        console.log("");
        
        require(block.chainid == 8217, "Wrong network! Use Kaia Mainnet");
        
        console.log("WARNING: You are about to deploy to MAINNET");
        console.log("Press Ctrl+C to cancel, or wait 5 seconds to continue...");
        console.log("");
        
        // Note: In actual deployment, you might want to add a confirmation step
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy KiloVault for native KAIA
        KiloVault vault = new KiloVault(
            NATIVE_ASSET,
            "Kilo Vault KAIA",
            "kvKAIA",
            18
        );
        
        console.log("===========================================");
        console.log("Deployment Successful!");
        console.log("===========================================");
        console.log("KiloVault:", address(vault));
        console.log("");
        
        // Log configuration
        console.log("Configuration:");
        console.log("- Asset: Native KAIA");
        console.log("- Decimals:", vault.assetDecimals());
        console.log("- Min Deposit:", vault.minDeposit() / 1e18, "KAIA");
        console.log("- Max Per User:", vault.maxDepositPerUser() / 1e18, "KAIA");
        console.log("- Max Total:", vault.maxTotalDeposits() / 1e18, "KAIA"); 
        console.log("- Early Penalty:", vault.earlyWithdrawalPenalty() / 100, "%");
        console.log("- Bot Address:", vault.botAddress(), "(needs to be configured)");
        console.log("- Owner:", vault.owner());
        console.log("");
        
        vm.stopBroadcast();
        
        // Save deployment info
        _saveDeployment(address(vault), deployer);
        
        console.log("===========================================");
        console.log("CRITICAL NEXT STEPS:");
        console.log("===========================================");
        console.log("1. IMMEDIATELY save vault address to .env:");
        console.log("   MAINNET_VAULT_ADDRESS=", address(vault));
        console.log("");
        console.log("2. Configure bot address (REQUIRED):");
        console.log("   forge script script/mainnet/4-ConfigureKiloVault.s.sol");
        console.log("");
        console.log("3. Verify contract on KaiaScan:");
        console.log("   https://kaiascan.io/address/", address(vault));
        console.log("");
        console.log("4. Test with SMALL amounts first");
        console.log("");
        console.log("5. Set up monitoring dashboard");
        console.log("");
        console.log("===========================================");
        console.log("DO NOT use until bot address is configured!");
        console.log("===========================================");
        console.log("");
    }
    
    function _saveDeployment(address vault, address deployer) internal {
        string memory json = string(abi.encodePacked(
            '{\n',
            '  "network": "mainnet",\n',
            '  "chainId": ', vm.toString(block.chainid), ',\n',
            '  "vault": "', vm.toString(vault), '",\n',
            '  "deployer": "', vm.toString(deployer), '",\n',
            '  "timestamp": ', vm.toString(block.timestamp), ',\n',
            '  "blockNumber": ', vm.toString(block.number), '\n',
            '}'
        ));
        
        vm.writeFile("deployments/mainnet-kilovault.json", json);
        console.log("Deployment info saved to: deployments/mainnet-kilovault.json");
    }
}
