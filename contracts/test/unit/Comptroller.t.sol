// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.10;

import "forge-std/Test.sol";
import "../../src/Comptroller.sol";
import "../../src/KiloPriceOracle.sol";
import "../../src/tokens/CErc20Immutable.sol";
import "../../src/interest-rates/JumpRateModelV2.sol";
import "../../src/mocks/MockToken.sol";

contract ComptrollerTest is Test {

    Comptroller public comptroller;
    KiloPriceOracle public oracle;
    CErc20Immutable public cToken;
    MockToken public usdt;
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
        
        // Deploy interest rate model (5% base, 15% slope, 300% jump, 80% kink)
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
            8, // use 8 decimals for cToken
            payable(admin)
        );
        
        // Set oracle price (1 USDT = $1)
        oracle.setDirectPrice(address(usdt), 1e18);
        
        // Set comptroller configurations
        comptroller._setPriceOracle(PriceOracle(address(oracle)));
        comptroller._supportMarket(CToken(address(cToken)));
        comptroller._setCloseFactor(5e17); // 50%
        comptroller._setLiquidationIncentive(108e16); // 8% incentive
        comptroller._setCollateralFactor(CToken(address(cToken)), 75e16); // 75% collateral factor
        
        vm.stopPrank();
        
        // Give users some USDT 
        usdt.mint(user1, 10000e6); // 10k USDT 
        usdt.mint(user2, 5000e6); // 5k USDT
    }
    
    function testInitialSetup() public {
        assertEq(comptroller.admin(), admin);
        assertEq(address(comptroller.oracle()), address(oracle));
        assertTrue(comptroller.checkMembership(user1, CToken(address(cToken))) == false);
        
        // Check oracle price
        assertEq(oracle.getUnderlyingPrice(CToken(address(cToken))), 1e30);
        
        // Check market is listed
        (bool isListed,) = comptroller.markets(address(cToken));
        assertTrue(isListed);
    }
    
    function testEnterMarkets() public {
        address[] memory markets = new address[](1);
        markets[0] = address(cToken);
        
        vm.prank(user1);
        uint[] memory results = comptroller.enterMarkets(markets);
        
        assertEq(results[0], 0); // Success
        assertTrue(comptroller.checkMembership(user1, CToken(address(cToken))));
    }
    
    function testExitMarket() public {
        // First enter the market
        address[] memory markets = new address[](1);
        markets[0] = address(cToken);
        
        vm.prank(user1);
        comptroller.enterMarkets(markets);
        assertTrue(comptroller.checkMembership(user1, CToken(address(cToken))));
        
        // Exit the market
        vm.prank(user1);
        uint result = comptroller.exitMarket(address(cToken));
        
        assertEq(result, 0); // Success
        assertFalse(comptroller.checkMembership(user1, CToken(address(cToken))));
    }
    
    function testMintAllowed() public {
        vm.prank(address(cToken));
        uint result = comptroller.mintAllowed(address(cToken), user1, 1000e6);
        assertEq(result, 0); // Success
    }
    
    function testMintAllowedNotListed() public {
        CErc20Immutable unlisted = new CErc20Immutable(
            address(usdt),
            ComptrollerInterface(address(comptroller)),
            InterestRateModel(address(interestRateModel)),
            INITIAL_EXCHANGE_RATE,
            "Unlisted",
            "UL",
            8,
            payable(admin)
        );
        
        vm.prank(address(unlisted));
        uint result = comptroller.mintAllowed(address(unlisted), user1, 1000e6);
        assertEq(result, uint(ComptrollerErrorReporter.Error.MARKET_NOT_LISTED));
    }
    
    function testBorrowAllowed() public {
        // First enter market and mint some collateral
        vm.startPrank(user1);
        usdt.approve(address(cToken), 1000e6);
        address[] memory markets = new address[](1);
        markets[0] = address(cToken);
        comptroller.enterMarkets(markets);
        cToken.mint(1000e6);
        vm.stopPrank();
        
        // Test borrow allowed
        vm.prank(address(cToken));
        uint result = comptroller.borrowAllowed(address(cToken), user1, 500e6);
        assertEq(result, 0); // Success
    }
    
    function testLiquidationIncentive() public {
        assertEq(comptroller.liquidationIncentiveMantissa(), 108e16);
        
        vm.prank(admin);
        comptroller._setLiquidationIncentive(110e16);
        assertEq(comptroller.liquidationIncentiveMantissa(), 110e16);
    }
    
    function testCloseFactor() public {
        assertEq(comptroller.closeFactorMantissa(), 5e17);
        
        vm.prank(admin);
        comptroller._setCloseFactor(6e17);
        assertEq(comptroller.closeFactorMantissa(), 6e17);
    }
    
    function testCollateralFactor() public {
        (bool isListed, uint collateralFactorMantissa) = comptroller.markets(address(cToken));
        assertTrue(isListed);
        assertEq(collateralFactorMantissa, 75e16);
        
        vm.prank(admin);
        comptroller._setCollateralFactor(CToken(address(cToken)), 80e16);
        
        (, collateralFactorMantissa) = comptroller.markets(address(cToken));
        assertEq(collateralFactorMantissa, 80e16);
    }
    
    function testPauseGuardian() public {
        address newGuardian = address(0x999);
        
        vm.prank(admin);
        comptroller._setPauseGuardian(newGuardian);
        
        assertEq(comptroller.pauseGuardian(), newGuardian);
    }
    
    function testMintPaused() public {
        // Set pause guardian
        address guardian = address(0x999);
        vm.prank(admin);
        comptroller._setPauseGuardian(guardian);
        
        // Pause minting
        vm.prank(guardian);
        comptroller._setMintPaused(CToken(address(cToken)), true);
        
        assertTrue(comptroller.mintGuardianPaused(address(cToken)));
        
        // Try to mint (should fail)
        vm.prank(address(cToken));
        vm.expectRevert("mint is paused");
        comptroller.mintAllowed(address(cToken), user1, 1000e6);
    }
    
    function testBorrowCaps() public {
        CToken[] memory cTokens = new CToken[](1);
        cTokens[0] = CToken(address(cToken));
        uint[] memory borrowCaps = new uint[](1);
        borrowCaps[0] = 1000000e6; // 1M USDT cap
        
        vm.prank(admin);
        comptroller._setMarketBorrowCaps(cTokens, borrowCaps);
        
        assertEq(comptroller.borrowCaps(address(cToken)), 1000000e6);
    }
    
    function testAccountLiquidity() public {
        // User enters market and mints
        vm.startPrank(user1);
        usdt.approve(address(cToken), 1000e6);
        address[] memory markets = new address[](1);
        markets[0] = address(cToken);
        comptroller.enterMarkets(markets);
        cToken.mint(1000e6);
        vm.stopPrank();
        
        // Check account liquidity
        (uint error, uint liquidity, uint shortfall) = comptroller.getAccountLiquidity(user1);
        
        assertEq(error, 0);
        assertGt(liquidity, 0); // Should have some liquidity
        assertEq(shortfall, 0); // Should have no shortfall
    }
}
