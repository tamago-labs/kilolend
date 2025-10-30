// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import {Script, console} from "forge-std/Script.sol";
import "../../src/KiloPriceOracle.sol";
import "../../src/interfaces/IOraklFeedRouter.sol";

/**
 * @title ListOraklFeeds
 * @notice Debug script to diagnose Orakl price feed issues
 * @dev Tests latestRoundData function and staleness checks
 * 
 * Usage:
 *   forge script script/utility/ListOraklFeeds.s.sol --rpc-url $KAIA_RPC_URL --sig "run(address)" <ORACLE_ADDRESS>
 *   OR set ORACLE_ADDRESS environment variable
 */
contract ListOraklFeeds is Script {
    
    struct OraklFeedInfo {
        string feedName;
        address tokenAddress;
        bool isConfigured;
        uint256 stalenessThreshold;
        uint256 currentTimestamp;
        uint256 feedTimestamp;
        uint256 timeDiff;
        int256 answer;
        uint8 decimals;
        bool isStale;
        bool hasValidPrice;
        string status;
    }
    
    function run() external {
        address oracleAddress = 0xE370336C3074E76163b2f9B07876d0Cb3425488D;
        _debugOraklFeeds(oracleAddress);
    }
    
    function run(address oracleAddress) external {
        _debugOraklFeeds(oracleAddress);
    }
    
    function _debugOraklFeeds(address oracleAddress) internal {
        console.log("==========================================");
        console.log("Orakl Feed Debug Analysis");
        console.log("==========================================");
        console.log("Oracle:", oracleAddress);
        console.log("Block:", block.number);
        console.log("Block Timestamp:", block.timestamp);
        console.log("");
        
        KiloPriceOracle oracle = KiloPriceOracle(oracleAddress);
        IOraklFeedRouter oraklRouter = oracle.oraklRouter();
        
        console.log("Orakl Router:", address(oraklRouter));
        console.log("Oracle Staleness Threshold:", oracle.stalenessThreshold(), "seconds");
        console.log("");
        
        // Get token list and check Orakl feeds
        address[] memory tokens = _getTokenAddresses();
        string[] memory symbols = _getTokenSymbols();
        
        OraklFeedInfo[] memory feedInfos = new OraklFeedInfo[](tokens.length);
        
        for (uint256 i = 0; i < tokens.length; i++) {
            feedInfos[i] = _analyzeFeed(oracle, oraklRouter, tokens[i], symbols[i]);
        }
        
        _printDetailedAnalysis(feedInfos);
        _printSummary(feedInfos);
    }
    
    function _analyzeFeed(
        KiloPriceOracle oracle, 
        IOraklFeedRouter oraklRouter, 
        address token, 
        string memory symbol
    ) internal view returns (OraklFeedInfo memory) {
        OraklFeedInfo memory info;
        info.feedName = oracle.oraklFeeds(token);
        info.tokenAddress = token;
        info.stalenessThreshold = oracle.stalenessThreshold();
        info.currentTimestamp = block.timestamp;
        
        // Check if feed is configured
        info.isConfigured = bytes(info.feedName).length > 0;
        
        if (!info.isConfigured) {
            info.status = "NOT_CONFIGURED";
            return info;
        }
        
        // Try to get feed data
        try oraklRouter.latestRoundData(info.feedName) returns (
            uint64 roundId,
            int256 answer,
            uint256 updatedAt
        ) {
            info.answer = answer;
            info.feedTimestamp = updatedAt;
            info.timeDiff = info.currentTimestamp - info.feedTimestamp;
            info.isStale = info.timeDiff > info.stalenessThreshold;
            info.hasValidPrice = answer > 0;
            
            // Get feed decimals
            try oraklRouter.decimals(info.feedName) returns (uint8 decimals) {
                info.decimals = decimals;
            } catch {
                info.decimals = 0;
            }
            
            // Determine status
            if (!info.hasValidPrice) {
                info.status = "INVALID_PRICE";
            } else if (info.isStale) {
                info.status = "STALE";
            } else {
                info.status = "HEALTHY";
            }
            
        } catch Error(string memory reason) {
            info.status = string(abi.encodePacked("ERROR:", reason));
        } catch {
            info.status = "UNKNOWN_ERROR";
        }
        
        return info;
    }
    
    function _printDetailedAnalysis(OraklFeedInfo[] memory feedInfos) internal view {
        for (uint256 i = 0; i < feedInfos.length; i++) {
            OraklFeedInfo memory info = feedInfos[i];
            
            console.log("TOKEN:", _getTokenSymbolByAddress(info.tokenAddress));
            console.log("|- Feed Name:", info.feedName);
            console.log("|- Configured:", info.isConfigured);
            
            if (!info.isConfigured) {
                console.log("L- Status:", info.status);
                console.log("");
                continue;
            }
            
            console.log("|- Feed Timestamp:", info.feedTimestamp);
            console.log("|- Current Timestamp:", info.currentTimestamp);
            console.log("|- Time Difference:", info.timeDiff, "seconds");
            console.log("|- Staleness Threshold:", info.stalenessThreshold, "seconds");
            console.log("|- Is Stale:", info.isStale);
            console.log("|- Answer:", info.answer);
            console.log("|- Decimals:", info.decimals);
            console.log("|- Has Valid Price:", info.hasValidPrice);
            console.log("L- Status:", info.status);
            console.log("");
        }
    }
    
    function _printSummary(OraklFeedInfo[] memory feedInfos) internal view {
        uint256 configured = 0;
        uint256 healthy = 0;
        uint256 stale = 0;
        uint256 invalidPrice = 0;
        uint256 errors = 0;
        
        for (uint256 i = 0; i < feedInfos.length; i++) {
            OraklFeedInfo memory info = feedInfos[i];
            
            if (info.isConfigured) {
                configured++;
                
                if (info.hasValidPrice && !info.isStale) {
                    healthy++;
                } else if (info.isStale) {
                    stale++;
                } else if (!info.hasValidPrice) {
                    invalidPrice++;
                } else {
                    errors++;
                }
            }
        }
        
        console.log("==========================================");
        console.log("SUMMARY");
        console.log("==========================================");
        console.log("Total Tokens:", feedInfos.length);
        console.log("Configured Feeds:", configured);
        console.log("Healthy Feeds:", healthy);
        console.log("Stale Feeds:", stale);
        console.log("Invalid Price Feeds:", invalidPrice);
        console.log("Error Feeds:", errors);
        console.log("");
        
        if (stale > 0) {
            console.log("STALENESS ANALYSIS:");
            console.log("- Feeds are considered stale if time difference > staleness threshold");
            console.log("- Current staleness threshold:", feedInfos[0].stalenessThreshold, "seconds");
            console.log("- Consider updating feeds or adjusting threshold if needed");
            console.log("");
        }
        
        if (configured == 0) {
            console.log("RECOMMENDATION:");
            console.log("- No Orakl feeds are configured");
            console.log("- Use oracle.setOraklFeed(token, feedName) to configure feeds");
        } else if (healthy == configured) {
            console.log("STATUS: All configured feeds are healthy!");
        } else {
            console.log("RECOMMENDATION:");
            console.log("- Some feeds need attention");
            console.log("- Check feed update mechanisms");
            console.log("- Verify Orakl router configuration");
        }
    }
     
    
    function _getTokenAddresses() internal pure returns (address[] memory) {
        address[] memory tokens = new address[](6);
        
        tokens[0] = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE; // KAIA
        tokens[1] = 0xd077A400968890Eacc75cdc901F0356c943e4fDb; // USDT
        tokens[2] = 0xEf82b1C6A550e730D8283E1eDD4977cd01FAF435; // SIX
        tokens[3] = 0x02cbE46fB8A1F579254a9B485788f2D86Cad51aa; // BORA
        tokens[4] = 0xD068c52d81f4409B9502dA926aCE3301cc41f623; // MBX
        tokens[5] = 0x42952B873ed6f7f0A7E4992E2a9818E3A9001995; // stKAIA
        
        return tokens;
    }
    
    function _getTokenSymbols() internal pure returns (string[] memory) {
        string[] memory symbols = new string[](6);
        
        symbols[0] = "KAIA";
        symbols[1] = "USDT";
        symbols[2] = "SIX";
        symbols[3] = "BORA";
        symbols[4] = "MBX";
        symbols[5] = "stKAIA";
        
        return symbols;
    }
    
    function _getTokenSymbolByAddress(address token) internal pure returns (string memory) {
        if (token == 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE) return "KAIA";
        if (token == 0xd077A400968890Eacc75cdc901F0356c943e4fDb) return "USDT";
        if (token == 0xEf82b1C6A550e730D8283E1eDD4977cd01FAF435) return "SIX";
        if (token == 0x02cbE46fB8A1F579254a9B485788f2D86Cad51aa) return "BORA";
        if (token == 0xD068c52d81f4409B9502dA926aCE3301cc41f623) return "MBX";
        if (token == 0x42952B873ed6f7f0A7E4992E2a9818E3A9001995) return "stKAIA";
        return "UNKNOWN";
    }
}
