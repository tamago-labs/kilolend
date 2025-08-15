// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {MockToken} from "../src/MockToken.sol";

contract MockTokenTest is Test {
    MockToken public mockToken;
    
    address public owner;
    address public user1;
    address public user2;
    
    string constant TOKEN_NAME = "Mock Token";
    string constant TOKEN_SYMBOL = "MOCK";
    uint8 constant DECIMALS = 18;
    uint256 constant INITIAL_SUPPLY = 1000000 * 10**DECIMALS; // 1M tokens

    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        
        mockToken = new MockToken(
            TOKEN_NAME,
            TOKEN_SYMBOL,
            DECIMALS,
            INITIAL_SUPPLY
        );
    }

    function test_InitialSetup() public {
        assertEq(mockToken.name(), TOKEN_NAME);
        assertEq(mockToken.symbol(), TOKEN_SYMBOL);
        assertEq(mockToken.decimals(), DECIMALS);
        assertEq(mockToken.totalSupply(), INITIAL_SUPPLY);
        assertEq(mockToken.balanceOf(owner), INITIAL_SUPPLY);
    }

    function test_Mint() public {
        uint256 mintAmount = 1000 * 10**DECIMALS;
        uint256 initialBalance = mockToken.balanceOf(user1);
        uint256 initialTotalSupply = mockToken.totalSupply();
        
        mockToken.mint(user1, mintAmount);
        
        assertEq(mockToken.balanceOf(user1), initialBalance + mintAmount);
        assertEq(mockToken.totalSupply(), initialTotalSupply + mintAmount);
    }

    function test_MintToZeroAddress() public {
        uint256 mintAmount = 1000 * 10**DECIMALS;
        
        vm.expectRevert();
        mockToken.mint(address(0), mintAmount);
    }

    function test_Transfer() public {
        uint256 transferAmount = 500 * 10**DECIMALS;
        
        mockToken.transfer(user1, transferAmount);
        
        assertEq(mockToken.balanceOf(owner), INITIAL_SUPPLY - transferAmount);
        assertEq(mockToken.balanceOf(user1), transferAmount);
    }

    function test_TransferFrom() public {
        uint256 transferAmount = 300 * 10**DECIMALS;
        
        // Owner approves user1 to spend tokens
        mockToken.approve(user1, transferAmount);
        
        // user1 transfers from owner to user2
        vm.prank(user1);
        mockToken.transferFrom(owner, user2, transferAmount);
        
        assertEq(mockToken.balanceOf(owner), INITIAL_SUPPLY - transferAmount);
        assertEq(mockToken.balanceOf(user2), transferAmount);
        assertEq(mockToken.allowance(owner, user1), 0);
    }

    function test_Approve() public {
        uint256 approveAmount = 1000 * 10**DECIMALS;
        
        mockToken.approve(user1, approveAmount);
        
        assertEq(mockToken.allowance(owner, user1), approveAmount);
    }

    function testFuzz_Mint(address to, uint256 amount) public {
        vm.assume(to != address(0));
        vm.assume(amount < type(uint256).max - mockToken.totalSupply());
        
        uint256 initialBalance = mockToken.balanceOf(to);
        uint256 initialTotalSupply = mockToken.totalSupply();
        
        mockToken.mint(to, amount);
        
        assertEq(mockToken.balanceOf(to), initialBalance + amount);
        assertEq(mockToken.totalSupply(), initialTotalSupply + amount);
    }

    function testFuzz_Transfer(uint256 amount) public {
        vm.assume(amount <= INITIAL_SUPPLY);
        
        uint256 initialOwnerBalance = mockToken.balanceOf(owner);
        uint256 initialUser1Balance = mockToken.balanceOf(user1);
        
        mockToken.transfer(user1, amount);
        
        assertEq(mockToken.balanceOf(owner), initialOwnerBalance - amount);
        assertEq(mockToken.balanceOf(user1), initialUser1Balance + amount);
    }

    function test_TransferInsufficientBalance() public {
        uint256 transferAmount = INITIAL_SUPPLY + 1;
        
        vm.expectRevert();
        mockToken.transfer(user1, transferAmount);
    }

    function test_TransferFromInsufficientAllowance() public {
        uint256 transferAmount = 1000 * 10**DECIMALS;
        uint256 approveAmount = 500 * 10**DECIMALS;
        
        mockToken.approve(user1, approveAmount);
        
        vm.prank(user1);
        vm.expectRevert();
        mockToken.transferFrom(owner, user2, transferAmount);
    }
}