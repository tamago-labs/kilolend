// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "forge-std/Script.sol";
import "../../src/extra/MigrationBonus.sol";

/**
 * @title ManageParticipants
 * @notice Helper script to manage hackathon participants
 * @dev Update the participants array with your user addresses
 */
contract ManageParticipants is Script {
    
    function run() external {
        // Get contract address from environment
        address migrationBonusAddress = 0xd8fb9aFD5beeB7F5a703eBd4f2320AD40DAC9De7;
        string memory privateKeyString = vm.envString("PRIVATE_KEY");
        uint256 deployerPrivateKey = _parsePrivateKey(privateKeyString); 
        
        console.log("Managing participants for MigrationBonus at:", migrationBonusAddress);
        
        MigrationBonus migrationBonus = MigrationBonus(payable(migrationBonusAddress));
        
        // ============================================================
        // UPDATE THIS ARRAY WITH YOUR HACKATHON PARTICIPANT ADDRESSES
        // ============================================================
        address[] memory participants = new address[](15); 
        participants[0] = 0x1ecFDe4511a27f23B8cAE67354D41a487BAfA725;
        participants[1] = 0x95Dc52EF9f9fAC83307E5597c9008829b048E7ea;
        participants[2] = 0x5b5c658E328eF106d0922D8Cc8B547e02CD67332;
        participants[3] = 0xDf2d2d587ebC7250221D81159d332eD1379728d1;
        participants[4] = 0x7b133eAe098b0F76Ca891b8D7EAE8B21615212Ce;
        participants[5] = 0x21C959ABdB7C7e088E7E171ab27d3b19411b535f;
        participants[6] = 0xa5991f5eC093075Ca80B9fb7A5588E27C42d48b8;
        participants[7] = 0x004707d7AC6381b1444E213cA9D3769421bB3785;
        participants[8] = 0x4d98Dd6C80A0923f269Bce0B8333711a6edcC9f3;
        participants[9] = 0x7DCBDEb6690B85aa430256552531A5025B2728bc;
        participants[10] = 0x445b3D3CC88f6b8ace129dd2650990b921dF5A7e;
        participants[11] = 0x2722a3fCFC795Ca781e5968aF65c26A24C9cA33b;
        participants[12] = 0x56ccC382Ef24b201E16392369C4c8f310A7E4fC5;
        participants[13] = 0xFb1244244D314d5E36e77079dCF9dd79279550fe;
        participants[14] = 0x91C65f404714Ac389b38335CccA4A876a8669d32;

        // Check current state before
        uint256 participantsBefore = migrationBonus.totalHackathonParticipants();
        console.log("\nCurrent participants:", participantsBefore);
        console.log("Adding", participants.length, "new participants...\n");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Add participants
        migrationBonus.setBatchHackathonEligibility(participants, true);
        
        vm.stopBroadcast();
        
        // Check state after
        uint256 participantsAfter = migrationBonus.totalHackathonParticipants();
        console.log("\n=== Summary ===");
        console.log("Participants before:", participantsBefore);
        console.log("Participants after:", participantsAfter);
        console.log("Added:", participantsAfter - participantsBefore);
          
        console.log("=== Contract Stats ===");
        console.log("Contract balance:", migrationBonus.getBalance() / 1e18, "KAIA");
        console.log("Bonuses remaining:", migrationBonus.getBonusesRemaining());
        console.log("Total claimed:", migrationBonus.totalClaimed());
        console.log("Is paused:", migrationBonus.paused());
    }
     

    function _parsePrivateKey(string memory privateKeyString) internal pure returns (uint256) {
        if (bytes(privateKeyString)[0] == '0' && bytes(privateKeyString)[1] == 'x') {
            return vm.parseUint(privateKeyString);
        } else {
            return vm.parseUint(string(abi.encodePacked("0x", privateKeyString)));
        }
    }

}
 