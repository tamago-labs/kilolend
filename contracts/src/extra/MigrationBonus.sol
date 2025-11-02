// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

// ============ Interfaces ============

interface IComptroller {
        function getAssetsIn(address account) external view returns (address[] memory);
}

/**
 * @title MigrationBonus
 * @notice Distributes 100 KAIA bonus to eligible KiloLend V1 users
 * @dev Checks both hackathon participation and V1 Comptroller activity
 */
contract MigrationBonus {
     
    
    
    // ============ State Variables ============
    
    /// @notice V1 Comptroller address for checking user activity
    address public immutable v1Comptroller;
    
    /// @notice Bonus amount per eligible user
    uint256 public constant BONUS_AMOUNT = 100 ether;
    
    /// @notice Contract admin
    address public admin;
    
    /// @notice Tracks hackathon eligibility
    mapping(address => bool) public hackathonEligible;
    
    /// @notice Tracks V1 eligibility (for manual overrides if needed)
    mapping(address => bool) public v1EligibilityOverride;
    
    /// @notice Tracks whether a user has claimed their bonus
    mapping(address => bool) public hasClaimed;
    
    /// @notice Total number of hackathon participants
    uint256 public totalHackathonParticipants;
    
    /// @notice Total number of bonuses claimed
    uint256 public totalClaimed;
    
    /// @notice Whether the contract is paused
    bool public paused;
    
    // ============ Events ============
    
    event HackathonEligibilitySet(address indexed user, bool eligible);
    event V1EligibilitySet(address indexed user, bool eligible);
    event BonusClaimed(address indexed user, uint256 amount);
    event ContractPaused(bool paused);
    event AdminUpdated(address indexed oldAdmin, address indexed newAdmin);
    event FundsDeposited(address indexed from, uint256 amount);
    event FundsWithdrawn(address indexed to, uint256 amount);
    
    // ============ Errors ============
    
    error NotAdmin();
    error NotEligible();
    error AlreadyClaimed();
    error InsufficientBalance();
    error TransferFailed();
    error ContractIsPaused();
    error InvalidAddress();
    error InvalidAmount();
    
    // ============ Modifiers ============
    
    modifier onlyAdmin() {
        if (msg.sender != admin) revert NotAdmin();
        _;
    }
    
    modifier whenNotPaused() {
        if (paused) revert ContractIsPaused();
        _;
    }
    
    // ============ Constructor ============
    
    constructor(address _v1Comptroller) {
        if (_v1Comptroller == address(0)) revert InvalidAddress();
        v1Comptroller = _v1Comptroller;
        admin = msg.sender;
    }
    
    // ============ External Functions ============
    
    /**
     * @notice Check if user is eligible for hackathon bonus
     * @param user Address to check
     * @return bool indicating hackathon eligibility
     */
    function isHackathonEligible(address user) external view returns (bool) {
        return hackathonEligible[user];
    }
    
    /**
     * @notice Check if user has V1 activity (supplied or borrowed)
     * @param user Address to check
     * @return bool indicating V1 activity
     */
    function isV1Eligible(address user) public view returns (bool) {
        // Check manual override first
        if (v1EligibilityOverride[user]) {
            return true;
        }
        
        // Check if user has entered any markets in V1 Comptroller
        try IComptroller(v1Comptroller).getAssetsIn(user) returns (address[] memory assets) {
            return assets.length > 0;
        } catch {
            return false;
        }
    }
    
    /**
     * @notice Get bonus status for a user
     * @param user Address to check
     * @return eligible Whether user is eligible
     * @return claimed Whether user has claimed
     * @return amount Bonus amount
     */
    function getBonusStatus(address user) external view returns (
        bool eligible,
        bool claimed,
        uint256 amount
    ) {
        eligible = hackathonEligible[user] && isV1Eligible(user) && !hasClaimed[user];
        claimed = hasClaimed[user];
        amount = BONUS_AMOUNT;
    }
    
    /**
     * @notice Claim bonus for eligible user
     */
    function claimBonus() external whenNotPaused {
        address user = msg.sender;
        
        // Check eligibility
        if (!hackathonEligible[user]) revert NotEligible();
        if (!isV1Eligible(user)) revert NotEligible();
        if (hasClaimed[user]) revert AlreadyClaimed();
        if (address(this).balance < BONUS_AMOUNT) revert InsufficientBalance();
        
        // Mark as claimed
        hasClaimed[user] = true;
        totalClaimed++;
        
        // Transfer KAIA bonus
        (bool success, ) = user.call{value: BONUS_AMOUNT}("");
        if (!success) revert TransferFailed();
        
        emit BonusClaimed(user, BONUS_AMOUNT);
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Set hackathon eligibility for a single user
     * @param user Address of the user
     */
    function setHackathonEligibility(address user) external onlyAdmin {
        if (user == address(0)) revert InvalidAddress();
        
        if (!hackathonEligible[user]) {
            hackathonEligible[user] = true;
            totalHackathonParticipants++;
            emit HackathonEligibilitySet(user, true);
        }
    }
    
    /**
     * @notice Set hackathon eligibility for multiple users
     * @param users Array of user addresses
     * @param eligible Whether to set as eligible or remove eligibility
     */
    function setBatchHackathonEligibility(address[] calldata users, bool eligible) external onlyAdmin {
        for (uint256 i = 0; i < users.length; i++) {
            address user = users[i];
            if (user != address(0) && hackathonEligible[user] != eligible) {
                hackathonEligible[user] = eligible;
                
                if (eligible) {
                    totalHackathonParticipants++;
                } else {
                    totalHackathonParticipants--;
                }
                
                emit HackathonEligibilitySet(user, eligible);
            }
        }
    }
    
    /**
     * @notice Set V1 eligibility override for a user (manual override)
     * @param user Address of the user
     */
    function setV1Eligibility(address user) external onlyAdmin {
        if (user == address(0)) revert InvalidAddress();
        v1EligibilityOverride[user] = true;
        emit V1EligibilitySet(user, true);
    }
    
    /**
     * @notice Pause the contract
     */
    function pause() external onlyAdmin {
        paused = true;
        emit ContractPaused(true);
    }
    
    /**
     * @notice Unpause the contract
     */
    function unpause() external onlyAdmin {
        paused = false;
        emit ContractPaused(false);
    }
    
    /**
     * @notice Update admin address
     * @param newAdmin New admin address
     */
    function setAdmin(address newAdmin) external onlyAdmin {
        if (newAdmin == address(0)) revert InvalidAddress();
        address oldAdmin = admin;
        admin = newAdmin;
        emit AdminUpdated(oldAdmin, newAdmin);
    }
    
    /**
     * @notice Withdraw KAIA from the contract
     * @param amount Amount to withdraw
     */
    function withdrawKAIA(uint256 amount) external onlyAdmin {
        if (amount == 0) revert InvalidAmount();
        if (address(this).balance < amount) revert InsufficientBalance();
        
        (bool success, ) = admin.call{value: amount}("");
        if (!success) revert TransferFailed();
        
        emit FundsWithdrawn(admin, amount);
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get contract balance
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @notice Get estimated bonuses remaining
     */
    function getBonusesRemaining() external view returns (uint256) {
        return address(this).balance / BONUS_AMOUNT;
    }
    
    /**
     * @notice Get total bonuses distributed
     */
    function getTotalBonusesDistributed() external view returns (uint256) {
        return totalClaimed * BONUS_AMOUNT;
    }
    
    // ============ Receive Function ============
    
    receive() external payable {
        emit FundsDeposited(msg.sender, msg.value);
    }
}
