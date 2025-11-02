// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "forge-std/Script.sol";
import "../../src/extra/MigrationBonus.sol";

contract DeployMigrationBonus is Script {
    function run() external {
        // Get V1 Comptroller address  
        address v1Comptroller = 0x2591d179a0B1dB1c804210E111035a3a13c95a48;
        
        require(v1Comptroller != address(0), "V1_COMPTROLLER_ADDRESS not set");
        
        console.log("Deploying MigrationBonus contract...");
        console.log("V1 Comptroller:", v1Comptroller);
        console.log("Deployer:", msg.sender);
        
        string memory privateKeyString = vm.envString("PRIVATE_KEY");
        uint256 deployerPrivateKey = _parsePrivateKey(privateKeyString); 
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy MigrationBonus
        MigrationBonus migrationBonus = new MigrationBonus(v1Comptroller);
        
        console.log("MigrationBonus deployed at:", address(migrationBonus));
        console.log("Admin:", migrationBonus.admin()); 
         
        vm.stopBroadcast();
        
        console.log("\n=== Deployment Summary ===");
        console.log("Contract Address:", address(migrationBonus)); 
    }

    function _parsePrivateKey(string memory privateKeyString) internal pure returns (uint256) {
        if (bytes(privateKeyString)[0] == '0' && bytes(privateKeyString)[1] == 'x') {
            return vm.parseUint(privateKeyString);
        } else {
            return vm.parseUint(string(abi.encodePacked("0x", privateKeyString)));
        }
    }

}
