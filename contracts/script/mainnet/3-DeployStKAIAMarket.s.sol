// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import {Script, console} from "forge-std/Script.sol";
import "../../src/Comptroller.sol";
import "../../src/KiloPriceOracle.sol";
import "../../src/tokens/CToken.sol";
import "../../src/tokens/CErc20Immutable.sol";
import "../../src/interest-rates/JumpRateModelV2.sol";

/**
 * @title deployStKAIAMarket - Mainnet
 * @notice Deploy stKAIA market and configure oracle in one script
 * @dev This single script handles cStKAIA deployment and oracle price setup
 * @dev Usage: 
 *   forge script script/mainnet/3-DeployStKAIAMarket.s.sol --rpc-url $KAIA_RPC_URL --broadcast --verify
 */
contract DeployStKAIAMarket is Script {
    
    // Existing deployed contract addresses
    address public constant COMPTROLLER = 0x0B5f0Ba5F13eA4Cb9C8Ee48FB75aa22B451470C2;
    address public constant ORACLE = 0xBB265F42Cce932c5e383536bDf50B82e08eaf454; 
    address public constant STAKED_KAIA = 0x42952B873ed6f7f0A7E4992E2a9818E3A9001995; // stKAIA token address
    
    // Configuration
    uint256 public constant INITIAL_EXCHANGE_RATE = 0.2e18; // 0.2 cToken per underlying
    uint8 public constant CTOKEN_DECIMALS = 8;
    uint256 public constant STAKED_KAIA_INITIAL_PRICE = 0.14e18; // $0.14
    uint256 public constant STAKED_KAIA_COLLATERAL_FACTOR = 0.80e18; // 80%
    
    function run() external {
        string memory privateKeyString = vm.envString("PRIVATE_KEY");
        uint256 deployerPrivateKey = _parsePrivateKey(privateKeyString);
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("===========================================");
        console.log("Deploying stKAIA Market + Oracle Config");
        console.log("===========================================");
        console.log("Chain ID:", block.chainid);
        require(block.chainid == 8217, "Must deploy to KAIA Mainnet (chain ID 8217)");
        
        console.log("Deployer:", deployer);
        console.log("Comptroller:", COMPTROLLER);
        console.log("Oracle:", ORACLE);
        console.log("stKAIA:", STAKED_KAIA);
        
        // Check balance
        uint256 balance = deployer.balance;
        console.log("Balance:", balance / 1e18, "KAIA");
        require(balance > 0.2 ether, "Need at least 0.2 KAIA for gas");
        
        // Verify contracts exist
        _verifyContracts();
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 1. Deploy interest rate model
        JumpRateModelV2 rateModel = _deployRateModel();
        
        // 2. Deploy cStKAIA token
        CErc20Immutable cStKAIA = _deployCStKAIA(address(rateModel));
        
        // 3. Configure oracle price
        _configureOracle();

        // 4. Add market to Comptroller
        _addMarketToComptroller(address(cStKAIA));
        
        // 5. Set risk parameters
        _setRiskParameters(address(cStKAIA));
        
        vm.stopBroadcast();
        
        _logResults(address(cStKAIA), address(rateModel));
    }
    
    function _verifyContracts() internal view {
        require(COMPTROLLER != address(0), "Comptroller address not set");
        require(ORACLE != address(0), "Oracle address not set");
        require(STAKED_KAIA != address(0), "stKAIA address not set");
        
        // Check contracts exist
        uint256 size;
        assembly { size := extcodesize(COMPTROLLER) }
        require(size > 0, "Comptroller not found");
        
        assembly { size := extcodesize(ORACLE) }
        require(size > 0, "Oracle not found");
        
        console.log("All contracts verified");
    }
    
    function _deployRateModel() internal returns (JumpRateModelV2) {
        console.log("\n1. Deploying rate model...");
        
        JumpRateModelV2 rateModel = new JumpRateModelV2(
            0.01e18,    // 1% base rate
            0.04e18,    // 4% multiplier
            1.10e18,    // 110% jump multiplier
            0.80e18,    // 80% kink point
            msg.sender  // owner
        );
        
        console.log("Rate model:", address(rateModel));
        return rateModel;
    }
    
    function _deployCStKAIA(address rateModel) internal returns (CErc20Immutable) {
        console.log("\n2. Deploying cStKAIA...");
        
        CErc20Immutable cStKAIA = new CErc20Immutable(
            STAKED_KAIA,
            ComptrollerInterface(COMPTROLLER),
            InterestRateModel(rateModel),
            INITIAL_EXCHANGE_RATE,
            "Compound Staked KAIA",
            "cStKAIA",
            CTOKEN_DECIMALS,
            payable(msg.sender)
        );
        
        console.log("cStKAIA:", address(cStKAIA));
        return cStKAIA;
    }
    
    function _addMarketToComptroller(address cStKAIA) internal {
        console.log("\n3. Adding market to Comptroller...");
        
        Comptroller comptroller = Comptroller(COMPTROLLER);
        uint result = comptroller._supportMarket(CToken(cStKAIA));
        require(result == 0, "Failed to support market");
        
        console.log("Market supported in Comptroller");
    }
    
    function _setRiskParameters(address cStKAIA) internal {
        console.log("\n4. Setting risk parameters...");
        
        Comptroller comptroller = Comptroller(COMPTROLLER);
        
        // Set collateral factor
        uint result = comptroller._setCollateralFactor(
            CToken(cStKAIA), 
            STAKED_KAIA_COLLATERAL_FACTOR
        );
        require(result == 0, "Failed to set collateral factor");
        
        console.log("Collateral factor: 80%");
        console.log("Borrow cap: No cap");
    }
    
    function _configureOracle() internal {
        console.log("\n5. Configuring oracle...");
        
        KiloPriceOracle oracle = KiloPriceOracle(ORACLE);
        oracle.setDirectPrice(STAKED_KAIA, STAKED_KAIA_INITIAL_PRICE);
        
        // Verify price was set
        uint256 price = oracle.mockPrices(STAKED_KAIA);
        require(price == STAKED_KAIA_INITIAL_PRICE, "Price not set correctly");
        
        console.log("Oracle price set: $0.14");
    }
    
    function _logResults(address cStKAIA, address rateModel) internal view {
        console.log("\n===========================================");
        console.log("Deployment Complete!");
        console.log("===========================================");
        
        console.log("\nNew Contracts:");
        console.log("cStKAIA:", cStKAIA);
        console.log("Rate Model:", rateModel);
        
        console.log("\nConfiguration:");
        console.log("Collateral Factor: 80%");
        console.log("Borrow Cap: None");
        console.log("Oracle Price: $0.18");
        console.log("Interest Rates: 2% base, 12% multiplier");
        
        console.log("\nNext Steps:");
        console.log("1. Update oracle bot .env:");
        console.log("   STAKED_KAIA_ADDRESS=", STAKED_KAIA);
        console.log("2. Restart oracle bot");
        console.log("3. Update frontend to show cStKAIA market");
        
        console.log("\nVerification:");
        console.log("cast call ", COMPTROLLER, " \"markets(address)\"", cStKAIA);
        console.log("cast call ", ORACLE, " \"mockPrices(address)\"", STAKED_KAIA);
    }
    
    function _parsePrivateKey(string memory privateKeyString) internal pure returns (uint256) {
        if (bytes(privateKeyString)[0] == '0' && bytes(privateKeyString)[1] == 'x') {
            return vm.parseUint(privateKeyString);
        } else {
            return vm.parseUint(string(abi.encodePacked("0x", privateKeyString)));
        }
    }
}
