// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "forge-std/Script.sol";
import "../../src/KiloVault.sol";

/**
 * @title Deploy KiloVault - Testnet
 * @notice Deploys KiloVault on Kaia Testnet (Kairos)
 * @dev Usage: forge script script/testnet/4-DeployKiloVault.s.sol:DeployKiloVault --rpc-url $TESTNET_RPC_URL --private-key $PRIVATE_KEY --broadcast -vvvv
 */
contract DeployKiloVault is Script {
    // Native KAIA
    address constant NATIVE_ASSET = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("===========================================");
        console.log("Deploying KiloVault - TESTNET");
        console.log("===========================================");
        console.log("Network: Kaia Testnet (Kairos)");
        console.log("Chain ID:", block.chainid);
        console.log("Deployer:", deployer);
        console.log("Balance:", deployer.balance / 1e18, "KAIA");
        console.log("");
        
        require(block.chainid == 1001, "Wrong network! Use Kaia Testnet");
        
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
        console.log("- Performance Fee:", vault.performanceFee() / 100, "%");
        console.log("- Early Penalty:", vault.earlyWithdrawalPenalty() / 100, "%");
        console.log("- Bot Address:", vault.botAddress());
        console.log("- Owner:", vault.owner());
        console.log("");
        
        vm.stopBroadcast();
        
        // Save deployment info
        _saveDeployment(address(vault), deployer);
        
        console.log("===========================================");
        console.log("Next Steps:");
        console.log("===========================================");
        console.log("1. Save vault address to .env:");
        console.log("   TESTNET_VAULT_ADDRESS=", address(vault));
        console.log("");
        console.log("2. Configure bot address:");
        console.log("   forge script script/testnet/5-ConfigureKiloVault.s.sol");
        console.log("");
        console.log("3. Test deposits:");
        console.log("   cast send", address(vault), '"depositNative(uint256)" 0 --value 100ether');
        console.log("");
        console.log("4. Verify on KaiaScan:");
        console.log("   https://kairos.kaiascan.io/address/", address(vault));
        console.log("");
    }
    
    function _saveDeployment(address vault, address deployer) internal {
        string memory json = string(abi.encodePacked(
            '{\n',
            '  "network": "testnet",\n',
            '  "chainId": ', vm.toString(block.chainid), ',\n',
            '  "vault": "', vm.toString(vault), '",\n',
            '  "deployer": "', vm.toString(deployer), '",\n',
            '  "timestamp": ', vm.toString(block.timestamp), ',\n',
            '  "blockNumber": ', vm.toString(block.number), '\n',
            '}'
        ));
        
        vm.writeFile("deployments/testnet-kilovault.json", json);
        console.log("Deployment info saved to: deployments/testnet-kilovault.json");
    }
}
