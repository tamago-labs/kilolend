// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import {Script, console} from "forge-std/Script.sol";
import "../../src/KiloPriceOracle.sol";

/**
 * @title DeployEtherlinkOracle
 * @notice Deploy KiloPriceOracle for Etherlink (Chain ID 42793)
 * @dev Usage: 
 *   forge script script/core/5-DeployEtherlinkOracle.s.sol --rpc-url $ETHERLINK_RPC_URL --broadcast
 */
contract DeployEtherlinkOracle is Script {
    
    function run() external {
        string memory privateKeyString = vm.envString("PRIVATE_KEY");
        uint256 deployerPrivateKey = _parsePrivateKey(privateKeyString);
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("===========================================");
        console.log("Deploying KiloPriceOracle to Etherlink");
        console.log("===========================================");
        console.log("Chain ID:", block.chainid);
        require(block.chainid == 42793, "Must deploy to Etherlink (chain ID 42793)");
        
        console.log("Deployer address:", deployer);
        console.log("Block number:", block.number);
        
        // Check deployer balance
        uint256 balance = deployer.balance;
        console.log("Deployer balance:", balance / 1e18, "XTZ");
        require(balance > 0.1 ether, "Insufficient balance for deployment (need at least 0.1 XTZ)");
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy Oracle
        KiloPriceOracle oracle = new KiloPriceOracle();
        
        // Set cXTZ as native token (wraps XTZ)
        oracle.setNativeCToken("cXTZ", true);
        console.log("cXTZ set as native token");
        
        // Initial oracle setup with fallback prices
        // XTZ = $0.40877 (native token)
        oracle.setDirectPrice(
            0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE, // Native token address
            408770000000000000 // 0.40877 * 1e18
        );
        
        // USDT = $1.00 (stablecoin)
        oracle.setDirectPrice(
            0x2C03058C8AFC06713be23e58D2febC8337dbfE6A, // USDT address
            1e18
        );
        
        vm.stopBroadcast();
        
        console.log("===========================================");
        console.log("Oracle deployed successfully!");
        console.log("===========================================");
        console.log("KiloPriceOracle:", address(oracle));
        console.log("");
        console.log("Initial Prices (Fallback Mode):");
        console.log("  - XTZ (native): $0.40877");
        console.log("  - USDT: $1.00");
        console.log("");
        console.log("Note: Prices are manually set using fallback mode.");
        console.log("      To use oracle aggregators later, update prices via");
        console.log("      setDirectPrice() or implement custom price feeds.");
    }
    
    function _parsePrivateKey(string memory privateKeyString) internal pure returns (uint256) {
        if (bytes(privateKeyString)[0] == '0' && bytes(privateKeyString)[1] == 'x') {
            return vm.parseUint(privateKeyString);
        } else {
            return vm.parseUint(string(abi.encodePacked("0x", privateKeyString)));
        }
    }
}