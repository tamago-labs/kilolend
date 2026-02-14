// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import {Script, console} from "forge-std/Script.sol";
import "../../src/Comptroller.sol";
import "../../src/KiloPriceOracle.sol";
import "../../src/tokens/CEther.sol";
import "../../src/tokens/CErc20Immutable.sol";
import "../../src/interest-rates/JumpRateModelV2.sol";

/**
 * @title DeployKUBProtocol
 * @notice Deploy all protocol contracts and configure KiloLend on KUB Chain (Chain ID 96)
 * @dev Usage: 
 *   forge script script/core/4-DeployKUBProtocol.s.sol --rpc-url $KUB_RPC_URL --broadcast --legacy
 */
contract DeployKUBProtocol is Script {
    
    // Token addresses on KUB Chain
    address public constant KUSDT = 0x7d984C24d2499D840eB3b7016077164e15E5faA6;
    
    // Oracle address
    address public constant ORACLE = 0xE370336C3074E76163b2f9B07876d0Cb3425488D;
    
    // Deployment configuration
    uint256 public constant INITIAL_EXCHANGE_RATE = 0.2e18; // 0.2 cToken per underlying (Compound default)
    uint8 public constant CTOKEN_DECIMALS = 8;              // Compound V2 standard
    
    // Protocol configuration
    uint256 public constant CLOSE_FACTOR = 0.5e18;           // 50% - max liquidation per transaction
    uint256 public constant LIQUIDATION_INCENTIVE = 1.08e18; // 8% liquidation bonus
    
    // Collateral factors (what % of asset value can be borrowed against)
    uint256 public constant KUB_COLLATERAL_FACTOR = 0.75e18;  // 75% for native KUB
    uint256 public constant KUSDT_COLLATERAL_FACTOR = 0.85e18; // 85% for stablecoin
    
    // Borrow caps (0 = no cap)
    uint256 public constant KUB_BORROW_CAP = 0;    // No cap
    uint256 public constant KUSDT_BORROW_CAP = 0;  // No cap
    
    // KUB Chain specific: 5 second block time = 6,307,200 blocks per year
    uint256 public constant BLOCKS_PER_YEAR = 6307200;
    
    // Deployed contracts
    Comptroller public comptroller;
    JumpRateModelV2 public stablecoinRateModel;
    JumpRateModelV2 public volatileRateModel;
    CErc20Immutable public cKUSDT;
    CEther public cKUB;
    
    function run() external {
        string memory privateKeyString = vm.envString("PRIVATE_KEY");
        uint256 deployerPrivateKey = _parsePrivateKey(privateKeyString);
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("===========================================");
        console.log("Deploying Complete KiloLend Protocol");
        console.log("===========================================");
        console.log("Chain ID:", block.chainid);
        require(block.chainid == 96, "Must deploy to KUB Chain (chain ID 96)");
        
        console.log("Deployer address:", deployer);
        console.log("Block number:", block.number);
        
        // Check deployer balance
        uint256 balance = deployer.balance;
        console.log("Deployer balance:", balance / 1e18, "KUB");
        require(balance > 0.8 ether, "Insufficient balance for deployment (need at least 0.8 KUB)");
        
        // Verify prerequisite contracts
        _verifyPrerequisites();
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 1. Deploy Comptroller first
        _deployComptroller();
        
        // 2. Deploy Interest Rate Models
        _deployInterestRateModels(deployer);
        
        // 3. Deploy cTokens 
        _deployCTokens(deployer);
        
        // 4. Configure the protocol
        _configureProtocol();
        
        // 5. Support markets
        _supportMarkets();
        
        // 6. Set risk parameters
        _setRiskParameters();
        
        vm.stopBroadcast();
        
        _logDeploymentResults();
    }
    
    function _verifyPrerequisites() internal view {
        console.log("Verifying prerequisite contracts...");
        require(ORACLE != address(0), "Oracle address not set (set KUB_ORACLE_ADDRESS env var)");
        require(KUSDT != address(0), "KUSDT address not set");
        console.log("All prerequisite contracts verified");
    }
    
    function _deployComptroller() internal {
        console.log("\n1. Deploying Comptroller...");
        
        // Deploy comptroller directly
        comptroller = new Comptroller();
        console.log("Comptroller:", address(comptroller));
    }
    
    function _deployInterestRateModels(address deployer) internal {
        console.log("\n2. Deploying Interest Rate Models...");
        console.log("   Blocks per year:", BLOCKS_PER_YEAR);
        
        // Stablecoin rate model (for KUSDT)
        // - 2.5% base rate, 15% slope before kink, 150% jump after 85% utilization
        stablecoinRateModel = new JumpRateModelV2(
            25000000000000000, // 2.5% base rate per year (0.025 * 1e18)
            150000000000000000, // 15% multiplier per year before kink (0.15 * 1e18)
            1500000000000000000, // 150% jump multiplier per year after kink (1.50 * 1e18)
            850000000000000000, // 85% kink point (0.85 * 1e18)
            payable(deployer), // owner
            BLOCKS_PER_YEAR   // blocks per year for KUB Chain
        );
        console.log("StablecoinRateModel:", address(stablecoinRateModel));
        
        // Volatile asset rate model (for KUB)
        // - 3% base rate, 15% slope before kink, 200% jump after 80% utilization
        volatileRateModel = new JumpRateModelV2(
            30000000000000000, // 3% base rate per year (0.03 * 1e18)
            150000000000000000, // 15% multiplier per year before kink (0.15 * 1e18)
            2000000000000000000, // 200% jump multiplier per year after kink (2.00 * 1e18)
            800000000000000000, // 80% kink point (0.80 * 1e18)
            payable(deployer), // owner
            BLOCKS_PER_YEAR   // blocks per year for KUB Chain
        );
        console.log("VolatileRateModel:", address(volatileRateModel));
    }
    
    function _deployCTokens(address deployer) internal {
        console.log("\n3. Deploying cTokens...");
        console.log("   Initial exchange rate:", INITIAL_EXCHANGE_RATE / 1e18);
        console.log("   cToken decimals:", CTOKEN_DECIMALS);
        
        // Deploy cKUSDT (Stablecoin market)
        cKUSDT = new CErc20Immutable(
            KUSDT,
            ComptrollerInterface(address(comptroller)),
            InterestRateModel(address(stablecoinRateModel)),
            INITIAL_EXCHANGE_RATE,
            "Compound KUSDT",
            "cKUSDT",
            CTOKEN_DECIMALS,
            payable(deployer)
        );
        console.log("cKUSDT:", address(cKUSDT));
        
        // Deploy cKUB for native KUB token  
        cKUB = new CEther(
            ComptrollerInterface(address(comptroller)),
            InterestRateModel(address(volatileRateModel)),
            INITIAL_EXCHANGE_RATE,
            "Compound KUB",
            "cKUB",
            CTOKEN_DECIMALS,
            payable(deployer)
        );
        console.log("cKUB:", address(cKUB));
    }
    
    function _configureProtocol() internal {
        console.log("\n4. Configuring Protocol...");
        
        // Set price oracle
        comptroller._setPriceOracle(PriceOracle(ORACLE));
        console.log("Price oracle set:", ORACLE);
        
        // Set liquidation parameters
        comptroller._setCloseFactor(CLOSE_FACTOR);
        comptroller._setLiquidationIncentive(LIQUIDATION_INCENTIVE);
        console.log("Close factor set:", CLOSE_FACTOR / 1e18);
        console.log("Liquidation incentive set:", LIQUIDATION_INCENTIVE / 1e18);
    }
    
    function _supportMarkets() internal {
        console.log("\n5. Supporting Markets...");
        
        // Support all cToken markets
        uint result;
        
        result = comptroller._supportMarket(CToken(address(cKUSDT)));
        require(result == 0, "Failed to support cKUSDT market");
        console.log("cKUSDT market supported");
        
        result = comptroller._supportMarket(CToken(address(cKUB)));
        require(result == 0, "Failed to support cKUB market");
        console.log("cKUB market supported");
    }
    
    function _setRiskParameters() internal {
        console.log("\n6. Setting Risk Parameters...");
        
        // Set collateral factors
        uint result;
        
        result = comptroller._setCollateralFactor(CToken(address(cKUSDT)), KUSDT_COLLATERAL_FACTOR);
        require(result == 0, "Failed to set cKUSDT collateral factor");
        console.log("cKUSDT collateral factor:", KUSDT_COLLATERAL_FACTOR / 1e18);
        
        result = comptroller._setCollateralFactor(CToken(address(cKUB)), KUB_COLLATERAL_FACTOR);
        require(result == 0, "Failed to set cKUB collateral factor");
        console.log("cKUB collateral factor:", KUB_COLLATERAL_FACTOR / 1e18);
        
        // Set borrow caps
        CToken[] memory cTokens = new CToken[](2);
        uint[] memory borrowCaps = new uint[](2);
        
        cTokens[0] = CToken(address(cKUSDT));
        cTokens[1] = CToken(address(cKUB));
        
        borrowCaps[0] = KUSDT_BORROW_CAP;
        borrowCaps[1] = KUB_BORROW_CAP;
        
        comptroller._setMarketBorrowCaps(cTokens, borrowCaps);
        console.log("Borrow caps configured:");
        console.log("   - KUSDT: No cap (borrowable)");
        console.log("   - KUB: No cap (borrowable)");
    }
    
    function _logDeploymentResults() internal view {
        console.log("\n===========================================");
        console.log("KUB Protocol Deployment Summary");
        console.log("===========================================");
        
        console.log("\nCore Contracts:");
        console.log("Comptroller:", address(comptroller));
        console.log("Oracle:", ORACLE);
        
        console.log("\nInterest Rate Models:");
        console.log("StablecoinRateModel:", address(stablecoinRateModel));
        console.log("VolatileRateModel:", address(volatileRateModel));
        
        console.log("\nBorrowable Markets:");
        console.log("cKUSDT (Stablecoin):", address(cKUSDT));
        console.log("cKUB (Volatile - Native):", address(cKUB));
        
        console.log("\nRisk Parameters:");
        console.log("KUSDT Collateral Factor:", KUSDT_COLLATERAL_FACTOR / 1e18);
        console.log("KUB Collateral Factor:", KUB_COLLATERAL_FACTOR / 1e18);
        console.log("Close Factor:", CLOSE_FACTOR / 1e18);
        console.log("Liquidation Incentive:", LIQUIDATION_INCENTIVE / 1e18);
        
        console.log("\nKUB Chain Specific:");
        console.log("Block Time: 5 seconds");
        console.log("Blocks Per Year:", BLOCKS_PER_YEAR);
        
        console.log("\n===========================================");
        console.log("Deployment complete!");
        console.log("===========================================");
    }
    
    function _parsePrivateKey(string memory privateKeyString) internal pure returns (uint256) {
        if (bytes(privateKeyString)[0] == '0' && bytes(privateKeyString)[1] == 'x') {
            return vm.parseUint(privateKeyString);
        } else {
            return vm.parseUint(string(abi.encodePacked("0x", privateKeyString)));
        }
    }
}