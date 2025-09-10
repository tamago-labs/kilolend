// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import {Script, console} from "forge-std/Script.sol";
import "../../src/KiloPriceOracle.sol";

/**
 * @title DeployOracle - Mainnet
 * @notice Deploy KiloPriceOracle for KAIA Mainnet (Chain ID 8217)
 * @dev Usage: 
 *   forge script script/mainnet/1-DeployOracle.s.sol --rpc-url $KAIA_RPC_URL --broadcast --verify
 */
contract DeployOracle is Script {
    
    function run() external {
        string memory privateKeyString = vm.envString("PRIVATE_KEY");
        uint256 deployerPrivateKey = _parsePrivateKey(privateKeyString);
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("===========================================");
        console.log("Deploying KiloPriceOracle to KAIA Mainnet");
        console.log("===========================================");
        console.log("Chain ID:", block.chainid);
        require(block.chainid == 8217, "Must deploy to KAIA Mainnet (chain ID 8217)");
        
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
        
        // Initial oracle setup with Mainnet prices
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
        
        // MBX = $0.16 (volatile asset)
        oracle.setDirectPrice(
            _getTokenAddress("MBX"),
            0.16e18
        );
        
        vm.stopBroadcast();
        
        console.log("===========================================");
        console.log("Oracle deployed successfully!");
        console.log("===========================================");
        console.log("KiloPriceOracle:", address(oracle));
        console.log("");
        console.log("Initial Mainnet Prices Set:");
        console.log("- USDT: $1.00 (Stablecoin)");
        console.log("- KAIA: $0.15 (Volatile)");
        console.log("- SIX: $0.02 (Volatile)");
        console.log("- BORA: 0.08 (Volatile)");
        console.log("- MBX: $0.16 (Volatile)");
        console.log("");
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
            return 0xd077A400968890Eacc75cdc901F0356c943e4fDb;
        } else if (keccak256(bytes(symbol)) == keccak256(bytes("SIX"))) {
            return 0xEf82b1C6A550e730D8283E1eDD4977cd01FAF435;
        } else if (keccak256(bytes(symbol)) == keccak256(bytes("BORA"))) {
            return 0x02cbE46fB8A1F579254a9B485788f2D86Cad51aa;
        } else if (keccak256(bytes(symbol)) == keccak256(bytes("MBX"))) {
            return 0xD068c52d81f4409B9502dA926aCE3301cc41f623;
        }
        
        revert("Unknown token symbol");
    }
}
