// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.10;

import "forge-std/Test.sol";
import "../../src/tokens/CErc20Immutable.sol";
import "../../src/Comptroller.sol";
import "../../src/KiloPriceOracle.sol";
import "../../src/interest-rates/JumpRateModelV2.sol";
import "../../src/mocks/MockToken.sol";

contract CTokenTest is Test {

    CErc20Immutable public cToken;
    MockToken public usdt;
    Comptroller public comptroller;
    KiloPriceOracle public oracle;
    JumpRateModelV2 public interestRateModel;
    
    address public admin = address(0x1);
    address public user1 = address(0x2);
    address public user2 = address(0x3);
    
    uint256 public constant INITIAL_EXCHANGE_RATE = 2e17; // 0.2 * 1e18
    uint256 public constant INITIAL_USDT_SUPPLY = 1000000; // 1M USDT
    
    function setUp() public {
        vm.startPrank(admin);
        
        // Deploy contracts
        comptroller = new Comptroller();
        oracle = new KiloPriceOracle();
        usdt = new MockToken("Tether USD", "USDT", 6, INITIAL_USDT_SUPPLY);
        
        // Deploy interest rate model
        interestRateModel = new JumpRateModelV2(
            5e16,   // 5% base rate
            15e16,  // 15% multiplier
            300e16, // 300% jump multiplier
            8e17,   // 80% kink
            admin
        );
        
        // Deploy cToken
        cToken = new CErc20Immutable(
            address(usdt),
            ComptrollerInterface(address(comptroller)),
            InterestRateModel(address(interestRateModel)),
            INITIAL_EXCHANGE_RATE,
            "Test cUSDT",
            "tcUSDT",
            8,
            payable(admin)
        );
        
        // Set oracle and support market
        oracle.setDirectPrice(address(usdt), 1e18);
        comptroller._setPriceOracle(PriceOracle(address(oracle)));
        comptroller._supportMarket(CToken(address(cToken)));
        comptroller._setCollateralFactor(CToken(address(cToken)), 75e16);
        
        vm.stopPrank();
        
        // Give users USDT 
        usdt.mint(user1, 10000e6); 
        usdt.mint(user2, 5000e6);
    }
    
    function testInitialState() public {
        assertEq(cToken.name(), "Test cUSDT");
        assertEq(cToken.symbol(), "tcUSDT");
        assertEq(cToken.decimals(), 8);
        assertEq(cToken.admin(), admin);
        assertEq(address(cToken.comptroller()), address(comptroller));
        assertEq(address(cToken.interestRateModel()), address(interestRateModel));
        assertEq(cToken.totalSupply(), 0);
        assertTrue(cToken.isCToken());
    }
    
    function testMint() public {
        uint256 mintAmount = 1000e6; // 1000 USDT
        
        vm.startPrank(user1);
        usdt.approve(address(cToken), mintAmount);
        
        uint256 balanceBefore = usdt.balanceOf(user1);
        uint256 cTokenBalanceBefore = cToken.balanceOf(user1);
        
        uint256 result = cToken.mint(mintAmount);
        
        assertEq(result, 0); // Success
        assertEq(usdt.balanceOf(user1), balanceBefore - mintAmount);
        assertGt(cToken.balanceOf(user1), cTokenBalanceBefore);
        assertEq(cToken.totalSupply(), cToken.balanceOf(user1));
        
        vm.stopPrank();
    }
    
    function testMintWithZeroAmount() public {
        vm.startPrank(user1);
        usdt.approve(address(cToken), 0);
        
        uint256 result = cToken.mint(0);
        assertEq(result, 0); // Should succeed with 0 amount
        assertEq(cToken.balanceOf(user1), 0);
        
        vm.stopPrank();
    }
    
    function testRedeem() public {
        uint256 mintAmount = 1000e6;
        
        // First mint some cTokens
        vm.startPrank(user1);
        usdt.approve(address(cToken), mintAmount);
        cToken.mint(mintAmount);
        
        uint256 cTokenBalance = cToken.balanceOf(user1);
        uint256 redeemTokens = cTokenBalance / 2; // Redeem half
        
        uint256 usdtBalanceBefore = usdt.balanceOf(user1);
        
        uint256 result = cToken.redeem(redeemTokens);
        
        assertEq(result, 0); // Success
        assertGt(usdt.balanceOf(user1), usdtBalanceBefore);
        assertEq(cToken.balanceOf(user1), cTokenBalance - redeemTokens);
        
        vm.stopPrank();
    }
    
    function testRedeemUnderlying() public {
        uint256 mintAmount = 1000e6;
        uint256 redeemAmount = 500e6; // Redeem 500 USDT worth
        
        // First mint some cTokens
        vm.startPrank(user1);
        usdt.approve(address(cToken), mintAmount);
        cToken.mint(mintAmount);
        
        uint256 usdtBalanceBefore = usdt.balanceOf(user1);
        uint256 cTokenBalanceBefore = cToken.balanceOf(user1);
        
        uint256 result = cToken.redeemUnderlying(redeemAmount);
        
        assertEq(result, 0); // Success
        assertEq(usdt.balanceOf(user1), usdtBalanceBefore + redeemAmount);
        assertLt(cToken.balanceOf(user1), cTokenBalanceBefore);
        
        vm.stopPrank();
    }
    
    function testBorrow() public {
        uint256 mintAmount = 1000e6;
        uint256 borrowAmount = 400e6; // Borrow 400 USDT (within collateral limit)
        
        vm.startPrank(user1);
        // Enter market and mint collateral
        address[] memory markets = new address[](1);
        markets[0] = address(cToken);
        comptroller.enterMarkets(markets);
        
        usdt.approve(address(cToken), mintAmount);
        cToken.mint(mintAmount);
        
        uint256 usdtBalanceBefore = usdt.balanceOf(user1);
        
        uint256 result = cToken.borrow(borrowAmount);
        
        assertEq(result, 0); // Success
        assertEq(usdt.balanceOf(user1), usdtBalanceBefore + borrowAmount);
        assertEq(cToken.borrowBalanceCurrent(user1), borrowAmount);
        
        vm.stopPrank();
    }
    
    function testRepayBorrow() public {
        uint256 mintAmount = 1000e6;
        uint256 borrowAmount = 400e6;
        uint256 repayAmount = 200e6;
        
        vm.startPrank(user1);
        // Setup: mint collateral and borrow
        address[] memory markets = new address[](1);
        markets[0] = address(cToken);
        comptroller.enterMarkets(markets);
        
        usdt.approve(address(cToken), mintAmount + repayAmount);
        cToken.mint(mintAmount);
        cToken.borrow(borrowAmount);
        
        uint256 borrowBalanceBefore = cToken.borrowBalanceCurrent(user1);
        
        uint256 result = cToken.repayBorrow(repayAmount);
        
        assertEq(result, 0); // Success
        assertLt(cToken.borrowBalanceCurrent(user1), borrowBalanceBefore);
        
        vm.stopPrank();
    }
    
    function testRepayBorrowBehalf() public {
        uint256 mintAmount = 1000e6;
        uint256 borrowAmount = 400e6;
        uint256 repayAmount = 200e6;
        
        // User1 mints and borrows
        vm.startPrank(user1);
        address[] memory markets = new address[](1);
        markets[0] = address(cToken);
        comptroller.enterMarkets(markets);
        
        usdt.approve(address(cToken), mintAmount);
        cToken.mint(mintAmount);
        cToken.borrow(borrowAmount);
        vm.stopPrank();
        
        // User2 repays on behalf of user1
        vm.startPrank(user2);
        usdt.approve(address(cToken), repayAmount);
        
        uint256 borrowBalanceBefore = cToken.borrowBalanceCurrent(user1);
        
        uint256 result = cToken.repayBorrowBehalf(user1, repayAmount);
        
        assertEq(result, 0); // Success
        assertLt(cToken.borrowBalanceCurrent(user1), borrowBalanceBefore);
        
        vm.stopPrank();
    }
    
    function testTransfer() public {
        uint256 mintAmount = 1000e6;
        
        // User1 mints cTokens
        vm.startPrank(user1);
        usdt.approve(address(cToken), mintAmount);
        cToken.mint(mintAmount);
        
        uint256 transferAmount = cToken.balanceOf(user1) / 2;
        
        bool success = cToken.transfer(user2, transferAmount);
        
        assertTrue(success);
        assertEq(cToken.balanceOf(user2), transferAmount);
        assertEq(cToken.balanceOf(user1), cToken.totalSupply() - transferAmount);
        
        vm.stopPrank();
    }
    
    function testApproveAndTransferFrom() public {
        uint256 mintAmount = 1000e6;
        
        // User1 mints cTokens
        vm.startPrank(user1);
        usdt.approve(address(cToken), mintAmount);
        cToken.mint(mintAmount);
        
        uint256 transferAmount = cToken.balanceOf(user1) / 2;
        
        // Approve user2 to transfer
        bool approveSuccess = cToken.approve(user2, transferAmount);
        assertTrue(approveSuccess);
        assertEq(cToken.allowance(user1, user2), transferAmount);
        
        vm.stopPrank();
        
        // User2 transfers from user1
        vm.prank(user2);
        bool transferSuccess = cToken.transferFrom(user1, user2, transferAmount);
        
        assertTrue(transferSuccess);
        assertEq(cToken.balanceOf(user2), transferAmount);
        assertEq(cToken.allowance(user1, user2), 0);
    }
    
    function testExchangeRate() public {
        uint256 mintAmount = 1000e6;
        
        // Initially should be close to initial exchange rate
        uint256 exchangeRateInitial = cToken.exchangeRateStored();
        assertApproxEqAbs(exchangeRateInitial, INITIAL_EXCHANGE_RATE, 1e15);
        
        // After minting, exchange rate should remain similar
        vm.startPrank(user1);
        usdt.approve(address(cToken), mintAmount);
        cToken.mint(mintAmount);
        
        uint256 exchangeRateAfterMint = cToken.exchangeRateStored();
        assertApproxEqAbs(exchangeRateAfterMint, INITIAL_EXCHANGE_RATE, 1e15);
        
        vm.stopPrank();
    }
    
    function testAccrueInterest() public {
        uint256 mintAmount = 1000e6;
        uint256 borrowAmount = 400e6;
        
        // Setup borrowing to accrue interest
        vm.startPrank(user1);
        address[] memory markets = new address[](1);
        markets[0] = address(cToken);
        comptroller.enterMarkets(markets);
        
        usdt.approve(address(cToken), mintAmount);
        cToken.mint(mintAmount);
        cToken.borrow(borrowAmount);
        vm.stopPrank();
        
        uint256 borrowBalanceBefore = cToken.borrowBalanceStored(user1);
         
        uint initialBlock = block.number;
        
        // Simulate blocks passing
        vm.roll(initialBlock + 100);
        
        uint256 result = cToken.accrueInterest();
        assertEq(result, 0); // Success
        
        uint256 borrowBalanceAfter = cToken.borrowBalanceCurrent(user1);
        assertGt(borrowBalanceAfter, borrowBalanceBefore); // Interest should have accrued
    }
    
    function testGetAccountSnapshot() public {
        uint256 mintAmount = 1000e6;
        uint256 borrowAmount = 400e6;
        
        vm.startPrank(user1);
        address[] memory markets = new address[](1);
        markets[0] = address(cToken);
        comptroller.enterMarkets(markets);
        
        usdt.approve(address(cToken), mintAmount);
        cToken.mint(mintAmount);
        cToken.borrow(borrowAmount);
        
        (uint error, uint cTokenBalance, uint borrowBalance, uint exchangeRate) = cToken.getAccountSnapshot(user1);
        
        assertEq(error, 0);
        assertGt(cTokenBalance, 0);
        assertEq(borrowBalance, borrowAmount);
        assertGt(exchangeRate, 0);
        
        vm.stopPrank();
    }
}
