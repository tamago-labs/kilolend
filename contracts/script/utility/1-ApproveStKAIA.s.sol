// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import {Script, console} from "forge-std/Script.sol";
import "@kaiachain/contracts/KIP/token/KIP7/IKIP7.sol";


/**
 * @title ApproveStKAIA - Mainnet
 * @notice Approve cStKAIA to spend stKAIA tokens
 * @dev Grants unlimited allowance for seamless lending operations
 * @dev Usage: 
 *   forge script script/utility/1-ApproveStKAIA.s.sol --rpc-url $KAIA_RPC_URL --broadcast
 */
contract ApproveStKAIA is Script {
    
    // Contract addresses
    address public constant STKAIA = 0x42952B873ed6f7f0A7E4992E2a9818E3A9001995;
    address public constant CSTKAIA = 0x0BC926EF3856542134B06DCf53c86005b08B9625;
    
    // Approval amount (max uint256 for unlimited)
    uint256 public constant APPROVAL_AMOUNT = type(uint256).max;
    
    function run() external {
        string memory privateKeyString = vm.envString("PRIVATE_KEY");
        uint256 deployerPrivateKey = _parsePrivateKey(privateKeyString);
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("===========================================");
        console.log("Approving stKAIA for cStKAIA");
        console.log("===========================================");
        console.log("Chain ID:", block.chainid);
        require(block.chainid == 8217, "Must be on KAIA Mainnet (chain ID 8217)");
        
        console.log("Deployer:", deployer);
        console.log("stKAIA:", STKAIA);
        console.log("cStKAIA:", CSTKAIA);
        
        // Check balance
        uint256 balance = deployer.balance;
        console.log("KAIA Balance:", balance / 1e18, "KAIA");
        require(balance > 0.01 ether, "Need at least 0.01 KAIA for gas");
        
        // Check stKAIA balance
        IKIP7 stKAIA = IKIP7(STKAIA);
        uint256 stKAIABalance = stKAIA.balanceOf(deployer);
        console.log("stKAIA Balance:", stKAIABalance / 1e18, "stKAIA");
        require(stKAIABalance > 0, "Need stKAIA tokens to approve");
        
        // Check current allowance
        uint256 currentAllowance = stKAIA.allowance(deployer, CSTKAIA);
        console.log("Current Allowance:", currentAllowance / 1e18, "stKAIA");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Approve cStKAIA to spend stKAIA
        console.log("\nApproving cStKAIA to spend stKAIA...");
        bool success = stKAIA.approve(CSTKAIA, APPROVAL_AMOUNT);
        require(success, "Approval failed");
        
        vm.stopBroadcast();
        
        // Verify approval
        uint256 newAllowance = stKAIA.allowance(deployer, CSTKAIA);
        console.log("\n===========================================");
        console.log("Approval Successful!");
        console.log("===========================================");
        console.log("New Allowance:", newAllowance == type(uint256).max ? "UNLIMITED" : string(abi.encodePacked(newAllowance / 1e18, " stKAIA")));
          
    }
    
    function _parsePrivateKey(string memory privateKeyString) internal pure returns (uint256) {
        if (bytes(privateKeyString)[0] == '0' && bytes(privateKeyString)[1] == 'x') {
            return vm.parseUint(privateKeyString);
        } else {
            return vm.parseUint(string(abi.encodePacked("0x", privateKeyString)));
        }
    }
}
