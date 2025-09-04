// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.10;

// import "forge-std/Test.sol";
// import "../src/KiloPriceOracle.sol";
// import "../src/tokens/CUsdt.sol";
 
// contract PriceOracleTest is Test {
//     KiloPriceOracle oracle; 
//     MockCToken cUsdt;
//     MockCToken cWkaia;
    
//     address usdt = makeAddr("usdt");
//     address wkaia = makeAddr("wkaia");
    
//     function setUp() public { 
//         oracle = new KiloPriceOracle(address(0));
        
//         cUsdt = new MockCToken(usdt);
//         cWkaia = new MockCToken(wkaia);
        
//         // Set up price feeds
//         oracle.setPriceFeed(usdt, oracle.USDT_USD_PRICE_ID());
//         oracle.setPriceFeed(wkaia, oracle.KAIA_USD_PRICE_ID());
//     }
    
//     function testMockMode() public {
//         // Start in mock mode
//         assertTrue(oracle.useMockPrices());
        
//         // Set mock prices
//         oracle.setMockPrice(usdt, 1e18);
//         oracle.setMockPrice(wkaia, 0.15e18);
        
//         // Test price retrieval
//         uint usdtPrice = oracle.getUnderlyingPrice((address(cUsdt)));
//         uint wkaiaPrice = oracle.getUnderlyingPrice((address(cWkaia)));
        
//         assertEq(usdtPrice, 1e18);
//         assertEq(wkaiaPrice, 0.15e18);
//     }
     
    
//     function testUnsupportedToken() public {
//         MockCToken unsupportedToken = new MockCToken(makeAddr("unsupported"));
//         oracle.toggleMockMode(false);
        
//         vm.expectRevert("Token not supported");
//         oracle.getUnderlyingPrice((address(unsupportedToken)));
//     }
    
//     function testOnlyOwnerFunctions() public {
//         address notOwner = makeAddr("notOwner");
        
//         vm.startPrank(notOwner);
        
//         vm.expectRevert();
//         oracle.setPriceFeed(makeAddr("token"), bytes32(0));
        
//         vm.expectRevert();
//         oracle.setMockPrice(makeAddr("token"), 1e18);
        
//         vm.expectRevert();
//         oracle.toggleMockMode(false);
        
//         vm.expectRevert();
//         oracle.setPyth(makeAddr("newPyth"));
        
//         vm.stopPrank();
//     }
    
//     function testOwnerCanChangeSettings() public {
//         // Test setting price feed
//         address newToken = makeAddr("newToken");
//         bytes32 newPriceId = bytes32(uint256(0x1234));
        
//         oracle.setPriceFeed(newToken, newPriceId);
//         assertEq(oracle.priceFeeds(newToken), newPriceId);
        
//         // Test setting mock price
//         oracle.setMockPrice(newToken, 2e18);
//         assertEq(oracle.mockPrices(newToken), 2e18);
        
//         // Test toggling mode
//         bool initialMode = oracle.useMockPrices();
//         oracle.toggleMockMode(!initialMode);
//         assertEq(oracle.useMockPrices(), !initialMode);
        
//         // Test changing Pyth address
//         address newPyth = makeAddr("newPyth");
//         oracle.setPyth(newPyth);
//         assertEq(address(oracle.pyth()), newPyth);
//     }
    
//     function testPriceFeedConstants() public {
//         // Verify the Pyth price feed IDs are set correctly
//         assertEq(oracle.KAIA_USD_PRICE_ID(), 0x452d40e01473f95aa9930911b4392197b3551b37ac92a049e87487b654b4ebbe);
//         assertEq(oracle.USDT_USD_PRICE_ID(), 0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b);
//     }
    
//     receive() external payable {}
// }

// contract MockCToken {
//     address public underlying;
    
//     constructor(address _underlying) {
//         underlying = _underlying;
//     }
// }