// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import {Script, console} from "forge-std/Script.sol";
import "../../src/tokens/CErc20Immutable.sol";
import "../../src/tokens/CEther.sol";
import "../../src/interest-rates/StablecoinJumpRateModel.sol";
import "../../src/interest-rates/CollateralRateModel.sol";
import "../../src/mocks/MockToken.sol";

/**
 * @title DeployCTokens
 * @notice Deploy all cTokens for the KiloLend protocol
 * @dev Usage: 
 *   forge script script/3-DeployCTokens.s.sol --rpc-url $KAIA_RPC_URL --broadcast --verify
 */
contract DeployCTokens is Script {
    
    // Deployment configuration
    uint256 public constant INITIAL_EXCHANGE_RATE = 0.2e18; // 0.2 cToken per underlying
    uint8 public constant CTOKEN_DECIMALS = 8;
    
    // Contract addresses - update these with actual deployed addresses
    address public constant COMPTROLLER = 0x5555555555555555555555555555555555555555; // Replace with actual
    address public constant USDT = 0x1111111111111111111111111111111111111111; // Replace with actual
    address public constant ST_KAIA = 0x2222222222222222222222222222222222222222; // Replace with actual
    address public constant BORA = 0x3333333333333333333333333333333333333333; // Replace with actual
    address public constant MBX = 0x4444444444444444444444444444444444444444; // Replace with actual
    
    // Deployed contracts will be stored here
    StablecoinJumpRateModel public stablecoinRateModel;
    CollateralRateModel public collateralRateModel;
    
    CErc20Immutable public cUSDT;
    CErc20Immutable public cstKAIA;
    CErc20Immutable public cBORA;
    CErc20Immutable public cMBX;
    CEther public cKAIA;
    
    function run() external {
        string memory privateKeyString = vm.envString("PRIVATE_KEY");
        uint256 deployerPrivateKey = _parsePrivateKey(privateKeyString);
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("===========================================");
        console.log("Deploying CTokens for KiloLend Protocol");
        console.log("===========================================");
        console.log("Chain ID:", block.chainid);
        console.log("Deployer address:", deployer);
        console.log("Block number:", block.number);
        
        // Check deployer balance
        uint256 balance = deployer.balance;
        console.log("Deployer balance:", balance / 1e18, "KAIA");
        require(balance > 0.5 ether, "Insufficient balance for deployment (need at least 0.5 KAIA)");
        
        // Verify prerequisite contracts
        require(COMPTROLLER != address(0), "Comptroller address not set");
        require(USDT != address(0), "USDT address not set");
        require(ST_KAIA != address(0), "stKAIA address not set");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 1. Deploy Interest Rate Models
        _deployInterestRateModels();
        
        // 2. Deploy cTokens for ERC20 tokens
        _deployCTokensERC20();
        
        // 3. Deploy cKAIA for native KAIA token
        _deployCKAIA();
        
        vm.stopBroadcast();
        
        _logDeploymentResults();
    }
    
    function _deployInterestRateModels() internal {
        console.log("\n1. Deploying Interest Rate Models...");
        
        // Stablecoin rate model (for USDT)
        // - 1% base rate, 4% slope before kink, 109% jump after 80% utilization
        stablecoinRateModel = new StablecoinJumpRateModel();
        console.log("StablecoinJumpRateModel:", address(stablecoinRateModel));
        
        // Collateral rate model (for volatile assets like stKAIA, BORA, MBX)
        // - 0% borrow rate, 0.1% supply rate
        collateralRateModel = new CollateralRateModel();
        console.log("CollateralRateModel:", address(collateralRateModel));
    }
    
    function _deployCTokensERC20() internal {
        console.log("\n2. Deploying ERC20 cTokens...");
        
        // Deploy cUSDT (Stablecoin market - main borrowing asset)
        cUSDT = new CErc20Immutable(
            USDT,
            ComptrollerInterface(COMPTROLLER),
            InterestRateModel(address(stablecoinRateModel)),
            INITIAL_EXCHANGE_RATE,
            "Compound USDT",
            "cUSDT",
            CTOKEN_DECIMALS,
            payable(msg.sender)
        );
        console.log("cUSDT:", address(cUSDT));
        
        // Deploy cstKAIA (Collateral asset)
        cstKAIA = new CErc20Immutable(
            ST_KAIA,
            ComptrollerInterface(COMPTROLLER),
            InterestRateModel(address(collateralRateModel)),
            INITIAL_EXCHANGE_RATE,
            "Compound Staked KAIA",
            "cstKAIA",
            CTOKEN_DECIMALS,
            payable(msg.sender)
        );
        console.log("cstKAIA:", address(cstKAIA));
        
        // Deploy cBORA (Collateral asset)
        cBORA = new CErc20Immutable(
            BORA,
            ComptrollerInterface(COMPTROLLER),
            InterestRateModel(address(collateralRateModel)),
            INITIAL_EXCHANGE_RATE,
            "Compound BORA",
            "cBORA",
            CTOKEN_DECIMALS,
            payable(msg.sender)
        );
        console.log("cBORA:", address(cBORA));
        
        // Deploy cMBX (Collateral asset)
        cMBX = new CErc20Immutable(
            MBX,
            ComptrollerInterface(COMPTROLLER),
            InterestRateModel(address(collateralRateModel)),
            INITIAL_EXCHANGE_RATE,
            "Compound MBX",
            "cMBX",
            CTOKEN_DECIMALS,
            payable(msg.sender)
        );
        console.log("cMBX:", address(cMBX));
    }
    
    function _deployCKAIA() internal {
        console.log("\n3. Deploying cKAIA (Native Token)...");
        
        // Deploy cKAIA for native KAIA token (Collateral asset)
        cKAIA = new CEther(
            ComptrollerInterface(COMPTROLLER),
            InterestRateModel(address(collateralRateModel)),
            INITIAL_EXCHANGE_RATE,
            "Compound KAIA",
            "cKAIA",
            CTOKEN_DECIMALS,
            payable(msg.sender)
        );
        console.log("cKAIA:", address(cKAIA));
    }
    
    function _logDeploymentResults() internal view {
        console.log("\n===========================================");
        console.log("CTokens Deployment Summary");
        console.log("===========================================");
        
        console.log("\n Interest Rate Models:");
        console.log("StablecoinJumpRateModel:", address(stablecoinRateModel));
        console.log("CollateralRateModel:", address(collateralRateModel));
        
        console.log("\n Stablecoin Markets (Borrowable):");
        console.log("cUSDT:", address(cUSDT));
        
        console.log("\n Collateral Markets (Supply-only):");
        console.log("cKAIA (Native):", address(cKAIA));
        console.log("cstKAIA:", address(cstKAIA));
        console.log("cBORA:", address(cBORA));
        console.log("cMBX:", address(cMBX));
        
        console.log("\n  Configuration:");
        console.log("Initial Exchange Rate:", INITIAL_EXCHANGE_RATE);
        console.log("cToken Decimals:", CTOKEN_DECIMALS);
        
        console.log("\n Next Steps:");
        console.log("1. Update Comptroller addresses in 3-DeployMainContracts.s.sol");
        console.log("2. Run 3-DeployMainContracts.s.sol to deploy Comptroller");
        console.log("3. Configure markets in Comptroller (_supportMarket)");
        console.log("4. Set collateral factors and other risk parameters");
    }
    
    function _parsePrivateKey(string memory privateKeyString) internal pure returns (uint256) {
        if (bytes(privateKeyString)[0] == '0' && bytes(privateKeyString)[1] == 'x') {
            return vm.parseUint(privateKeyString);
        } else {
            return vm.parseUint(string(abi.encodePacked("0x", privateKeyString)));
        }
    }
}