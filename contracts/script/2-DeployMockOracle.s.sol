// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Script, console} from "forge-std/Script.sol";
import "../src/mocks/MockOracle.sol";

/**
 * @title DeployMockOracle
 * @notice Deploy MockOracle for testing on KAIA testnet
 * @dev Usage: 
 *   forge script script/DeployMockOracle.s.sol --rpc-url $KAIA_TESTNET_RPC_URL --broadcast --verify
 */
contract DeployMockOracle is Script {
    
    // Deployed token addresses from previous deployment
    address constant WKAIA_ADDRESS = 0x553588e084604a2677e10E46ea0a8A8e9D859146;
    address constant STKAIA_ADDRESS = 0x65e38111d8e2561aDC0E2EA1eeA856E6a43dC892;
    address constant USDT_ADDRESS = 0x16EE94e3C07B24EbA6067eb9394BA70178aAc4c0;
    address constant KRW_ADDRESS = 0xf2260B00250c772CB64606dBb88d9544F709308C;
    address constant JPY_ADDRESS = 0xFa15adECD1CC94bd17cf48DD3b41F066FE2812a7;
    address constant THB_ADDRESS = 0x576430Ecadbd9729B32a4cA9Fed9F38331273924;
    
    // Realistic exchange rates for testing
    uint256 constant KAIA_PRICE = 0.11e18;        // $0.11 per KAIA
    uint256 constant USDT_PRICE = 1.0e18;         // $1.00 per USDT
    uint256 constant STKAIA_EXCHANGE_RATE = 1.05e18; // 1.05 KAIA per stKAIA
    uint256 constant KRW_USD_RATE = 1300e18;      // 1300 KRW per USD
    uint256 constant JPY_USD_RATE = 150;          // 150 JPY per USD (0 decimals)
    uint256 constant THB_USD_RATE = 35e2;         // 35 THB per USD (2 decimals)
    
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
        console.log("Deploying MockOracle to KAIA Testnet");
        console.log("===========================================");
        console.log("Chain ID:", block.chainid);
        require(block.chainid == 1001, "Must deploy to KAIA testnet (chain ID 1001)");
        
        console.log("Deployer address:", deployer);
        console.log("Block number:", block.number);
        
        // Check deployer balance
        uint256 balance = deployer.balance;
        console.log("Deployer balance:", balance / 1e18, "KAIA");
        require(balance > 0.05 ether, "Insufficient balance for deployment (need at least 0.05 KAIA)");
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy MockOracle
        MockOracle mockOracle = new MockOracle(
            WKAIA_ADDRESS,
            KAIA_PRICE
        );
        
        console.log("MockOracle deployed at:", address(mockOracle));
        
        // Set up initial prices
        mockOracle.setPrice(WKAIA_ADDRESS, KAIA_PRICE);
        mockOracle.setPrice(USDT_ADDRESS, USDT_PRICE);
        
        console.log("Set KAIA price:", KAIA_PRICE / 1e18, "USD");
        console.log("Set USDT price:", USDT_PRICE / 1e18, "USD");
        
        // Set up exchange rates
        mockOracle.setExchangeRates(
            STKAIA_EXCHANGE_RATE,
            KRW_USD_RATE,
            JPY_USD_RATE,
            THB_USD_RATE
        );
        
        console.log("Set stKAIA rate:", STKAIA_EXCHANGE_RATE / 1e18, "KAIA per stKAIA");
        console.log("Set KRW rate:", KRW_USD_RATE / 1e18, "KRW per USD");
        console.log("Set JPY rate:", JPY_USD_RATE, "JPY per USD");
        console.log("Set THB rate:", THB_USD_RATE / 1e2, "THB per USD");
        
        vm.stopBroadcast();
        
        console.log("===========================================");
        console.log("MockOracle deployment completed!");
        console.log("===========================================");
        console.log("MockOracle address:", address(mockOracle));
        
        // Print environment variables
        console.log("\n=== Environment Variables ===");
        console.log("KAIA_TESTNET_MOCK_ORACLE=", address(mockOracle));
        
        console.log("\n=== Verification ===");
        console.log("Verify prices are set correctly:");
        console.log("- KAIA price:", mockOracle.getPrice(WKAIA_ADDRESS) / 1e18, "USD");
        console.log("- USDT price:", mockOracle.getPrice(USDT_ADDRESS) / 1e18, "USD");
        console.log("- stKAIA rate:", mockOracle.getStKaiaExchangeRate() / 1e18, "KAIA");
        console.log("- KRW rate:", mockOracle.getKRWUSDRate() / 1e18, "KRW per USD");
        console.log("- JPY rate:", mockOracle.getJPYUSDRate(), "JPY per USD");
        console.log("- THB rate:", mockOracle.getTHBUSDRate() / 1e2, "THB per USD");
        
        console.log("\n=== Usage Instructions ===");
        console.log("The MockOracle is ready to use with:");
        console.log("- All deployed token addresses configured");
        console.log("- Realistic exchange rates set");
        console.log("- Owner functions available for rate updates");
        console.log("- Full IPriceOracle interface implemented");
        
        console.log("\n=== Update Rates (if needed) ===");
        console.log("Use these functions to update rates:");
        console.log("- mockOracle.setPrice(token, price)");
        console.log("- mockOracle.setKRWUSDRate(rate)"); 
        console.log("- mockOracle.setJPYUSDRate(rate)");
        console.log("- mockOracle.setTHBUSDRate(rate)");
        console.log("- mockOracle.setStKaiaExchangeRate(rate)");
    }
    
    function getDeployedAddresses() external pure returns (
        address wkaia,
        address stkaia,
        address usdt,
        address krw,
        address jpy,
        address thb
    ) {
        return (
            WKAIA_ADDRESS,
            STKAIA_ADDRESS,
            USDT_ADDRESS,
            KRW_ADDRESS,
            JPY_ADDRESS,
            THB_ADDRESS
        );
    }
}
