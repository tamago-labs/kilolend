// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import {Script, console} from "forge-std/Script.sol";
import "../../src/tokens/CErc20Immutable.sol";
import "@kaiachain/contracts/KIP/token/KIP7/IKIP7.sol";

/**
 * @title MintStKAIA - Mainnet
 * @notice Supply stKAIA to the lending pool (mint cStKAIA)
 * @dev Configurable supply amount
 * @dev Usage: 
 *   forge script script/utility/2-MintStKAIA.s.sol --rpc-url $KAIA_RPC_URL --broadcast
 */
contract MintStKAIA is Script {
    
    // Contract addresses
    address public constant STKAIA = 0x42952B873ed6f7f0A7E4992E2a9818E3A9001995;
    address public constant CSTKAIA = 0x0BC926EF3856542134B06DCf53c86005b08B9625;
    address public constant COMPTROLLER = 0x0B5f0Ba5F13eA4Cb9C8Ee48FB75aa22B451470C2;
    
    // Supply amount (change this as needed)
    // Default: 100 stKAIA
    uint256 public constant SUPPLY_AMOUNT = 1.877e19;
    
    function run() external {
        string memory privateKeyString = vm.envString("PRIVATE_KEY");
        uint256 deployerPrivateKey = _parsePrivateKey(privateKeyString);
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("===========================================");
        console.log("Supplying stKAIA to Lending Pool");
        console.log("===========================================");
        console.log("Chain ID:", block.chainid);
        require(block.chainid == 8217, "Must be on KAIA Mainnet (chain ID 8217)");
        
        console.log("Deployer:", deployer);
        console.log("stKAIA:", STKAIA);
        console.log("cStKAIA:", CSTKAIA);
        console.log("Supply Amount:", SUPPLY_AMOUNT / 1e18, "stKAIA");
        
        // Check KAIA balance for gas
        uint256 balance = deployer.balance;
        console.log("KAIA Balance:", balance / 1e18, "KAIA");
        require(balance > 0.01 ether, "Need at least 0.01 KAIA for gas");
        
        // Check stKAIA balance
        IKIP7 stKAIA = IKIP7(STKAIA);
        uint256 stKAIABalance = stKAIA.balanceOf(deployer);
        console.log("stKAIA Balance:", stKAIABalance / 1e18, "stKAIA");
        require(stKAIABalance >= SUPPLY_AMOUNT, "Insufficient stKAIA balance");
        
        // Check allowance
        uint256 allowance = stKAIA.allowance(deployer, CSTKAIA);
        console.log("Current Allowance:", allowance >= SUPPLY_AMOUNT ? "SUFFICIENT" : "INSUFFICIENT");
        require(allowance >= SUPPLY_AMOUNT, "Need to approve first. Run 5-ApproveStKAIA.s.sol");
        
        // Get cStKAIA contract
        CErc20Immutable cStKAIA = CErc20Immutable(CSTKAIA);
        
        // Get current balance and exchange rate
        uint256 cTokenBalanceBefore = cStKAIA.balanceOf(deployer);
        uint256 exchangeRate = cStKAIA.exchangeRateStored();
        console.log("\nBefore Supply:");
        console.log("cStKAIA Balance:", cTokenBalanceBefore / 1e8);
        console.log("Exchange Rate:", exchangeRate / 1e18);
        
        // Calculate expected cTokens
        uint256 expectedCTokens = (SUPPLY_AMOUNT * 1e18) / exchangeRate;
        console.log("Expected cStKAIA:", expectedCTokens / 1e8);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Supply stKAIA (mint cStKAIA)
        console.log("\nSupplying stKAIA to lending pool...");
        uint256 mintResult = cStKAIA.mint(SUPPLY_AMOUNT);
        require(mintResult == 0, "Mint failed");
        
        vm.stopBroadcast();
        
        // Verify results
        uint256 cTokenBalanceAfter = cStKAIA.balanceOf(deployer);
        uint256 cTokensReceived = cTokenBalanceAfter - cTokenBalanceBefore;
        uint256 stKAIABalanceAfter = stKAIA.balanceOf(deployer);
        
        console.log("\n===========================================");
        console.log("Supply Successful!");
        console.log("===========================================");
        console.log("Supplied:", SUPPLY_AMOUNT / 1e18, "stKAIA");
        console.log("Received:", cTokensReceived / 1e8, "cStKAIA");
        console.log("Remaining stKAIA:", stKAIABalanceAfter / 1e18, "stKAIA");
        console.log("Total cStKAIA:", cTokenBalanceAfter / 1e8, "cStKAIA"); 
    }
    
    function _parsePrivateKey(string memory privateKeyString) internal pure returns (uint256) {
        if (bytes(privateKeyString)[0] == '0' && bytes(privateKeyString)[1] == 'x') {
            return vm.parseUint(privateKeyString);
        } else {
            return vm.parseUint(string(abi.encodePacked("0x", privateKeyString)));
        }
    }
}
