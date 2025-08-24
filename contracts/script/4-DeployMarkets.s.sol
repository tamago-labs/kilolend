// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Script, console} from "forge-std/Script.sol";
import "../src/InterestRateModel.sol";
import "../src/USDTMarket.sol";
import "../src/KRWMarket.sol";
import "../src/THBMarket.sol";
import "../src/JPYMarket.sol";

/**
 * @title DeployMarkets
 * @notice Deploy InterestRateModel and Markets on KAIA testnet
 * @dev Usage:
 *   forge script script/DeployMarkets.s.sol --rpc-url $KAIA_TESTNET_RPC_URL --broadcast --verify
 */
contract DeployMarkets is Script {

    address constant WKAIA_ADDRESS = 0x553588e084604a2677e10E46ea0a8A8e9D859146;
    address constant STKAIA_ADDRESS = 0x65e38111d8e2561aDC0E2EA1eeA856E6a43dC892;
    address constant USDT_ADDRESS = 0x16EE94e3C07B24EbA6067eb9394BA70178aAc4c0;
    address constant KRW_ADDRESS = 0xf2260B00250c772CB64606dBb88d9544F709308C;
    address constant JPY_ADDRESS = 0xFa15adECD1CC94bd17cf48DD3b41F066FE2812a7;
    address constant THB_ADDRESS = 0x576430Ecadbd9729B32a4cA9Fed9F38331273924;

    address constant ORACLE_ADDRESS = 0xe5209A4f622C6eD2C158dcCcdDB69B05f9D0E4E0;

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
        console.log("Deploying InterestRateModel & Markets to KAIA Testnet");
        console.log("===========================================");
        console.log("Chain ID:", block.chainid);
        require(block.chainid == 1001, "Must deploy to KAIA testnet (chain ID 1001)");

        console.log("Deployer address:", deployer);
        console.log("Block number:", block.number);

        // Check deployer balance
        uint256 balance = deployer.balance;
        console.log("Deployer balance:", balance / 1e18, "KAIA");
        require(balance > 0.1 ether, "Insufficient balance for deployment (need at least 0.1 KAIA)");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy InterestRateModel
        InterestRateModel interestModel = new InterestRateModel();

        // Deploy Markets
        USDTMarket usdtMarket = new USDTMarket(
            WKAIA_ADDRESS,
            STKAIA_ADDRESS,
            USDT_ADDRESS,
            ORACLE_ADDRESS,
            address(interestModel)
        );

        KRWMarket krwMarket = new KRWMarket(
            WKAIA_ADDRESS,
            STKAIA_ADDRESS,
            KRW_ADDRESS,
            ORACLE_ADDRESS,
            address(interestModel)
        );

        THBMarket thbMarket = new THBMarket(
            WKAIA_ADDRESS,
            STKAIA_ADDRESS,
            THB_ADDRESS,
            ORACLE_ADDRESS,
            address(interestModel)
        );

        JPYMarket jpyMarket = new JPYMarket(
            WKAIA_ADDRESS,
            STKAIA_ADDRESS,
            JPY_ADDRESS,
            ORACLE_ADDRESS,
            address(interestModel)
        );

        vm.stopBroadcast();

        console.log("===========================================");
        console.log("Deployment successful!");
        console.log("===========================================");
        console.log("InterestRateModel:", address(interestModel));
        console.log("USDTMarket:", address(usdtMarket));
        console.log("KRWMarket:", address(krwMarket));
        console.log("THBMarket:", address(thbMarket));
        console.log("JPYMarket:", address(jpyMarket));
        
        _printEnvironmentVariables(
            address(interestModel),
            address(usdtMarket),
            address(krwMarket),
            address(thbMarket),
            address(jpyMarket)
        );
    }

    function _printEnvironmentVariables(
        address interestModel,
        address usdtMarket,
        address krwMarket,
        address thbMarket,
        address jpyMarket
    ) internal pure {
        console.log("\n=== Environment Variables for KAIA Testnet ===");
        console.log("KAIA_TESTNET_INTEREST_MODEL=", interestModel);
        console.log("KAIA_TESTNET_USDT_MARKET=", usdtMarket);
        console.log("KAIA_TESTNET_KRW_MARKET=", krwMarket);
        console.log("KAIA_TESTNET_THB_MARKET=", thbMarket);
        console.log("KAIA_TESTNET_JPY_MARKET=", jpyMarket);

        console.log("\n=== Usage ===");
        console.log("- Markets support supplying, borrowing, and liquidation");
    }
}
