// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Script, console} from "forge-std/Script.sol";
import "../src/mocks/MockToken.sol";

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
        
        // Deploy mock stablecoins and KAIA tokens
        MockToken usdt = new MockToken("Tether USD", "USDT", 6, 1000000e6); // 1M USDT
        MockToken krw = new MockToken("Korean Won", "KRW", 0, 1000000000); // 1B KRW (no decimals)
        MockToken jpy = new MockToken("Japanese Yen", "JPY", 0, 1000000000); // 1B JPY (no decimals)  
        MockToken thb = new MockToken("Thai Baht", "THB", 2, 1000000e2); // 1M THB (2 decimals)
        MockToken stKAIA = new MockToken("Staked KAIA", "stKAIA", 18, 1000000e18); // 1M stKAIA
        MockToken wKAIA = new MockToken("Wrapped KAIA", "wKAIA", 18, 1000000e18); // 1M wKAIA
        
        // Stop broadcasting
        vm.stopBroadcast();
        
        console.log("===========================================");
        console.log("Mock Tokens deployed successfully!");
        console.log("===========================================");
        console.log("USDT:", address(usdt)); 
        console.log("KRW:", address(krw));
        console.log("JPY:", address(jpy));
        console.log("THB:", address(thb));
        console.log("stKAIA:", address(stKAIA));
        console.log("wKAIA:", address(wKAIA));
         
        // Print environment variables for KAIA testnet
        _printEnvironmentVariables(
            address(usdt), 
            address(krw), 
            address(jpy),
            address(thb),
            address(stKAIA),
            address(wKAIA)
        );
    }
    
    function _printEnvironmentVariables(
        address usdt,  
        address krw,
        address jpy,
        address thb,
        address stKAIA,
        address wKAIA
    ) internal pure {
        console.log("\n=== Environment Variables for KAIA Testnet ===");
        console.log("KAIA_TESTNET_USDT=", usdt); 
        console.log("KAIA_TESTNET_KRW=", krw);
        console.log("KAIA_TESTNET_JPY=", jpy);
        console.log("KAIA_TESTNET_THB=", thb);
        console.log("KAIA_TESTNET_STKAIA=", stKAIA);
        console.log("KAIA_TESTNET_WKAIA=", wKAIA);
        
        console.log("\n=== Token Details ===");
        console.log("USDT: Tether USD (6 decimals)");
        console.log("KRW: Korean Won (0 decimals)");
        console.log("JPY: Japanese Yen (0 decimals)"); 
        console.log("THB: Thai Baht (2 decimals)");
        console.log("stKAIA: Staked KAIA (18 decimals)");
        console.log("wKAIA: Wrapped KAIA (18 decimals)");
        
        console.log("\n=== Mint More Tokens (if needed) ===");
        console.log("Use MockToken.mint(address to, uint256 amount) function");
        console.log("All tokens have public mint function for testing");
        console.log("Remember to use proper decimals when minting:");
        console.log("- USDT: amount * 1e6");
        console.log("- KRW/JPY: amount (no decimals)");
        console.log("- THB: amount * 1e2");
        console.log("- stKAIA/wKAIA: amount * 1e18");
    }
}
