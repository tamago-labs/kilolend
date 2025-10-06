// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@kaiachain/contracts/KIP/token/KIP7/KIP7.sol";
import "@kaiachain/contracts/access/Ownable.sol";
import "@kaiachain/contracts/security/ReentrancyGuard.sol";
import "@kaiachain/contracts/KIP/token/KIP7/IKIP7.sol";

/**
 * @title KiloVault
 * @notice Vault with lock periods, deposit tracking, and deposit caps.
 * @dev 
 *  - Extends core ERC4626 concepts (shares/assets, deposits, withdrawals)
 *    while adding custom mechanics for:
 *      • Time-locked deposits (15 days) for bot-flow
 *      • Early withdrawal penalties
 *      • Bot can withdraw funds to manage externally
 *      • Deposit caps per user and per vault
 *      • Admin/Bot can extend lock periods for special cases
 *  - Custom deposit/withdraw flow (via request queue) replaces standard ERC4626 `withdraw/redeem`.
 *  - Shares represent proportional ownership of `totalManagedAssets`.
 *  - `sharePrice()` returns the current exchange rate between shares and assets.
 */

contract KiloVault is KIP7, Ownable, ReentrancyGuard {

    // ========================================================================
    // CONSTANTS
    // ========================================================================
    
    /// @notice Blocks per year (Kaia: 1 second block time)
    uint256 public constant BLOCKS_PER_YEAR = 31_536_000;
    
    /// @notice Base precision
    uint256 public constant BASE = 1e18;
    
    /// @notice Default lock duration for bot deposits (15 days)
    uint256 public constant BOT_LOCK_DURATION = 15 days;

    // ========================================================================
    // STRUCTS
    // ========================================================================
    
    struct DepositInfo {
        uint256 shares;
        uint256 assets;
        uint256 unlockBlock;
        uint256 lockDuration;
        bool isLockedDeposit;
        address beneficiary;
        bool isBotDeposit;
        uint256 depositBlock;
        uint256 lastExtendedBlock;  // Track when lock was last extended
    }
    
    struct WithdrawalRequest {
        address user;
        uint256 depositIndex;
        uint256 shares;
        uint256 assets;
        uint256 timestamp;
        bool processed;
        bool claimed;
    }

    // ========================================================================
    // STATE VARIABLES
    // ========================================================================
    
    address public immutable asset;
    uint8 public immutable assetDecimals;
    bool public immutable isNative;

    uint256 public totalManagedAssets;
    
    /// @notice Maximum single deposit amount per transaction
    uint256 public maxDepositPerUser;
    
    /// @notice Maximum total deposits for entire vault
    uint256 public maxTotalDeposits;

    /// @notice Track total user deposits (before leverage)
    mapping(address => uint256) public userTotalDeposits;
    mapping(address => DepositInfo[]) public userDeposits;
    
    /// @notice Track bot deposit index for each user
    mapping(address => uint256) public userBotDepositIndex;
    mapping(address => bool) public hasBotDeposit;

    uint256 public minDeposit;
    bool public isPaused;
    uint256 public accumulatedFees;
    address public feeRecipient;
    uint256 public earlyWithdrawalPenalty;
    address public botAddress;

    uint256 public nextRequestId;
    mapping(uint256 => WithdrawalRequest) public withdrawalRequests;
    mapping(address => uint256[]) public userRequests;
    uint256[] public pendingRequests;

    // ========================================================================
    // EVENTS
    // ========================================================================
    
    event Deposit(
        address indexed user,
        address indexed beneficiary,
        uint256 depositIndex,
        uint256 assets,
        uint256 shares,
        uint256 lockDuration,
        uint256 unlockBlock,
        bool isBotDeposit
    );
    
    event DepositMerged(
        address indexed beneficiary,
        uint256 depositIndex,
        uint256 addedAssets,
        uint256 addedShares,
        uint256 newUnlockBlock
    );
    
    event LockExtended(
        address indexed user,
        uint256 depositIndex,
        uint256 oldUnlockBlock,
        uint256 newUnlockBlock,
        uint256 extensionDays
    );
    
    event WithdrawalRequested(
        uint256 indexed requestId,
        address indexed user,
        uint256 depositIndex,
        uint256 shares,
        uint256 assets,
        bool isEarlyWithdrawal
    );
    
    event WithdrawalProcessed(uint256 indexed requestId, uint256 assetsReturned, uint256 penalty);
    event WithdrawalClaimed(uint256 indexed requestId, address indexed user, uint256 assets);
    event BotWithdraw(uint256 amount, string reason);
    event BotDeposit(uint256 amount, uint256 newTotalAssets);
    event DepositCapsUpdated(uint256 maxPerUser, uint256 maxTotal);
    event BotAddressUpdated(address newBot);
    event EarlyWithdrawalPenaltyUpdated(uint256 newPenalty);
    event AssetsUpdated(uint256 oldTotal, uint256 newTotal, int256 profitLoss);
    event PauseVault(bool paused);

    // ========================================================================
    // ERRORS
    // ========================================================================
    
    error VaultPaused();
    error ZeroAmount();
    error BelowMinDeposit();
    error ExceedsMaxDepositPerUser();
    error ExceedsMaxTotalDeposits();
    error InvalidLockDuration();
    error InvalidDepositIndex();
    error NotBot();
    error InvalidBeneficiary();
    error InvalidAddress();
    error InsufficientShares();
    error RequestNotFound();
    error NotRequestOwner();
    error RequestNotProcessed();
    error RequestAlreadyClaimed();
    error CannotExtendUnlockedDeposit();
    error InvalidExtensionDays();
    
    // ========================================================================
    // MODIFIERS
    // ========================================================================
    
    modifier onlyBot() {
        if (msg.sender != botAddress && msg.sender != owner()) revert NotBot();
        _;
    }

    // ========================================================================
    // CONSTRUCTOR
    // ========================================================================
    
    constructor(
        address _asset,
        string memory _name,
        string memory _symbol,
        uint8 _assetDecimals
    ) KIP7(_name, _symbol) {
        asset = _asset;
        assetDecimals = _assetDecimals;
        isNative = (_asset == 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE);
        
        minDeposit = 10 * (10 ** _assetDecimals);
        maxDepositPerUser = 1000 * (10 ** _assetDecimals);       // 1,000 KAIA per user
        maxTotalDeposits = 500_000 * (10 ** _assetDecimals);    // 500,000 KAIA total
        
        earlyWithdrawalPenalty = 500; // 5% 
        feeRecipient = msg.sender;
        botAddress = msg.sender;
        
        isPaused = false;
        totalManagedAssets = 0;
        nextRequestId = 1;
    }

    // ========================================================================
    // USER DEPOSIT FUNCTIONS
    // ========================================================================

    /**
     * @notice User deposits native tokens directly
     */
    function depositNative() external payable nonReentrant returns (uint256 depositIndex) {
        if (!isNative) revert InvalidAddress();
        if (isPaused) revert VaultPaused();
        if (msg.value == 0) revert ZeroAmount();
        if (msg.value < minDeposit) revert BelowMinDeposit();
        
        return _processDeposit(msg.sender, msg.sender, msg.value, 0, false);
    }

    /**
     * @notice User deposits ERC20 tokens directly
     */
    function deposit(uint256 assets) external nonReentrant returns (uint256 depositIndex) {
        if (isNative) revert InvalidAddress();
        if (isPaused) revert VaultPaused();
        if (assets == 0) revert ZeroAmount();
        if (assets < minDeposit) revert BelowMinDeposit();
        
        IKIP7(asset).transferFrom(msg.sender, address(this), assets);
        
        return _processDeposit(msg.sender, msg.sender, assets, 0, false);
    }

    // ========================================================================
    // BOT DEPOSIT ON-BEHALF FUNCTIONS
    // ========================================================================
    
    /**
     * @notice Bot deposits native tokens on behalf of user (Starter Package)
     * @dev Auto-merges with existing bot deposit and extends lock to 15 days
     * @param beneficiary The user who will receive the shares
     */
    function botDepositNativeOnBehalf(address beneficiary) 
        external payable onlyBot nonReentrant returns (uint256 depositIndex) 
    {
        if (!isNative) revert InvalidAddress();
        if (isPaused) revert VaultPaused();
        if (msg.value == 0) revert ZeroAmount();
        if (beneficiary == address(0)) revert InvalidBeneficiary();
        
        uint256 lockBlocks = BOT_LOCK_DURATION / 1 seconds;
        
        // Check if user has existing bot deposit
        if (hasBotDeposit[beneficiary]) {
            return _mergeBotDeposit(beneficiary, msg.value, lockBlocks);
        } else {
            return _createBotDeposit(beneficiary, msg.value, lockBlocks);
        }
    }
    
    /**
     * @notice Bot deposits ERC20 tokens on behalf of user (Starter Package)
     * @dev Auto-merges with existing bot deposit and extends lock to 15 days
     * @param beneficiary The user who will receive the shares
     * @param assets Amount of tokens to deposit
     */
    function botDepositOnBehalf(address beneficiary, uint256 assets) 
        external onlyBot nonReentrant returns (uint256 depositIndex) 
    {
        if (isNative) revert InvalidAddress();
        if (isPaused) revert VaultPaused();
        if (assets == 0) revert ZeroAmount();
        if (beneficiary == address(0)) revert InvalidBeneficiary();
        
        IKIP7(asset).transferFrom(msg.sender, address(this), assets);
        
        uint256 lockBlocks = BOT_LOCK_DURATION / 1 seconds;
        
        // Check if user has existing bot deposit
        if (hasBotDeposit[beneficiary]) {
            return _mergeBotDeposit(beneficiary, assets, lockBlocks);
        } else {
            return _createBotDeposit(beneficiary, assets, lockBlocks);
        }
    }

    // ========================================================================
    // LOCK EXTENSION FUNCTIONS
    // ========================================================================
    
    /**
     * @notice Admin or Bot can extend lock period for a user's deposit
     * @dev Can be used for special promotions or incentives
     * @param user Address of the user
     * @param depositIndex Index of the deposit to extend
     * @param extensionDays Number of days to extend the lock
     */
    function extendLockPeriod(
        address user,
        uint256 depositIndex,
        uint256 extensionDays
    ) external onlyBot {
        if (user == address(0)) revert InvalidAddress();
        if (extensionDays == 0) revert InvalidExtensionDays();
        
        DepositInfo[] storage deposits = userDeposits[user];
        if (depositIndex >= deposits.length) revert InvalidDepositIndex();
        
        DepositInfo storage depositInfo = deposits[depositIndex];
        
        // Can only extend locked deposits
        if (!depositInfo.isLockedDeposit) revert CannotExtendUnlockedDeposit();
        
        uint256 oldUnlockBlock = depositInfo.unlockBlock;
        uint256 extensionBlocks = extensionDays * 1 days / 1 seconds;
        uint256 newUnlockBlock = depositInfo.unlockBlock + extensionBlocks;
        
        depositInfo.unlockBlock = newUnlockBlock;
        depositInfo.lockDuration += extensionBlocks;
        depositInfo.lastExtendedBlock = block.number;
        
        emit LockExtended(user, depositIndex, oldUnlockBlock, newUnlockBlock, extensionDays);
    }

    // ========================================================================
    // BOT WITHDRAW/DEPOSIT FUNCTIONS
    // ========================================================================
    
    /**
     * @notice Bot withdraws assets to manage externally (leverage, strategies, etc.)
     * @param amount Amount to withdraw
     * @param reason Human-readable reason for transparency
     */
    function botWithdraw(uint256 amount, string calldata reason) 
        external 
        onlyBot 
        nonReentrant 
    {
        if (amount == 0) revert ZeroAmount();
        
        if (isNative) {
            payable(msg.sender).transfer(amount);
        } else {
            IKIP7(asset).transfer(msg.sender, amount);
        }
        
        emit BotWithdraw(amount, reason);
    }
    
    /**
     * @notice Bot deposits assets back after managing externally
     * @param amount Amount to deposit (ignored for native, uses msg.value)
     */
    function botDeposit(uint256 amount) 
        external 
        payable 
        onlyBot 
        nonReentrant 
    {
        uint256 actualAmount;
        
        if (isNative) {
            actualAmount = msg.value;
            if (actualAmount == 0) revert ZeroAmount();
        } else {
            actualAmount = amount;
            if (actualAmount == 0) revert ZeroAmount();
            IKIP7(asset).transferFrom(msg.sender, address(this), amount);
        }
        
        emit BotDeposit(actualAmount, totalManagedAssets);
    }

    // ========================================================================
    // WITHDRAWAL REQUEST FUNCTIONS
    // ========================================================================
    
    function requestWithdrawal(uint256 depositIndex, uint256 shares) external nonReentrant returns (uint256 requestId) {
        if (shares == 0) revert ZeroAmount();
        
        DepositInfo[] storage deposits = userDeposits[msg.sender];
        if (depositIndex >= deposits.length) revert InvalidDepositIndex();
        
        DepositInfo storage depositInfo = deposits[depositIndex];
        if (depositInfo.shares < shares) revert InsufficientShares();
        
        uint256 assets = _calculateAssets(shares);
        bool isEarly = depositInfo.isLockedDeposit && block.number < depositInfo.unlockBlock;
        
        uint256 penalty = 0;
        if (isEarly) {
            penalty = (assets * earlyWithdrawalPenalty) / 10000;
            assets -= penalty;
            accumulatedFees += penalty;
        }
        
        _burn(msg.sender, shares);
        depositInfo.shares -= shares;
        depositInfo.assets = (depositInfo.assets * depositInfo.shares) / (depositInfo.shares + shares); // Proportional reduction
        totalManagedAssets -= (assets + penalty);
        
        userTotalDeposits[msg.sender] -= (assets + penalty);
        
        requestId = nextRequestId++;
        
        withdrawalRequests[requestId] = WithdrawalRequest({
            user: msg.sender,
            depositIndex: depositIndex,
            shares: shares,
            assets: assets,
            timestamp: block.timestamp,
            processed: false,
            claimed: false
        });
        
        userRequests[msg.sender].push(requestId);
        pendingRequests.push(requestId);
        
        emit WithdrawalRequested(requestId, msg.sender, depositIndex, shares, assets, isEarly);
        
        return requestId;
    }
    
    function claimWithdrawal(uint256 requestId) external nonReentrant {
        WithdrawalRequest storage request = withdrawalRequests[requestId];
        
        if (request.user == address(0)) revert RequestNotFound();
        if (request.user != msg.sender) revert NotRequestOwner();
        if (!request.processed) revert RequestNotProcessed();
        if (request.claimed) revert RequestAlreadyClaimed();
        
        request.claimed = true;
        
        if (isNative) {
            payable(msg.sender).transfer(request.assets);
        } else {
            IKIP7(asset).transfer(msg.sender, request.assets);
        }
        
        emit WithdrawalClaimed(requestId, msg.sender, request.assets);
    }
    
    function processWithdrawals(uint256[] calldata requestIds) external payable onlyBot nonReentrant {
        uint256 totalNeeded = 0;
        
        for (uint256 i = 0; i < requestIds.length; i++) {
            WithdrawalRequest storage request = withdrawalRequests[requestIds[i]];
            
            if (request.user == address(0)) revert RequestNotFound();
            if (request.processed) continue;
            
            totalNeeded += request.assets;
            request.processed = true;
            
            _removeFromPendingQueue(requestIds[i]);
            
            emit WithdrawalProcessed(requestIds[i], request.assets, 0);
        }
        
        if (isNative) {
            require(msg.value >= totalNeeded, "Insufficient KAIA");
        }
    }
    
    // ========================================================================
    // ADMIN FUNCTIONS
    // ========================================================================
    
    function setDepositCaps(uint256 _maxPerUser, uint256 _maxTotal) external onlyOwner {
        maxDepositPerUser = _maxPerUser;
        maxTotalDeposits = _maxTotal;
        emit DepositCapsUpdated(_maxPerUser, _maxTotal);
    }
    
    function setBotAddress(address _bot) external onlyOwner {
        if (_bot == address(0)) revert InvalidAddress();
        botAddress = _bot;
        emit BotAddressUpdated(_bot);
    }
    
    function setEarlyWithdrawalPenalty(uint256 _penalty) external onlyOwner {
        require(_penalty <= 1000, "Max 10%");
        earlyWithdrawalPenalty = _penalty;
        emit EarlyWithdrawalPenaltyUpdated(_penalty);
    }
    
    function pause() external onlyOwner {
        isPaused = true;
        emit PauseVault(true);
    }
    
    function unpause() external onlyOwner {
        isPaused = false;
        emit PauseVault(false);
    }
    
    function setMinDeposit(uint256 _min) external onlyOwner {
        minDeposit = _min;
    }
    
    function updateManagedAssets(uint256 newTotal) external onlyOwner {
        uint256 oldTotal = totalManagedAssets;
        int256 profitLoss = int256(newTotal) - int256(oldTotal);

        totalManagedAssets = newTotal;
        emit AssetsUpdated(oldTotal, newTotal, profitLoss);
    }
    
    // ========================================================================
    // VIEW FUNCTIONS
    // ========================================================================
    
    function getUserDepositCount(address user) external view returns (uint256) {
        return userDeposits[user].length;
    }
    
    function getUserDeposit(address user, uint256 index) external view returns (
        uint256 shares,
        uint256 assets,
        uint256 unlockBlock,
        uint256 lockDuration,
        bool isLocked,
        address beneficiary,
        bool isBotDeposit,
        uint256 depositBlock,
        bool canWithdraw,
        uint256 lastExtendedBlock
    ) {
        DepositInfo memory depositInfo = userDeposits[user][index];
        return (
            depositInfo.shares,
            depositInfo.assets,
            depositInfo.unlockBlock,
            depositInfo.lockDuration,
            depositInfo.isLockedDeposit,
            depositInfo.beneficiary,
            depositInfo.isBotDeposit,
            depositInfo.depositBlock,
            block.number >= depositInfo.unlockBlock,
            depositInfo.lastExtendedBlock
        );
    }
    
    function sharePrice() public view returns (uint256) {
        uint256 supply = totalSupply();
        if (supply == 0) return 1e18;
        return (totalManagedAssets * 1e18) / supply;
    }
    
    function previewDeposit(uint256 assets) external view returns (uint256) {
        return _calculateShares(assets);
    }
    
    function getUserDepositCapRemaining(address user) external view returns (uint256) {
        return maxDepositPerUser > userTotalDeposits[user] 
            ? maxDepositPerUser - userTotalDeposits[user] 
            : 0;
    }
    
    function getTotalDepositCapRemaining() external view returns (uint256) {
        return maxTotalDeposits > totalManagedAssets 
            ? maxTotalDeposits - totalManagedAssets 
            : 0;
    }
    
    function getPendingRequests() external view returns (uint256[] memory) {
        return pendingRequests;
    }
    
    function liquidBalance() external view returns (uint256) {
        return isNative 
            ? address(this).balance 
            : IKIP7(asset).balanceOf(address(this));
    }
    
    // ========================================================================
    // INTERNAL FUNCTIONS
    // ========================================================================
    
    /**
     * @notice Create a new bot deposit for a user
     */
    function _createBotDeposit(
        address beneficiary,
        uint256 assets,
        uint256 lockBlocks
    ) internal returns (uint256 depositIndex) {
        depositIndex = _processDeposit(msg.sender, beneficiary, assets, lockBlocks, true);
        
        // Track that this user has a bot deposit
        hasBotDeposit[beneficiary] = true;
        userBotDepositIndex[beneficiary] = depositIndex;
        
        return depositIndex;
    }
    
    /**
     * @notice Merge new assets into existing bot deposit and extend lock
     */
    function _mergeBotDeposit(
        address beneficiary,
        uint256 newAssets,
        uint256 lockBlocks
    ) internal returns (uint256 depositIndex) {
        // Check deposit caps
        if (userTotalDeposits[beneficiary] + newAssets > maxDepositPerUser) {
            revert ExceedsMaxDepositPerUser();
        }
        if (totalManagedAssets + newAssets > maxTotalDeposits) {
            revert ExceedsMaxTotalDeposits();
        }
        
        depositIndex = userBotDepositIndex[beneficiary];
        DepositInfo storage depositInfo = userDeposits[beneficiary][depositIndex];
        
        // Calculate new shares
        uint256 newShares = _calculateShares(newAssets);
        
        // Update deposit
        depositInfo.shares += newShares;
        depositInfo.assets += newAssets;
        depositInfo.unlockBlock = block.number + lockBlocks; // EXTEND LOCK TO 15 DAYS FROM NOW
        depositInfo.lastExtendedBlock = block.number;
        
        // Update global state
        totalManagedAssets += newAssets;
        userTotalDeposits[beneficiary] += newAssets;
        _mint(beneficiary, newShares);
        
        emit DepositMerged(beneficiary, depositIndex, newAssets, newShares, depositInfo.unlockBlock);
        
        return depositIndex;
    }
    
    function _processDeposit(
        address depositor,
        address beneficiary,
        uint256 assets,
        uint256 lockBlocks,
        bool isBotDeposit
    ) internal returns (uint256 depositIndex) {
        // Check deposit caps
        if (userTotalDeposits[beneficiary] + assets > maxDepositPerUser) {
            revert ExceedsMaxDepositPerUser();
        }
        if (totalManagedAssets + assets > maxTotalDeposits) {
            revert ExceedsMaxTotalDeposits();
        }
        
        uint256 shares = _calculateShares(assets);
        uint256 unlockBlock = lockBlocks > 0 ? block.number + lockBlocks : block.number;
        
        totalManagedAssets += assets;
        userTotalDeposits[beneficiary] += assets;
        _mint(beneficiary, shares);
        
        depositIndex = userDeposits[beneficiary].length;
        
        userDeposits[beneficiary].push(DepositInfo({
            shares: shares,
            assets: assets,
            unlockBlock: unlockBlock,
            lockDuration: lockBlocks,
            isLockedDeposit: lockBlocks > 0,
            beneficiary: beneficiary,
            isBotDeposit: isBotDeposit,
            depositBlock: block.number,
            lastExtendedBlock: 0
        }));
        
        emit Deposit(depositor, beneficiary, depositIndex, assets, shares, lockBlocks, unlockBlock, isBotDeposit);
        
        return depositIndex;
    }
    
    function _calculateShares(uint256 assets) internal view returns (uint256) {
        uint256 supply = totalSupply();
        if (supply == 0) return assets;
        return (assets * supply) / totalManagedAssets;
    }
    
    function _calculateAssets(uint256 shares) internal view returns (uint256) {
        uint256 supply = totalSupply();
        if (supply == 0) return 0;
        return (shares * totalManagedAssets) / supply;
    }
    
    function _removeFromPendingQueue(uint256 requestId) internal {
        for (uint256 i = 0; i < pendingRequests.length; i++) {
            if (pendingRequests[i] == requestId) {
                pendingRequests[i] = pendingRequests[pendingRequests.length - 1];
                pendingRequests.pop();
                break;
            }
        }
    }
    
    receive() external payable {
        require(msg.sender == owner() || msg.sender == botAddress, "Unauthorized");
    }

}
