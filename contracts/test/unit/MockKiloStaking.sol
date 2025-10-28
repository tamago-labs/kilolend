// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.10;

import "../../src/interfaces/IKiloStaking.sol";

/**
 * @title MockKiloStaking
 * @notice Mock implementation of KILO staking for testing and early deployment
 * @dev This is a simplified version for testing. Production version should include:
 *      - Actual KILO token staking mechanics
 *      - Lock periods and vesting
 *      - Slashing protection
 *      - Emergency withdrawal
 *      - Governance integration
 */
contract MockKiloStaking is IKiloStaking {
    
    /// @notice Mapping of user addresses to their staked KILO amount
    mapping(address => uint256) public stakedBalances;
    
    /// @notice Admin address for testing
    address public admin;
    
    /// @notice KILO token address
    address public kiloToken;
    
    /**
     * @notice Tier thresholds (in KILO tokens)
     * Tier 1: 10,000 KILO
     * Tier 2: 100,000 KILO
     * Tier 3: 1,000,000 KILO
     * Tier 4: 10,000,000 KILO
     */
    uint256 public constant TIER_1_THRESHOLD = 10_000 * 1e18;
    uint256 public constant TIER_2_THRESHOLD = 100_000 * 1e18;
    uint256 public constant TIER_3_THRESHOLD = 1_000_000 * 1e18;
    uint256 public constant TIER_4_THRESHOLD = 10_000_000 * 1e18;
    
    constructor(address _kiloToken) {
        admin = msg.sender;
        kiloToken = _kiloToken;
    }
    
    /**
     * @notice Get the amount of KILO tokens a user has staked
     */
    function getStakedAmount(address user) external view override returns (uint256) {
        return stakedBalances[user];
    }
    
    /**
     * @notice Get the staking tier for a user
     * @dev Tier 0: No stake
     *      Tier 1: >= 10,000 KILO
     *      Tier 2: >= 100,000 KILO
     *      Tier 3: >= 1,000,000 KILO
     *      Tier 4: >= 10,000,000 KILO
     */
    function getStakingTier(address user) public view override returns (uint256) {
        uint256 staked = stakedBalances[user];
        
        if (staked >= TIER_4_THRESHOLD) return 4;
        if (staked >= TIER_3_THRESHOLD) return 3;
        if (staked >= TIER_2_THRESHOLD) return 2;
        if (staked >= TIER_1_THRESHOLD) return 1;
        return 0;
    }
    
    /**
     * @notice Check if a user has liquidation protection
     * @dev For this mock, anyone with Tier 1+ has protection
     */
    function hasLiquidationProtection(address user) external view override returns (bool) {
        return getStakingTier(user) >= 1;
    }
    
    /**
     * @notice Get borrow rate discount in basis points
     * @dev Discount structure:
     *      Tier 0: 0% (0 bps)
     *      Tier 1: 5% (500 bps)
     *      Tier 2: 10% (1000 bps)
     *      Tier 3: 15% (1500 bps)
     *      Tier 4: 20% (2000 bps)
     */
    function getBorrowRateDiscount(address user) external view override returns (uint256) {
        uint256 tier = getStakingTier(user);
        return tier * 500; // 500 bps per tier = 5% per tier
    }
    
    /**
     * @notice Get liquidation threshold buffer in mantissa format
     * @dev Buffer structure:
     *      Tier 0: 0% (0e16)
     *      Tier 1: 2% (2e16)
     *      Tier 2: 3% (3e16)
     *      Tier 3: 5% (5e16)
     *      Tier 4: 7% (7e16)
     */
    function getLiquidationThresholdBuffer(address user) external view override returns (uint256) {
        uint256 tier = getStakingTier(user);
        
        if (tier == 0) return 0;
        if (tier == 1) return 2e16;  // 2%
        if (tier == 2) return 3e16;  // 3%
        if (tier == 3) return 5e16;  // 5%
        if (tier == 4) return 7e16;  // 7%
        
        return 0;
    }
    
    /*** Testing Functions ***/
    
    /**
     * @notice Manually set staked balance for testing
     * @dev Admin only - for testing purposes
     */
    function setStakedBalance(address user, uint256 amount) external {
        require(msg.sender == admin, "only admin");
        stakedBalances[user] = amount;
    }
    
    /**
     * @notice Helper function to set user to specific tier for testing
     * @dev Admin only - for testing purposes
     */
    function setUserToTier(address user, uint256 tier) external {
        require(msg.sender == admin, "only admin");
        require(tier <= 4, "tier must be 0-4");
        
        if (tier == 0) stakedBalances[user] = 0;
        else if (tier == 1) stakedBalances[user] = TIER_1_THRESHOLD;
        else if (tier == 2) stakedBalances[user] = TIER_2_THRESHOLD;
        else if (tier == 3) stakedBalances[user] = TIER_3_THRESHOLD;
        else if (tier == 4) stakedBalances[user] = TIER_4_THRESHOLD;
    }
}

/**
 * DEPLOYMENT GUIDE
 * ════════════════════════════════════════════════════════════════
 * 
 * 1. Deploy MockKiloStaking:
 *    mockKiloStaking = new MockKiloStaking(kiloTokenAddress);
 * 
 * 2. Set staking contract on all cTokens:
 *    cKAIA._setKiloStaking(address(mockKiloStaking));
 *    cUSDT._setKiloStaking(address(mockKiloStaking));
 *    // ... repeat for all cTokens
 * 
 * 3. Set staking contract on Comptroller:
 *    comptroller._setKiloStaking(address(mockKiloStaking));
 * 
 * 4. Enable KILO utility features:
 *    comptroller._setKiloUtilityEnabled(true);
 * 
 * 5. Test by setting user tiers:
 *    mockKiloStaking.setUserToTier(testUser, 2); // Set to Tier 2
 * 
 * TESTING SCENARIOS
 * ════════════════════════════════════════════════════════════════
 * 
 * Test 1: Borrow Rate Discount
 * - Set user to Tier 2 (10% discount)
 * - User borrows 1000 USDT
 * - Verify interest rate is 10% lower than standard rate
 * 
 * Test 2: Liquidation Threshold Buffer
 * - Set user to Tier 1 (2% buffer)
 * - Create position with 1% shortfall
 * - Verify liquidation is rejected
 * - Increase shortfall to 2.1%
 * - Verify liquidation is now allowed
 * 
 * Test 3: Feature Disable
 * - Disable KILO utility: comptroller._setKiloUtilityEnabled(false)
 * - Verify discounts and buffers return to 0
 * - Re-enable and verify features work again
 */
