// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import {Script, console} from "forge-std/Script.sol";
import "../../src/Comptroller.sol";
import "../../src/tokens/CErc20Immutable.sol";
import "../../src/KiloPriceOracle.sol";
import "@kaiachain/contracts/KIP/token/KIP7/IKIP7.sol";

/**
 * @title BorrowUSDT - Mainnet
 * @notice Safely borrow USDT using stKAIA as collateral
 * @dev Automatically calculates safe borrow amount (70% of max)
 * @dev Requires:
 *   1. stKAIA supplied to cStKAIA (run 6-MintStKAIA.s.sol first)
 *   2. Market entered (collateral enabled)
 * @dev Usage: 
 *   forge script script/utility/6-BorrowUSDT.s.sol --rpc-url $KAIA_RPC_URL --broadcast
 */
contract BorrowUSDT is Script {
    
    // Contract addresses
    address public constant COMPTROLLER = 0x0B5f0Ba5F13eA4Cb9C8Ee48FB75aa22B451470C2;
    address public constant ORACLE = 0xBB265F42Cce932c5e383536bDf50B82e08eaf454;
    address public constant CUSDT = 0x498823F094f6F2121CcB4e09371a57A96d619695;
    address public constant USDT = 0xd077A400968890Eacc75cdc901F0356c943e4fDb;
    address public constant CSTKAIA = 0x0BC926EF3856542134B06DCf53c86005b08B9625;
    address public constant STKAIA = 0x42952B873ed6f7f0A7E4992E2a9818E3A9001995;
    
    // Safety margin: borrow only 70% of max to avoid liquidation
    uint256 public constant SAFETY_MARGIN = 70; // 70%
    
    function run() external {
        string memory privateKeyString = vm.envString("PRIVATE_KEY");
        uint256 deployerPrivateKey = _parsePrivateKey(privateKeyString);
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("===========================================");
        console.log("Borrowing USDT from Lending Pool");
        console.log("===========================================");
        console.log("Chain ID:", block.chainid);
        require(block.chainid == 8217, "Must be on KAIA Mainnet (chain ID 8217)");
        
        console.log("Deployer:", deployer);
        console.log("cUSDT:", CUSDT);
        console.log("USDT:", USDT);
        
        // Check KAIA balance for gas
        uint256 balance = deployer.balance;
        console.log("KAIA Balance:", balance / 1e18, "KAIA");
        require(balance > 0.01 ether, "Need at least 0.01 KAIA for gas");
        
        // Get contracts
        Comptroller comptroller = Comptroller(COMPTROLLER);
        CErc20Immutable cUSDT = CErc20Immutable(CUSDT);
        // CErc20Immutable cStKAIA = CErc20Immutable(CSTKAIA);
        KiloPriceOracle oracle = KiloPriceOracle(ORACLE);
        // IKIP7 usdt = IKIP7(USDT);
        
        // Check if market is entered
        // bool isEntered = comptroller.checkMembership(deployer, CToken(CSTKAIA));
        // console.log("\nMarket Status:");
        // console.log("cStKAIA Entered:", isEntered ? "YES" : "NO");
        
        // if (!isEntered) {
        //     console.log("\n!!! ERROR: Market not entered !!!");
        //     console.log("Please enter the market first:");
        //     revert("Market not entered");
        // }

        vm.startBroadcast(deployerPrivateKey);
        
        // Get account liquidity
        (uint error, uint liquidity, uint shortfall) = comptroller.getAccountLiquidity(deployer);
        require(error == 0, "Failed to get account liquidity");
        require(shortfall == 0, "Account has shortfall");
        require(liquidity > 0, "No borrowing power");
        
        console.log("\nAccount Status:");
        console.log("Liquidity (USD):", liquidity / 1e18);
        console.log("Shortfall:", shortfall);
        
        // Get prices
        uint256 usdtPrice = oracle.getUnderlyingPrice(CToken(CUSDT));
        uint256 stKAIAPrice = oracle.getUnderlyingPrice(CToken(CSTKAIA));
        
        console.log("\nPrices:");
        console.log("USDT Price:", usdtPrice / 1e30, "USD");
        console.log("stKAIA Price:", stKAIAPrice / 1e18, "USD");
        
        // Calculate max borrow amount in USDT
        // liquidity is in USD with 18 decimals
        // USDT price: USD with 30 decimals
        // USDT has 6 decimals
        
        // maxBorrowUSDT = liquidity / usdtPrice * 1e12 (convert to USDT decimals)
        uint256 maxBorrowUSDT = (liquidity * 1e6 * 1e12) / usdtPrice;
        
        // Apply safety margin (70% of max)
        uint256 safeBorrowUSDT = (maxBorrowUSDT * SAFETY_MARGIN) / 100;
        
        console.log("\nBorrow Calculations:");
        console.log("Max Borrow (100%):", maxBorrowUSDT / 1e6, "USDT");
        console.log("Safe Borrow (70%):", safeBorrowUSDT / 1e6, "USDT");
        
        require(safeBorrowUSDT > 0, "Borrow amount too small");
        
        // Check cUSDT has enough liquidity
        uint256 cUSDTCash = cUSDT.getCash();
        console.log("cUSDT Available Liquidity:", cUSDTCash / 1e6, "USDT");
        require(cUSDTCash >= safeBorrowUSDT, "Insufficient liquidity in cUSDT");
        
        // Get current borrow balance
        // uint256 borrowBalanceBefore = cUSDT.borrowBalanceStored(deployer);
        // uint256 usdtBalanceBefore = usdt.balanceOf(deployer);
        
        // console.log("\nBefore Borrow:");
        // console.log("USDT Borrow Balance:", borrowBalanceBefore / 1e6, "USDT");
        // console.log("USDT Wallet Balance:", usdtBalanceBefore / 1e6, "USDT");
        
        // vm.startBroadcast(deployerPrivateKey);
        
        // Borrow USDT
        console.log("\nBorrowing", safeBorrowUSDT / 1e6, "USDT...");
        uint256 borrowResult = cUSDT.borrow(safeBorrowUSDT);
        require(borrowResult == 0, "Borrow failed");
        
        vm.stopBroadcast();
        
        // Verify results
        // uint256 borrowBalanceAfter = cUSDT.borrowBalanceStored(deployer);
        // uint256 usdtBalanceAfter = usdt.balanceOf(deployer);
        // uint256 usdtReceived = usdtBalanceAfter - usdtBalanceBefore;
        
        // Get new account liquidity
        // (uint error2, uint liquidityAfter, uint shortfallAfter) = comptroller.getAccountLiquidity(deployer);
        // require(error2 == 0, "Failed to get account liquidity");
        
        // console.log("\n===========================================");
        // console.log("Borrow Successful!");
        // console.log("===========================================");
        // console.log("Borrowed:", safeBorrowUSDT / 1e6, "USDT");
        // console.log("Received:", usdtReceived / 1e6, "USDT");
        // console.log("Total Borrow Balance:", borrowBalanceAfter / 1e6, "USDT");
        // console.log("Wallet USDT Balance:", usdtBalanceAfter / 1e6, "USDT");
        
        // console.log("\nNew Account Status:");
        // console.log("Remaining Liquidity:", liquidityAfter / 1e18, "USD");
        // console.log("Shortfall:", shortfallAfter, "(should be 0)");
        
        // Calculate health factor
        // uint256 totalBorrowValue = (borrowBalanceAfter * usdtPrice) / 1e12;
        // uint256 cStKAIABalance = cStKAIA.balanceOf(deployer);
        // uint256 exchangeRate = cStKAIA.exchangeRateStored();
        // uint256 underlyingBalance = (cStKAIABalance * exchangeRate) / 1e18;
        // uint256 collateralValue = (underlyingBalance * stKAIAPrice) / 1e18;
        
        // // Get collateral factor (should be 80% = 0.8e18)
        // (, uint256 collateralFactor) = comptroller.markets(CSTKAIA);
        // uint256 maxBorrowValue = (collateralValue * collateralFactor) / 1e18;
        
        // uint256 utilizationPercent = totalBorrowValue > 0 
        //     ? (totalBorrowValue * 100) / maxBorrowValue 
        //     : 0;
        
        // console.log("\nHealth Metrics:");
        // console.log("Collateral Value:", collateralValue / 1e18, "USD");
        // console.log("Borrow Value:", totalBorrowValue / 1e18, "USD");
        // console.log("Max Borrow Value:", maxBorrowValue / 1e18, "USD");
        // console.log("Utilization:", utilizationPercent, "%");
        // console.log("Health Factor:", maxBorrowValue > 0 ? (maxBorrowValue * 100) / totalBorrowValue : 999, "%");
        
        // require(shortfallAfter == 0, "WARNING: Account in shortfall!");
        // require(utilizationPercent <= 80, "WARNING: Utilization too high!");
        
        // console.log("\n Safe Borrow: Account is healthy");
         
    }
    
    function _parsePrivateKey(string memory privateKeyString) internal pure returns (uint256) {
        if (bytes(privateKeyString)[0] == '0' && bytes(privateKeyString)[1] == 'x') {
            return vm.parseUint(privateKeyString);
        } else {
            return vm.parseUint(string(abi.encodePacked("0x", privateKeyString)));
        }
    }
}
