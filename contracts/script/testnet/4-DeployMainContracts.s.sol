// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import {Script, console} from "forge-std/Script.sol";
import "../../src/Comptroller.sol";
import "../../src/KiloPriceOracle.sol";
import "../../src/tokens/CToken.sol";

/**
 * @title DeployMainContracts
 * @notice Deploy and configure the main KiloLend protocol contracts
 * @dev Usage: 
 *   forge script script/deployment/4-DeployMainContracts.s.sol --rpc-url $KAIA_RPC_URL --broadcast --verify
 */
contract DeployMainContracts is Script {
    
    // Update these addresses with deployed contracts from previous steps
    address public constant ORACLE = 0x6666666666666666666666666666666666666666; // From 2-DeployOracle.s.sol
    address public constant CUSDT = 0x7777777777777777777777777777777777777777; // From 2-DeployCTokens.s.sol
    address public constant CKAIA = 0x8888888888888888888888888888888888888888; // From 2-DeployCTokens.s.sol
    address public constant CSTKAIA = 0x9999999999999999999999999999999999999999; // From 2-DeployCTokens.s.sol
    address public constant CBORA = 0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA; // From 2-DeployCTokens.s.sol
    address public constant CMBX = 0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB; // From 2-DeployCTokens.s.sol
    
    // Protocol configuration
    uint256 public constant CLOSE_FACTOR = 0.5e18; // 50% - max liquidation per transaction
    uint256 public constant LIQUIDATION_INCENTIVE = 1.08e18; // 8% liquidation bonus
    
    // Collateral factors (conservative for stablecoin-focused protocol)
    uint256 public constant USDT_COLLATERAL_FACTOR = 0.85e18; // 85% for stablecoin
    uint256 public constant KAIA_COLLATERAL_FACTOR = 0.75e18; // 75% for native KAIA
    uint256 public constant STKAIA_COLLATERAL_FACTOR = 0.75e18; // 75% for staked KAIA
    uint256 public constant BORA_COLLATERAL_FACTOR = 0.70e18; // 70% for BORA
    uint256 public constant MBX_COLLATERAL_FACTOR = 0.70e18; // 70% for MBX
    
    // Borrow caps (in underlying token units)
    uint256 public constant USDT_BORROW_CAP = 1000000e6; // 1M USDT
    uint256 public constant KAIA_BORROW_CAP = 0; // No borrowing of collateral assets
    uint256 public constant STKAIA_BORROW_CAP = 0; // No borrowing of collateral assets
    uint256 public constant BORA_BORROW_CAP = 0; // No borrowing of collateral assets
    uint256 public constant MBX_BORROW_CAP = 0; // No borrowing of collateral assets
    
    // Deployed contracts
    Comptroller public comptroller;
    
    function run() external {
        string memory privateKeyString = vm.envString("PRIVATE_KEY");
        uint256 deployerPrivateKey = _parsePrivateKey(privateKeyString);
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("===========================================");
        console.log("Deploying Main KiloLend Protocol Contracts");
        console.log("===========================================");
        console.log("Chain ID:", block.chainid);
        console.log("Deployer address:", deployer);
        console.log("Block number:", block.number);
        
        // Check deployer balance
        uint256 balance = deployer.balance;
        console.log("Deployer balance:", balance / 1e18, "KAIA");
        require(balance > 0.3 ether, "Insufficient balance for deployment (need at least 0.3 KAIA)");
        
        // Verify prerequisite contracts
        _verifyPrerequisites();
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 1. Deploy Comptroller
        _deployComptroller();
        
        // 2. Configure the protocol
        _configureProtocol();
        
        // 3. Support markets
        _supportMarkets();
        
        // 4. Set risk parameters
        _setRiskParameters();
        
        vm.stopBroadcast();
        
        _logDeploymentResults(); 
    }
    
    function _verifyPrerequisites() internal view {
        console.log("Verifying prerequisite contracts...");
        require(ORACLE != address(0), "Oracle address not set");
        require(CUSDT != address(0), "cUSDT address not set");
        require(CKAIA != address(0), "cKAIA address not set");
        require(CSTKAIA != address(0), "cstKAIA address not set");
        require(CBORA != address(0), "cBORA address not set");
        require(CMBX != address(0), "cMBX address not set");
        console.log("All prerequisite contracts verified");
    }
    
    function _deployComptroller() internal {
        console.log("\n1. Deploying Comptroller...");
        
        // Deploy comptroller directly
        comptroller = new Comptroller();
        console.log("Comptroller:", address(comptroller));
    }
    
    function _configureProtocol() internal {
        console.log("\n2. Configuring Protocol...");
        
        // Set price oracle
        comptroller._setPriceOracle(PriceOracle(ORACLE));
        console.log("Price oracle set:", ORACLE);
        
        // Set liquidation parameters
        comptroller._setCloseFactor(CLOSE_FACTOR);
        comptroller._setLiquidationIncentive(LIQUIDATION_INCENTIVE);
        console.log("Close factor set:", CLOSE_FACTOR);
        console.log("Liquidation incentive set:", LIQUIDATION_INCENTIVE);
    }
    
    function _supportMarkets() internal {
        console.log("\n3. Supporting Markets...");
        
        // Support all cToken markets
        uint result;
        
        result = comptroller._supportMarket(CToken(CUSDT));
        require(result == 0, "Failed to support cUSDT market");
        console.log("cUSDT market supported");
        
        result = comptroller._supportMarket(CToken(CKAIA));
        require(result == 0, "Failed to support cKAIA market");
        console.log("cKAIA market supported");
        
        result = comptroller._supportMarket(CToken(CSTKAIA));
        require(result == 0, "Failed to support cstKAIA market");
        console.log("cstKAIA market supported");
        
        result = comptroller._supportMarket(CToken(CBORA));
        require(result == 0, "Failed to support cBORA market");
        console.log("cBORA market supported");
        
        result = comptroller._supportMarket(CToken(CMBX));
        require(result == 0, "Failed to support cMBX market");
        console.log("cMBX market supported");
    }
    
    function _setRiskParameters() internal {
        console.log("\n4. Setting Risk Parameters...");
        
        // Set collateral factors
        uint result;
        
        result = comptroller._setCollateralFactor(CToken(CUSDT), USDT_COLLATERAL_FACTOR);
        require(result == 0, "Failed to set cUSDT collateral factor");
        console.log("cUSDT collateral factor:", USDT_COLLATERAL_FACTOR);
        
        result = comptroller._setCollateralFactor(CToken(CKAIA), KAIA_COLLATERAL_FACTOR);
        require(result == 0, "Failed to set cKAIA collateral factor");
        console.log("cKAIA collateral factor:", KAIA_COLLATERAL_FACTOR);
        
        result = comptroller._setCollateralFactor(CToken(CSTKAIA), STKAIA_COLLATERAL_FACTOR);
        require(result == 0, "Failed to set cstKAIA collateral factor");
        console.log("cstKAIA collateral factor:", STKAIA_COLLATERAL_FACTOR);
        
        result = comptroller._setCollateralFactor(CToken(CBORA), BORA_COLLATERAL_FACTOR);
        require(result == 0, "Failed to set cBORA collateral factor");
        console.log("cBORA collateral factor:", BORA_COLLATERAL_FACTOR);
        
        result = comptroller._setCollateralFactor(CToken(CMBX), MBX_COLLATERAL_FACTOR);
        require(result == 0, "Failed to set cMBX collateral factor");
        console.log("cMBX collateral factor:", MBX_COLLATERAL_FACTOR);
        
        // Set borrow caps
        CToken[] memory cTokens = new CToken[](5);
        uint[] memory borrowCaps = new uint[](5);
        
        cTokens[0] = CToken(CUSDT);
        cTokens[1] = CToken(CKAIA);
        cTokens[2] = CToken(CSTKAIA);
        cTokens[3] = CToken(CBORA);
        cTokens[4] = CToken(CMBX);
        
        borrowCaps[0] = USDT_BORROW_CAP;
        borrowCaps[1] = KAIA_BORROW_CAP;
        borrowCaps[2] = STKAIA_BORROW_CAP;
        borrowCaps[3] = BORA_BORROW_CAP;
        borrowCaps[4] = MBX_BORROW_CAP;
        
        comptroller._setMarketBorrowCaps(cTokens, borrowCaps);
        console.log("Borrow caps set:");
        console.log("   - USDT:", USDT_BORROW_CAP);
        console.log("   - KAIA:", KAIA_BORROW_CAP, "(disabled)");
        console.log("   - stKAIA:", STKAIA_BORROW_CAP, "(disabled)");
        console.log("   - BORA:", BORA_BORROW_CAP, "(disabled)");
        console.log("   - MBX:", MBX_BORROW_CAP, "(disabled)");
    }
    
    function _logDeploymentResults() internal view {
        console.log("\n===========================================");
        console.log("Main Contracts Deployment Summary");
        console.log("===========================================");
        
        console.log("\nCore Contracts:");
        console.log("Comptroller:", address(comptroller));
        
        console.log("\nConnected Contracts:");
        console.log("Price Oracle:", ORACLE);
        console.log("cUSDT:", CUSDT);
        console.log("cKAIA:", CKAIA);
        console.log("cstKAIA:", CSTKAIA);
        console.log("cBORA:", CBORA);
        console.log("cMBX:", CMBX);
        
        console.log("\nProtocol Configuration:");
        console.log("Close Factor:", CLOSE_FACTOR, "(50%)");
        console.log("Liquidation Incentive:", LIQUIDATION_INCENTIVE, "(8% bonus)");
        
        console.log("\nCollateral Factors:");
        console.log("USDT:", USDT_COLLATERAL_FACTOR, "(85%)");
        console.log("KAIA:", KAIA_COLLATERAL_FACTOR, "(75%)");
        console.log("stKAIA:", STKAIA_COLLATERAL_FACTOR, "(75%)");
        console.log("BORA:", BORA_COLLATERAL_FACTOR, "(70%)");
        console.log("MBX:", MBX_COLLATERAL_FACTOR, "(70%)");
        
        console.log("\nBorrow Configuration:");
        console.log("USDT: Borrowable (1M cap)");
        console.log("KAIA: Collateral only");
        console.log("stKAIA: Collateral only");
        console.log("BORA: Collateral only");
        console.log("MBX: Collateral only");
    }
     
    
    function _parsePrivateKey(string memory privateKeyString) internal pure returns (uint256) {
        if (bytes(privateKeyString)[0] == '0' && bytes(privateKeyString)[1] == 'x') {
            return vm.parseUint(privateKeyString);
        } else {
            return vm.parseUint(string(abi.encodePacked("0x", privateKeyString)));
        }
    }
}