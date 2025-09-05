// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Script, console} from "forge-std/Script.sol";
import "../../src/mocks/MockToken.sol";

/**
 * @title DeployMockTokens
 * @notice Deploy mock tokens for KAIA testnet (chain ID 1001)
 * @dev Usage: 
 *   forge script script/DeployMockTokens.s.sol --rpc-url $KAIA_TESTNET_RPC_URL --broadcast --verify
 */
contract DeployMockTokens is Script {
    
    function run() external {
        string memory privateKeyString = vm.envString("PRIVATE_KEY");
        uint256 deployerPrivateKey;
        
        // Handle private key with or without 0x prefix
        if (bytes(privateKeyString)[0] == '0' && bytes(privateKeyString)[1] == 'x') {
            deployerPrivateKey = vm.parseUint(privateKeyString);
        } else {
            deployerPrivateKey = vm.parseUint(string(abi.encodePacked("0x", privateKeyString)));
        }
        
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("===========================================");
        console.log("Deploying Mock Tokens to KAIA Testnet");
        console.log("===========================================");
        console.log("Chain ID:", block.chainid);
        require(block.chainid == 1001, "Must deploy to KAIA testnet (chain ID 1001)");
        
        console.log("Deployer address:", deployer);
        console.log("Block number:", block.number); 
        
        // Check deployer balance
        uint256 balance = deployer.balance;
        console.log("Deployer balance:", balance / 1e18, "KAIA");
        require(balance > 0.1 ether, "Insufficient balance for deployment (need at least 0.1 KAIA)");
        
        // Start broadcasting transactions to KAIA testnet
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy mock stablecoins and volatile tokens
        MockToken usdt = new MockToken("Tether USD", "USDT", 6, 1000000e6); // 1M USDT
        MockToken six = new MockToken("SIX Token", "SIX", 18, 1000000e18); // 1M SIX
        MockToken bora = new MockToken("BORA Token", "BORA", 18, 1000000e18); // 1M BORA
        MockToken mbx = new MockToken("MARBLEX Token", "MBX", 18, 1000000e18); // 1M MBX
        
        // Stop broadcasting
        vm.stopBroadcast();
        
        console.log("===========================================");
        console.log("Mock Tokens deployed successfully!");
        console.log("===========================================");
        console.log("USDT:", address(usdt)); 
        console.log("SIX:", address(six));
        console.log("BORA:", address(bora));
        console.log("MBX:", address(mbx));
          
    }
     
}
