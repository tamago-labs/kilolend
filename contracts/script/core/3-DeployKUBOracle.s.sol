// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import {Script, console} from "forge-std/Script.sol";
import "../../src/KiloPriceOracle.sol";

/**
 * @title DeployKUBOracle
 * @notice Deploy KiloPriceOracle for KUB Chain (Chain ID 96)
 * @dev Usage: 
 *   forge script script/core/3-DeployKUBOracle.s.sol --rpc-url $KUB_RPC_URL --broadcast
 */
contract DeployKUBOracle is Script {
    
    function run() external {
        string memory privateKeyString = vm.envString("PRIVATE_KEY");
        uint256 deployerPrivateKey = _parsePrivateKey(privateKeyString);
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("===========================================");
        console.log("Deploying KiloPriceOracle to KUB Chain");
        console.log("===========================================");
        console.log("Chain ID:", block.chainid);
        require(block.chainid == 96, "Must deploy to KUB Chain (chain ID 96)");
        
        console.log("Deployer address:", deployer);
        console.log("Block number:", block.number);
        
        // Check deployer balance
        uint256 balance = deployer.balance;
        console.log("Deployer balance:", balance / 1e18, "KUB");
        require(balance > 0.1 ether, "Insufficient balance for deployment (need at least 0.1 KUB)");
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy Oracle
        KiloPriceOracle oracle = new KiloPriceOracle();
        
        // Set cKUB as native token (wraps KUB)
        oracle.setNativeCToken("cKUB", true);
        console.log("cKUB set as native token");
        
        // Initial oracle setup with fallback prices
        // KUB = $1.04 (native token)
        oracle.setDirectPrice(
            0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE, // Native token address
            1.04e18
        );
        
        // KUSDT = $1.00 (stablecoin)
        oracle.setDirectPrice(
            0x7d984C24d2499D840eB3b7016077164e15E5faA6, // KUSDT address
            1e18
        );
        
        vm.stopBroadcast();
        
        console.log("===========================================");
        console.log("Oracle deployed successfully!");
        console.log("===========================================");
        console.log("KiloPriceOracle:", address(oracle));
        console.log("");
        console.log("Initial Prices (Fallback Mode):");
        console.log("  - KUB (native): $1.04");
        console.log("  - KUSDT: $1.00");
        console.log("");
        console.log("Note: Prices are manually set using fallback mode.");
        console.log("      To use BKC aggregators later, call setBKCFeed() and");
        console.log("      setOracleMode(token, 3) for each token.");
    }
    
    function _parsePrivateKey(string memory privateKeyString) internal pure returns (uint256) {
        if (bytes(privateKeyString)[0] == '0' && bytes(privateKeyString)[1] == 'x') {
            return vm.parseUint(privateKeyString);
        } else {
            return vm.parseUint(string(abi.encodePacked("0x", privateKeyString)));
        }
    }
}