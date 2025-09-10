// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "forge-std/Test.sol";
import "../../src/mocks/MockToken.sol";

contract MockTokenTest is Test {
    MockToken public usdt;
    MockToken public krw;
    MockToken public jpy;
    MockToken public thb;
    MockToken public stKAIA;
    MockToken public wKAIA;
    
    address public deployer;
    address public user1;
    address public user2;
    
    function setUp() public {
        deployer = address(this);
        user1 = address(0x1);
        user2 = address(0x2);
        
        // Deploy mock tokens with same parameters as deployment script
        usdt = new MockToken("Tether USD", "USDT", 6, 1000000e6);
        krw = new MockToken("Korean Won", "KRW", 0, 1000000000);
        jpy = new MockToken("Japanese Yen", "JPY", 0, 1000000000);
        thb = new MockToken("Thai Baht", "THB", 2, 1000000e2);
        stKAIA = new MockToken("Staked KAIA", "stKAIA", 18, 1000000e18);
        wKAIA = new MockToken("Wrapped KAIA", "wKAIA", 18, 1000000e18);
    }
    
    function testTokenDeployment() view public {
        // Test USDT
        assertEq(usdt.name(), "Tether USD");
        assertEq(usdt.symbol(), "USDT");
        assertEq(usdt.decimals(), 6);
        assertEq(usdt.totalSupply(), 1000000e6);
        assertEq(usdt.balanceOf(deployer), 1000000e6);
        
        // Test KRW
        assertEq(krw.name(), "Korean Won");
        assertEq(krw.symbol(), "KRW");
        assertEq(krw.decimals(), 0);
        assertEq(krw.totalSupply(), 1000000000);
        
        // Test JPY
        assertEq(jpy.decimals(), 0);
        assertEq(jpy.totalSupply(), 1000000000);
        
        // Test THB
        assertEq(thb.decimals(), 2);
        assertEq(thb.totalSupply(), 1000000e2);
        
        // Test stKAIA
        assertEq(stKAIA.decimals(), 18);
        assertEq(stKAIA.totalSupply(), 1000000e18);
        
        // Test wKAIA
        assertEq(wKAIA.decimals(), 18);
        assertEq(wKAIA.totalSupply(), 1000000e18);
    }
    
    function testMinting() public {
        uint256 mintAmount = 1000e6; // 1000 USDT
        
        // Test minting to user1
        usdt.mint(user1, mintAmount);
        assertEq(usdt.balanceOf(user1), mintAmount);
        
        // Test total supply increased
        assertEq(usdt.totalSupply(), 1000000e6 + mintAmount);
    }
    
    function testTransfers() public {
        uint256 transferAmount = 100e6; // 100 USDT
        
        // Transfer from deployer to user1
        usdt.transfer(user1, transferAmount);
        assertEq(usdt.balanceOf(user1), transferAmount);
        assertEq(usdt.balanceOf(deployer), 1000000e6 - transferAmount);
        
        // Test approve and transferFrom
        vm.prank(user1);
        usdt.approve(user2, transferAmount);
        
        vm.prank(user2);
        usdt.transferFrom(user1, user2, transferAmount);
        
        assertEq(usdt.balanceOf(user2), transferAmount);
        assertEq(usdt.balanceOf(user1), 0);
    }
    
    function testAllTokensMinting() public {
        // Test minting different amounts for each token type
        usdt.mint(user1, 1000e6); // 1000 USDT
        krw.mint(user1, 1000000); // 1M KRW
        jpy.mint(user1, 100000); // 100K JPY
        thb.mint(user1, 1000e2); // 1000 THB
        stKAIA.mint(user1, 100e18); // 100 stKAIA
        wKAIA.mint(user1, 50e18); // 50 wKAIA
        
        assertEq(usdt.balanceOf(user1), 1000e6);
        assertEq(krw.balanceOf(user1), 1000000);
        assertEq(jpy.balanceOf(user1), 100000);
        assertEq(thb.balanceOf(user1), 1000e2);
        assertEq(stKAIA.balanceOf(user1), 100e18);
        assertEq(wKAIA.balanceOf(user1), 50e18);
    }
     
}
