// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import {Script, console} from "forge-std/Script.sol";
import "../../src/KiloPriceOracle.sol";

/**
 * @title DeployOracle
 * @notice Deploy KiloPriceOracle for KAIA network
 * @dev Usage: 
 *   forge script script/2-DeployOracle.s.sol --rpc-url $KAIA_RPC_URL --broadcast --verify
 */
contract DeployOracle is Script {
    
    function run() external {
        string memory privateKeyString = vm.envString("PRIVATE_KEY");
        uint256 deployerPrivateKey = _parsePrivateKey(privateKeyString);
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("===========================================");
        console.log("Deploying KiloPriceOracle to KAIA Network");
        console.log("===========================================");
        console.log("Chain ID:", block.chainid);
        console.log("Deployer address:", deployer);
        console.log("Block number:", block.number);
        
        // Check deployer balance
        uint256 balance = deployer.balance;
        console.log("Deployer balance:", balance / 1e18, "KAIA");
        require(balance > 0.1 ether, "Insufficient balance for deployment (need at least 0.1 KAIA)");
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy Oracle
        KiloPriceOracle oracle = new KiloPriceOracle();
        
        // Initial oracle setup - set mock prices for common tokens
        // USDT = $1.00 (stablecoin)
        oracle.setDirectPrice(
            _getTokenAddress("USDT"), 
            1e18
        );
        
        // KAIA = $0.15 (example price for native token)
        oracle.setDirectPrice(
            0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE, // Native token address
            0.15e18
        );
        
        // stKAIA = $0.16 (staked KAIA with slight premium)
        oracle.setDirectPrice(
            _getTokenAddress("stKAIA"),
            0.16e18
        );
        
        // BORA = $0.05 (example price)
        oracle.setDirectPrice(
            _getTokenAddress("BORA"),
            0.05e18
        );
        
        // MBX = $0.30 (example price)
        oracle.setDirectPrice(
            _getTokenAddress("MBX"),
            0.30e18
        );
        
        vm.stopBroadcast();
        
        console.log("===========================================");
        console.log("Oracle deployed successfully!");
        console.log("===========================================");
        console.log("KiloPriceOracle:", address(oracle));
        console.log("");
        console.log("Initial Prices Set:");
        console.log("- USDT: $1.00");
        console.log("- KAIA: $0.15");
        console.log("- stKAIA: $0.16");
        console.log("- BORA: $0.05");
        console.log("- MBX: $0.30");
        console.log("");
        console.log("NOTE: Update token addresses in _getTokenAddress() function");
        console.log("      with actual deployed token contract addresses");
    }
    
    function _parsePrivateKey(string memory privateKeyString) internal pure returns (uint256) {
        if (bytes(privateKeyString)[0] == '0' && bytes(privateKeyString)[1] == 'x') {
            return vm.parseUint(privateKeyString);
        } else {
            return vm.parseUint(string(abi.encodePacked("0x", privateKeyString)));
        }
    }
    
    function _getTokenAddress(string memory symbol) internal view returns (address) {
        // TODO: Replace these with actual deployed token addresses
        // These are placeholder addresses - update after deploying mock tokens
        
        if (keccak256(bytes(symbol)) == keccak256(bytes("USDT"))) {
            return 0x1111111111111111111111111111111111111111; // Replace with actual USDT address
        } else if (keccak256(bytes(symbol)) == keccak256(bytes("stKAIA"))) {
            return 0x2222222222222222222222222222222222222222; // Replace with actual stKAIA address
        } else if (keccak256(bytes(symbol)) == keccak256(bytes("BORA"))) {
            return 0x3333333333333333333333333333333333333333; // Replace with actual BORA address
        } else if (keccak256(bytes(symbol)) == keccak256(bytes("MBX"))) {
            return 0x4444444444444444444444444444444444444444; // Replace with actual MBX address
        }
        
        revert("Unknown token symbol");
    }
}