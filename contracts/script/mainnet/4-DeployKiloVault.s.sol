// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "forge-std/Script.sol";
import "../../src/KiloVault.sol";

/**
 * @title Deploy and Configure KiloVault - Mainnet 
 * @notice Deploys and configures KiloVault on Kaia Mainnet  
 * @dev Usage: forge script script/mainnet/4-DeployKiloVault.s.sol --rpc-url $MAINNET_RPC_URL --private-key $PRIVATE_KEY --broadcast -vvvv
 */
contract DeployAndConfigureKiloVault is Script {
    
    // Native KAIA
    address constant NATIVE_ASSET = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    
    // Vault Configuration (based on 1 KAIA = $0.1)
    uint256 constant MAX_PER_USER_USD = 100;      // $100 per user
    uint256 constant MAX_TOTAL_USD = 10_000;      // $10,000 total
    uint256 constant KAIA_PRICE_USD = 10;         // $0.1 = 10 cents (in cents for precision)
    
    // Calculate KAIA amounts (price in cents, so divide by 10)
    uint256 constant MAX_PER_USER_KAIA = (MAX_PER_USER_USD * 100 * 1 ether) / KAIA_PRICE_USD;  // 1,000 KAIA
    uint256 constant MAX_TOTAL_KAIA = (MAX_TOTAL_USD * 100 * 1 ether) / KAIA_PRICE_USD;        // 100,000 KAIA
    
    function run() external {
        string memory privateKeyString = vm.envString("PRIVATE_KEY");
        uint256 deployerPrivateKey = _parsePrivateKey(privateKeyString);
        address deployer = vm.addr(deployerPrivateKey);
        address botAddress = vm.envAddress("BOT_ADDRESS");
        
        console.log("===========================================");
        console.log("Deploy & Configure KiloVault - MAINNET");
        console.log("===========================================");
        console.log("Network: Kaia Mainnet");
        console.log("Chain ID:", block.chainid);
        console.log("Deployer:", deployer);
        console.log("Bot Address:", botAddress);
        console.log("Balance:", deployer.balance / 1e18, "KAIA");
        console.log("");
        
        require(block.chainid == 8217, "Wrong network! Use Kaia Mainnet");
        require(botAddress != address(0), "Bot address not set in .env");
        
        console.log("===========================================");
        console.log("VAULT CONFIGURATION");
        console.log("===========================================");
        console.log("Price: 1 KAIA = $0.1");
        console.log("");
        
        
        vm.startBroadcast(deployerPrivateKey);
        
        // ===========================================
        // STEP 1: DEPLOY VAULT
        // ===========================================
        
        console.log("Step 1/2: Deploying KiloVault...");
        
        KiloVault vault = new KiloVault(
            NATIVE_ASSET,
            "Kilo Vault KAIA",
            "kvKAIA",
            18
        );
        
        console.log("Vault deployed at:", address(vault));
        console.log("");
        
        // ===========================================
        // STEP 2: CONFIGURE VAULT
        // ===========================================
        
        console.log("Step 2/2: Configuring KiloVault...");
        console.log("");
        
        // Set bot address
        console.log("Setting bot address...");
        vault.setBotAddress(botAddress);
        console.log("Bot address set to:", botAddress);
        console.log("");
        
        // Set deposit caps
        console.log("Setting deposit caps..."); 
        vault.setDepositCaps(MAX_PER_USER_KAIA, MAX_TOTAL_KAIA);
        console.log("Deposit caps configured");
        console.log("");
        
        vm.stopBroadcast();
        
        // ===========================================
        // DEPLOYMENT SUMMARY
        // ===========================================
        
        console.log("===========================================");
        console.log("DEPLOYMENT SUCCESSFUL!");
        console.log("===========================================");
        console.log("");
        console.log("Contract Address:", address(vault));
        console.log("");
        console.log("Configuration:");
        console.log("- Asset: Native KAIA");
        console.log("- Decimals:", vault.assetDecimals());
        console.log("- Bot Address:", vault.botAddress());
        console.log("- Owner:", vault.owner());
        console.log("- Is Paused:", vault.isPaused());
        console.log("");
    }
    
    function _parsePrivateKey(string memory privateKeyString) internal pure returns (uint256) {
        if (bytes(privateKeyString)[0] == '0' && bytes(privateKeyString)[1] == 'x') {
            return vm.parseUint(privateKeyString);
        } else {
            return vm.parseUint(string(abi.encodePacked("0x", privateKeyString)));
        }
    }

}