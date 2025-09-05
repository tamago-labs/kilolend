// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import {Script, console} from "forge-std/Script.sol";
import "../../src/KiloPriceOracle.sol";

/**
 * @title DeployOracle - Testnet
 * @notice Deploy KiloPriceOracle for KAIA Testnet (Chain ID 1001)
 * @dev Usage: 
 *   forge script script/testnet/2-DeployOracle.s.sol --rpc-url $KAIA_TESTNET_RPC_URL --broadcast --verify
 */
contract DeployOracle is Script {
    
    function run() external {
        string memory privateKeyString = vm.envString("PRIVATE_KEY");
        uint256 deployerPrivateKey = _parsePrivateKey(privateKeyString);
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("===========================================");
        console.log("Deploying KiloPriceOracle to KAIA Testnet");
        console.log("===========================================");
        console.log("Chain ID:", block.chainid);
        require(block.chainid == 1001, "Must deploy to KAIA Testnet (chain ID 1001)");
        
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
        
        // Initial oracle setup with testnet prices
        // USDT = $1.00 (stablecoin)
        oracle.setDirectPrice(
            _getTokenAddress("USDT"), 
            1e18
        );
        
        // KAIA = $0.15 (native token / only collateral)
        oracle.setDirectPrice(
            0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE, // Native token address
            0.15e18
        );
        
        // SIX = $0.02 (volatile asset)
        oracle.setDirectPrice(
            _getTokenAddress("SIX"),
            0.02e18
        );
        
        // BORA = $0.08 (volatile asset)
        oracle.setDirectPrice(
            _getTokenAddress("BORA"),
            0.08e18
        );
        
        // MBX = $0.15 (volatile asset)
        oracle.setDirectPrice(
            _getTokenAddress("MBX"),
            0.15e18
        );
        
        vm.stopBroadcast();
        
        console.log("===========================================");
        console.log("Oracle deployed successfully!");
        console.log("===========================================");
        console.log("KiloPriceOracle:", address(oracle));
        console.log("");
        console.log("Initial Testnet Prices Set:");
        console.log("- USDT: $1.00 (Stablecoin)");
        console.log("- KAIA: $0.15 (Volatile - Borrowable)");
        console.log("- SIX: $0.05 (Volatile - Borrowable)");
        console.log("- BORA: $0.10 (Volatile - Borrowable)");
        console.log("- MBX: $0.25 (Volatile - Borrowable)");
        console.log("");
        console.log("NOTE: Update token addresses in _getTokenAddress() function");
        console.log("      with actual deployed mock token contract addresses");
    }
    
    function _parsePrivateKey(string memory privateKeyString) internal pure returns (uint256) {
        if (bytes(privateKeyString)[0] == '0' && bytes(privateKeyString)[1] == 'x') {
            return vm.parseUint(privateKeyString);
        } else {
            return vm.parseUint(string(abi.encodePacked("0x", privateKeyString)));
        }
    }
    
    function _getTokenAddress(string memory symbol) internal pure returns (address) { 
        if (keccak256(bytes(symbol)) == keccak256(bytes("USDT"))) {
            return 0x5F7392Ec616F829Ab54092e7F167F518835Ac740;
        } else if (keccak256(bytes(symbol)) == keccak256(bytes("SIX"))) {
            return 0xe438E6157Ad6e38A8528fd68eBf5d8C4F57420eC;
        } else if (keccak256(bytes(symbol)) == keccak256(bytes("BORA"))) {
            return 0xFdB35092c0cf5e1A5175308CB312613972C3DF3D;
        } else if (keccak256(bytes(symbol)) == keccak256(bytes("MBX"))) {
            return 0xCeB75a9a4Af613afd42BD000893eD16fB1F0F057;
        }
        
        revert("Unknown token symbol");
    }
}
