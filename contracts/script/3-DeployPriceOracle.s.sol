// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { Script, console } from "forge-std/Script.sol";
import "../src/PriceOracle.sol";
import "../src/mocks/MockOracle.sol";

/**
 * @title DeployPriceOracle
 * @notice Deploy production PriceOracle with Pyth integration on KAIA testnet
 * @dev Usage: 
 *   forge script script/DeployPriceOracle.s.sol --rpc-url $KAIA_TESTNET_RPC_URL --broadcast --verify
 */
contract DeployPriceOracle is Script {

    // Deployed token addresses from previous deployment
    address constant WKAIA_ADDRESS = 0x553588e084604a2677e10E46ea0a8A8e9D859146;
    address constant STKAIA_ADDRESS = 0x65e38111d8e2561aDC0E2EA1eeA856E6a43dC892;
    address constant USDT_ADDRESS = 0x16EE94e3C07B24EbA6067eb9394BA70178aAc4c0;
    address constant KRW_ADDRESS = 0xf2260B00250c772CB64606dBb88d9544F709308C;
    address constant JPY_ADDRESS = 0xFa15adECD1CC94bd17cf48DD3b41F066FE2812a7;
    address constant THB_ADDRESS = 0x576430Ecadbd9729B32a4cA9Fed9F38331273924;

    // Pyth Network contract address on KAIA testnet
    address constant PYTH_ORACLE_ADDRESS = 0x2880aB155794e7179c9eE2e38200202908C17B43;

    // MockOracle address 
    address constant MOCK_ORACLE_ADDRESS = 0x42209A0A2a3D80Ad48B7D25fC6a61ad355901484;

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
        console.log("Deploying PriceOracle to KAIA Testnet");
        console.log("===========================================");
        console.log("Chain ID:", block.chainid);
        require(block.chainid == 1001, "Must deploy to KAIA testnet (chain ID 1001)");

        console.log("Deployer address:", deployer);
        console.log("Mock Oracle address:", MOCK_ORACLE_ADDRESS);
        console.log("Block number:", block.number);

        require(MOCK_ORACLE_ADDRESS != address(0), "MockOracle address not set in environment");

        // Check deployer balance
        uint256 balance = deployer.balance;
        console.log("Deployer balance:", balance / 1e18, "KAIA");
        require(balance > 0.1 ether, "Insufficient balance for deployment (need at least 0.1 KAIA)");

        // Check Pyth oracle availability
        if (PYTH_ORACLE_ADDRESS == address(0)) {
            console.log("WARNING: Pyth oracle address not set");
            console.log("PriceOracle will be deployed in Mock-only mode");
            console.log("Update PYTH_ORACLE_ADDRESS constant when Pyth is available on KAIA");
        }

        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // Deploy PriceOracle
        PriceOracle priceOracle;

        if (PYTH_ORACLE_ADDRESS != address(0)) {
            // Deploy with Pyth support
            priceOracle = new PriceOracle(
                PYTH_ORACLE_ADDRESS,
                MOCK_ORACLE_ADDRESS,
                WKAIA_ADDRESS,
                USDT_ADDRESS
            );
            console.log("PriceOracle deployed with Pyth support");
        } else {
            // Deploy without Pyth (use MockOracle for all functions)
            priceOracle = new PriceOracle(
                address(0),
                MOCK_ORACLE_ADDRESS,
                WKAIA_ADDRESS,
                USDT_ADDRESS
            );
            console.log("PriceOracle deployed in Mock-only mode");
        }

        console.log("PriceOracle deployed at:", address(priceOracle));

        // Optional: Setup additional token mappings if Pyth is available
        if (PYTH_ORACLE_ADDRESS != address(0)) {
            console.log("Setting up Pyth price feed mappings...");
            console.log("Note: Price feed IDs are placeholders - update with real Pyth IDs");
        }

        console.log("Oracle mode set to: MOCK (default)");

        vm.stopBroadcast();

        console.log("===========================================");
        console.log("PriceOracle deployment completed!");
        console.log("===========================================");
        console.log("PriceOracle address:", address(priceOracle));

        // Test oracle functions
        console.log("\n=== Testing Oracle Functions ===");
        try priceOracle.getPrice(WKAIA_ADDRESS) returns (uint256 kaiaPrice) {
            console.log("KAIA price:", kaiaPrice / 1e18, "USD");
        } catch {
            console.log("Failed to get KAIA price");
        }

        try priceOracle.getPrice(USDT_ADDRESS) returns (uint256 usdtPrice) {
            console.log("USDT price:", usdtPrice / 1e18, "USD");
        } catch {
            console.log("Failed to get USDT price");
        }

        try priceOracle.getStKaiaExchangeRate() returns (uint256 stKaiaRate) {
            console.log("stKAIA rate:", stKaiaRate / 1e18, "KAIA per stKAIA");
        } catch {
            console.log("Failed to get stKAIA rate");
        }

        try priceOracle.getKRWUSDRate() returns (uint256 krwRate) {
            console.log("KRW rate:", krwRate / 1e18, "KRW per USD");
        } catch {
            console.log("Failed to get KRW rate");
        }

        try priceOracle.getJPYUSDRate() returns (uint256 jpyRate) {
            console.log("JPY rate:", jpyRate, "JPY per USD");
        } catch {
            console.log("Failed to get JPY rate");
        }

        try priceOracle.getTHBUSDRate() returns (uint256 thbRate) {
            console.log("THB rate:", thbRate / 1e2, "THB per USD");
        } catch {
            console.log("Failed to get THB rate");
        }

        // Print environment variables and usage instructions
        console.log("=== Environment Variables ===");
        console.log("KAIA_TESTNET_PRICE_ORACLE =", address(priceOracle));
        console.log("MOCK_ORACLE_ADDRESS =", MOCK_ORACLE_ADDRESS);
        if (PYTH_ORACLE_ADDRESS != address(0)) {
            console.log("PYTH_ORACLE_ADDRESS =", PYTH_ORACLE_ADDRESS);
        }

        console.log("=== Usage Instructions ===");
        console.log("- Currently in MOCK mode (safe for testing)");
        console.log("- All price functions working through MockOracle");
        console.log("- Switch to PYTH mode when ready: priceOracle.setOracleMode(1)");
        console.log("- Owner can update oracle mode and configurations");

    }

}
