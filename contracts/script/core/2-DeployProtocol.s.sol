// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import {Script, console} from "forge-std/Script.sol";
import "../../src/Comptroller.sol";
import "../../src/KiloPriceOracle.sol";
import "../../src/tokens/CToken.sol";
import "../../src/tokens/CErc20Immutable.sol";
import "../../src/tokens/CEther.sol";
import "../../src/interest-rates/StablecoinJumpRateModel.sol";
import "../../src/interest-rates/JumpRateModelV2.sol";

/**
 * @title DeployProtocol - Mainnet
 * @notice Deploy all protocol contracts and configure the KiloLend system on KAIA Mainnet
 * @dev Usage: 
 *   forge script script/core/2-DeployProtocol.s.sol --rpc-url $KAIA_RPC_URL --broadcast --verify
 */
contract DeployProtocol is Script {
    
    // Update these addresses with deployed contracts 
    address public constant ORACLE = 0xE370336C3074E76163b2f9B07876d0Cb3425488D;
    address public constant USDT = 0xd077A400968890Eacc75cdc901F0356c943e4fDb;
    address public constant SIX = 0xEf82b1C6A550e730D8283E1eDD4977cd01FAF435;
    address public constant BORA = 0x02cbE46fB8A1F579254a9B485788f2D86Cad51aa;
    address public constant MBX = 0xD068c52d81f4409B9502dA926aCE3301cc41f623;
    address public constant STAKED_KAIA = 0x42952B873ed6f7f0A7E4992E2a9818E3A9001995;
    
    // Deployment configuration
    uint256 public constant INITIAL_EXCHANGE_RATE = 0.2e18; // 0.2 cToken per underlying
    uint8 public constant CTOKEN_DECIMALS = 8;
    
    // Protocol configuration
    uint256 public constant CLOSE_FACTOR = 0.5e18; // 50% - max liquidation per transaction
    uint256 public constant LIQUIDATION_INCENTIVE = 1.08e18; // 8% liquidation bonus
    
    // Collateral factors (what % of asset value can be borrowed against)
    uint256 public constant USDT_COLLATERAL_FACTOR = 0.85e18; // 85% for stablecoin
    uint256 public constant KAIA_COLLATERAL_FACTOR = 0.75e18; // 75% for native KAIA
    uint256 public constant STAKED_KAIA_COLLATERAL_FACTOR = 0.70e18; // 70% for stKAIA
    uint256 public constant SIX_COLLATERAL_FACTOR = 0.70e18; // 70% for SIX
    uint256 public constant BORA_COLLATERAL_FACTOR = 0.70e18; // 70% for BORA
    uint256 public constant MBX_COLLATERAL_FACTOR = 0.70e18; // 70% for MBX
    
    // Borrow caps (1 = disabled for KAIA, 0 = no cap for others)
    uint256 public constant USDT_BORROW_CAP = 0; // No cap
    uint256 public constant KAIA_BORROW_CAP = 0; // No cap
    uint256 public constant STAKED_KAIA_BORROW_CAP = 0; // No cap
    uint256 public constant SIX_BORROW_CAP = 0; // No cap
    uint256 public constant BORA_BORROW_CAP = 0; // No cap
    uint256 public constant MBX_BORROW_CAP = 0; // No cap
    
    // Deployed contracts
    Comptroller public comptroller;
    StablecoinJumpRateModel public stablecoinRateModel;
    JumpRateModelV2 public volatileRateModel;
    CErc20Immutable public cUSDT;
    CErc20Immutable public cSIX;
    CErc20Immutable public cBORA;
    CErc20Immutable public cMBX;
    CErc20Immutable public cStKAIA;
    CEther public cKAIA;
    
    function run() external {
        string memory privateKeyString = vm.envString("PRIVATE_KEY");
        uint256 deployerPrivateKey = _parsePrivateKey(privateKeyString);
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("===========================================");
        console.log("Deploying Complete KiloLend Protocol");
        console.log("===========================================");
        console.log("Chain ID:", block.chainid);
        require(block.chainid == 8217, "Must deploy to KAIA Mainnet (chain ID 8217)");
        
        console.log("Deployer address:", deployer);
        console.log("Block number:", block.number);
        
        // Check deployer balance
        uint256 balance = deployer.balance;
        console.log("Deployer balance:", balance / 1e18, "KAIA");
        require(balance > 0.8 ether, "Insufficient balance for deployment (need at least 0.8 KAIA)");
        
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
    
    function _verifyPrerequisites() internal pure {
        console.log("Verifying prerequisite contracts...");
        require(ORACLE != address(0), "Oracle address not set");
        require(USDT != address(0), "USDT address not set");
        require(SIX != address(0), "SIX address not set");
        require(BORA != address(0), "BORA address not set");
        require(MBX != address(0), "MBX address not set");
        require(STAKED_KAIA != address(0), "STAKED_KAIA address not set");
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
        
        // Stablecoin rate model (for USDT)
        // - 1% base rate, 4% slope before kink, 109% jump after 80% utilization
        stablecoinRateModel = new StablecoinJumpRateModel();
        console.log("StablecoinJumpRateModel:", address(stablecoinRateModel));
        
        // Volatile asset rate model (for SIX, BORA, MBX, KAIA)
        // - 3% base rate, 15% slope before kink, 200% jump after 80% utilization
        volatileRateModel = new JumpRateModelV2(
            0.03e18,    // 3% base rate
            0.15e18,    // 15% multiplier before kink
            2.00e18,    // 200% jump multiplier after kink
            0.80e18,    // 80% kink point
            payable(deployer) // owner
        );
        console.log("VolatileRateModel:", address(volatileRateModel));
    }
    
    function _deployCTokens(address deployer) internal {
        console.log("\n3. Deploying cTokens...");
        
        // Deploy cUSDT (Stablecoin market)
        cUSDT = new CErc20Immutable(
            USDT,
            ComptrollerInterface(address(comptroller)),
            InterestRateModel(address(stablecoinRateModel)),
            INITIAL_EXCHANGE_RATE,
            "Compound USDT",
            "cUSDT",
            CTOKEN_DECIMALS,
            payable(deployer)
        );
        console.log("cUSDT:", address(cUSDT));
        
        // Deploy cSIX 
        cSIX = new CErc20Immutable(
            SIX,
            ComptrollerInterface(address(comptroller)),
            InterestRateModel(address(volatileRateModel)),
            INITIAL_EXCHANGE_RATE,
            "Compound SIX",
            "cSIX",
            CTOKEN_DECIMALS,
            payable(deployer)
        );
        console.log("cSIX:", address(cSIX));
        
        // Deploy cBORA  
        cBORA = new CErc20Immutable(
            BORA,
            ComptrollerInterface(address(comptroller)),
            InterestRateModel(address(volatileRateModel)),
            INITIAL_EXCHANGE_RATE,
            "Compound BORA",
            "cBORA",
            CTOKEN_DECIMALS,
            payable(deployer)
        );
        console.log("cBORA:", address(cBORA));
        
        // Deploy cMBX  
        cMBX = new CErc20Immutable(
            MBX,
            ComptrollerInterface(address(comptroller)),
            InterestRateModel(address(volatileRateModel)),
            INITIAL_EXCHANGE_RATE,
            "Compound MBX",
            "cMBX",
            CTOKEN_DECIMALS,
            payable(deployer)
        );
        console.log("cMBX:", address(cMBX));

         // Deploy cStKAIA  
        cMBX = new CErc20Immutable(
            MBX,
            ComptrollerInterface(address(comptroller)),
            InterestRateModel(address(volatileRateModel)),
            INITIAL_EXCHANGE_RATE,
            "Compound MBX",
            "cMBX",
            CTOKEN_DECIMALS,
            payable(deployer)
        );

        cStKAIA = new CErc20Immutable(
            STAKED_KAIA,
            ComptrollerInterface(address(comptroller)),
            InterestRateModel(address(volatileRateModel)),
            INITIAL_EXCHANGE_RATE,
            "Compound Staked KAIA",
            "cStKAIA",
            CTOKEN_DECIMALS,
            payable(deployer)
        );
        console.log("cStKAIA:", address(cStKAIA));
        
        // Deploy cKAIA for native KAIA token  
        cKAIA = new CEther(
            ComptrollerInterface(address(comptroller)),
            InterestRateModel(address(volatileRateModel)),
            INITIAL_EXCHANGE_RATE,
            "Compound KAIA",
            "cKAIA",
            CTOKEN_DECIMALS,
            payable(deployer)
        );
        console.log("cKAIA:", address(cKAIA));
    }
    
    function _configureProtocol() internal {
        console.log("\n4. Configuring Protocol...");
        
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
        console.log("\n5. Supporting Markets...");
        
        // Support all cToken markets
        uint result;
        
        result = comptroller._supportMarket(CToken(address(cUSDT)));
        require(result == 0, "Failed to support cUSDT market");
        console.log("cUSDT market supported");
        
        result = comptroller._supportMarket(CToken(address(cKAIA)));
        require(result == 0, "Failed to support cKAIA market");
        console.log("cKAIA market supported");
        
        result = comptroller._supportMarket(CToken(address(cSIX)));
        require(result == 0, "Failed to support cSIX market");
        console.log("cSIX market supported");
        
        result = comptroller._supportMarket(CToken(address(cBORA)));
        require(result == 0, "Failed to support cBORA market");
        console.log("cBORA market supported");
        
        result = comptroller._supportMarket(CToken(address(cMBX)));
        require(result == 0, "Failed to support cMBX market");
        console.log("cMBX market supported");

        result = comptroller._supportMarket(CToken(address(cStKAIA)));
        require(result == 0, "Failed to support cStKAIA market");
        console.log("cStKAIA market supported");
    }
    
    function _setRiskParameters() internal {
        console.log("\n6. Setting Risk Parameters...");
        
        // Set collateral factors
        uint result;
        
        result = comptroller._setCollateralFactor(CToken(address(cUSDT)), USDT_COLLATERAL_FACTOR);
        require(result == 0, "Failed to set cUSDT collateral factor");
        console.log("cUSDT collateral factor:", USDT_COLLATERAL_FACTOR);
        
        result = comptroller._setCollateralFactor(CToken(address(cKAIA)), KAIA_COLLATERAL_FACTOR);
        require(result == 0, "Failed to set cKAIA collateral factor");
        console.log("cKAIA collateral factor:", KAIA_COLLATERAL_FACTOR);
        
        result = comptroller._setCollateralFactor(CToken(address(cSIX)), SIX_COLLATERAL_FACTOR);
        require(result == 0, "Failed to set cSIX collateral factor");
        console.log("cSIX collateral factor:", SIX_COLLATERAL_FACTOR);
        
        result = comptroller._setCollateralFactor(CToken(address(cBORA)), BORA_COLLATERAL_FACTOR);
        require(result == 0, "Failed to set cBORA collateral factor");
        console.log("cBORA collateral factor:", BORA_COLLATERAL_FACTOR);
        
        result = comptroller._setCollateralFactor(CToken(address(cMBX)), MBX_COLLATERAL_FACTOR);
        require(result == 0, "Failed to set cMBX collateral factor");
        console.log("cMBX collateral factor:", MBX_COLLATERAL_FACTOR);

        result = comptroller._setCollateralFactor(CToken(address(cStKAIA)), MBX_COLLATERAL_FACTOR);
        require(result == 0, "Failed to set cStKAIA collateral factor");
        console.log("cStKAIA collateral factor:", STAKED_KAIA_COLLATERAL_FACTOR);
        
        // Set borrow caps
        CToken[] memory cTokens = new CToken[](6);
        uint[] memory borrowCaps = new uint[](6);
        
        cTokens[0] = CToken(address(cUSDT));
        cTokens[1] = CToken(address(cKAIA));
        cTokens[2] = CToken(address(cSIX));
        cTokens[3] = CToken(address(cBORA));
        cTokens[4] = CToken(address(cMBX));
        cTokens[5] = CToken(address(cStKAIA));
        
        borrowCaps[0] = USDT_BORROW_CAP;
        borrowCaps[1] = KAIA_BORROW_CAP;
        borrowCaps[2] = SIX_BORROW_CAP;
        borrowCaps[3] = BORA_BORROW_CAP;
        borrowCaps[4] = MBX_BORROW_CAP;
        borrowCaps[5] = STAKED_KAIA_BORROW_CAP;
        
        comptroller._setMarketBorrowCaps(cTokens, borrowCaps);
        console.log("Borrow caps configured:");
        console.log("   - USDT: No cap (borrowable)");
        console.log("   - KAIA: No cap (borrowable)");
        console.log("   - SIX: No cap (borrowable)");
        console.log("   - BORA: No cap (borrowable)");
        console.log("   - MBX: No cap (borrowable)");
    }
    
    function _logDeploymentResults() internal view {
        console.log("\n===========================================");
        console.log("Complete Protocol Deployment Summary");
        console.log("===========================================");
        
        console.log("\nCore Contracts:");
        console.log("Comptroller:", address(comptroller));
        console.log("Oracle:", ORACLE);
        
        console.log("\nInterest Rate Models:");
        console.log("StablecoinJumpRateModel:", address(stablecoinRateModel));
        console.log("VolatileRateModel:", address(volatileRateModel)); 
        
        console.log("\nBorrowable Markets:");
        console.log("cUSDT (Stablecoin):", address(cUSDT));
        console.log("cSIX (Volatile):", address(cSIX));
        console.log("cBORA (Volatile):", address(cBORA));
        console.log("cMBX (Volatile):", address(cMBX)); 
        console.log("cStKAIA (Volatile):", address(cStKAIA));
        console.log("cKAIA (Volatile):", address(cKAIA)); 
    }
    
    
    function _parsePrivateKey(string memory privateKeyString) internal pure returns (uint256) {
        if (bytes(privateKeyString)[0] == '0' && bytes(privateKeyString)[1] == 'x') {
            return vm.parseUint(privateKeyString);
        } else {
            return vm.parseUint(string(abi.encodePacked("0x", privateKeyString)));
        }
    }
}
