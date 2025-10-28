// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.10;

import "forge-std/Test.sol";
import "../../src/Comptroller.sol";

contract AdminTransferTest is Test {
    Comptroller public comptroller;
    
    address public admin = address(0x1);
    address public newAdmin = address(0x2);
    address public unauthorizedUser = address(0x3);
    
    function setUp() public {
        vm.startPrank(admin);
        comptroller = new Comptroller();
        vm.stopPrank();
    }
    
    function testSetPendingAdmin() public {
        vm.startPrank(admin);
        
        // Set pending admin
        uint result = comptroller._setPendingAdmin(payable(newAdmin));
        assertEq(result, 0); // NO_ERROR
        
        // Check pending admin is set
        assertEq(comptroller.pendingAdmin(), newAdmin);
        
        vm.stopPrank();
    }
    
    function testSetPendingAdminUnauthorized() public {
        vm.startPrank(unauthorizedUser);
        
        // Should fail for unauthorized user
        uint result = comptroller._setPendingAdmin(payable(newAdmin));
        assertEq(result, 1); // UNAUTHORIZED error code
        
        vm.stopPrank();
    }
    
    function testAcceptAdmin() public {
        // First set pending admin
        vm.startPrank(admin);
        comptroller._setPendingAdmin(payable(newAdmin));
        vm.stopPrank();
        
        // Then accept admin
        vm.startPrank(newAdmin);
        uint result = comptroller._acceptAdmin();
        assertEq(result, 0); // NO_ERROR
        
        // Check admin is updated
        assertEq(comptroller.admin(), newAdmin);
        assertEq(comptroller.pendingAdmin(), address(0));
        
        vm.stopPrank();
    }
    
    function testAcceptAdminUnauthorized() public {
        // First set pending admin
        vm.startPrank(admin);
        comptroller._setPendingAdmin(payable(newAdmin));
        vm.stopPrank();
        
        // Should fail for unauthorized user
        vm.startPrank(unauthorizedUser);
        uint result = comptroller._acceptAdmin();
        assertEq(result, 1); // UNAUTHORIZED error code
        
        vm.stopPrank();
    }
    
    function testAcceptAdminWithoutPending() public {
        vm.startPrank(newAdmin);
        
        // Should fail when no pending admin
        uint result = comptroller._acceptAdmin();
        assertEq(result, 1); // UNAUTHORIZED error code
        
        vm.stopPrank();
    }
    
    function testFullAdminTransfer() public {
        // Initial state
        assertEq(comptroller.admin(), admin);
        assertEq(comptroller.pendingAdmin(), address(0));
        
        // Step 1: Set pending admin
        vm.startPrank(admin);
        uint result1 = comptroller._setPendingAdmin(payable(newAdmin));
        assertEq(result1, 0);
        assertEq(comptroller.pendingAdmin(), newAdmin);
        assertEq(comptroller.admin(), admin); // Admin unchanged
        vm.stopPrank();
        
        // Step 2: Accept admin
        vm.startPrank(newAdmin);
        uint result2 = comptroller._acceptAdmin();
        assertEq(result2, 0);
        assertEq(comptroller.pendingAdmin(), address(0)); // Pending cleared
        assertEq(comptroller.admin(), newAdmin); // Admin updated
        vm.stopPrank();
        
        // Step 3: Verify old admin can no longer use admin functions
        vm.startPrank(admin);
        uint resultOldAdmin = comptroller._setPendingAdmin(payable(address(0x4)));
        assertEq(resultOldAdmin, 1); // UNAUTHORIZED error code
        vm.stopPrank();
        
        // Step 4: Verify new admin can use admin functions
        vm.startPrank(newAdmin);
        address anotherAdmin = address(0x5);
        uint resultNewAdmin = comptroller._setPendingAdmin(payable(anotherAdmin));
        assertEq(resultNewAdmin, 0);
        vm.stopPrank();
    }
}
