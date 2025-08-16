// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import { console} from "forge-std/Test.sol";

import "@kaiachain/contracts/security/ReentrancyGuard.sol";
import "@kaiachain/contracts/access/Ownable.sol";
import "@kaiachain/contracts/KIP/interfaces/IKIP7.sol";
import "@kaiachain/contracts/KIP/interfaces/IKIP7Receiver.sol";
import "@kaiachain/contracts/KIP/token/KIP7/utils/SafeKIP7.sol";
import { IPriceOracle } from "./interfaces/IPriceOracle.sol";
import { IInterestRateModel } from "./interfaces/IInterestRateModel.sol";

/**
 * @title BaseLendingMarket
 * @dev Base contract for lending markets 
 */
abstract contract BaseLendingMarket is ReentrancyGuard, Ownable, IKIP7Receiver {
    using SafeKIP7 for IKIP7;

    // ============ Immutable State Variables ============

    IKIP7 public immutable WKAIA;
    IKIP7 public immutable stKAIA;
    IKIP7 public immutable STABLECOIN;
    
    IPriceOracle public oracle;
    IInterestRateModel public interestRateModel;

    // Protocol parameters (in basis points, 10000 = 100%)
    uint256 public constant WKAIA_LTV = 6000;        // 60% LTV for WKAIA
    uint256 public constant STKAIA_LTV = 6500;       // 65% LTV for stKAIA
    uint256 public constant LIQUIDATION_THRESHOLD = 8000;  // 80% liquidation threshold
    uint256 public constant LIQUIDATION_PENALTY = 1000;    // 10% liquidation penalty
    uint256 public constant PROTOCOL_FEE = 500;      // 5% of interest goes to protocol
    
    // Minimum amounts to prevent dust
    uint256 public constant MIN_COLLATERAL = 1e18;   // 1 WKAIA/stKAIA minimum
    uint256 public immutable MIN_BORROW;              // Minimum borrow amount (varies by stablecoin)
    
    // Market state
    uint256 public totalStablecoinSupplied;
    uint256 public totalStablecoinBorrowed;
    uint256 public totalReserves;
    
    uint256 public lastAccrualTimestamp;
    uint256 public borrowIndex = 1e18;
    uint256 public supplyIndex = 1e18;

    // Emergency pause
    bool public paused;

    // ============ User Data Structures ============

    struct UserCollateral {
        uint256 wkaiaAmount;
        uint256 stKaiaAmount;
        uint256 depositTimestamp;
    }

    struct UserBorrow {
        uint256 principal;
        uint256 interestIndex;
        uint256 lastUpdateTimestamp;
    }

    struct UserSupply {
        uint256 amount;
        uint256 interestIndex;
        uint256 depositTimestamp;
    }

    mapping(address => UserCollateral) public userCollateral;
    mapping(address => UserBorrow) public userBorrows;
    mapping(address => UserSupply) public userSupplies;

    // ============ Events ============

    event CollateralDeposited(address indexed user, address indexed token, uint256 amount);
    event CollateralWithdrawn(address indexed user, address indexed token, uint256 amount);
    event StablecoinSupplied(address indexed user, uint256 amount);
    event StablecoinWithdrawn(address indexed user, uint256 amount);
    event StablecoinBorrowed(address indexed user, uint256 amount);
    event StablecoinRepaid(address indexed user, uint256 amount);
    event Liquidation(address indexed borrower, address indexed liquidator, uint256 debtAmount, uint256 collateralSeized);
    event InterestAccrued(uint256 totalBorrows, uint256 totalReserves, uint256 borrowIndex, uint256 supplyIndex);
    event ProtocolPaused(bool paused);

    // ============ Modifiers ============

    modifier whenNotPaused() {
        require(!paused, "Protocol is paused");
        _;
    }

    // ============ Constructor ============

    constructor(
        address _wkaia,
        address _stKaia,
        address _stablecoin,
        uint256 _minBorrow,
        address _oracle,
        address _interestRateModel
    ) {
        WKAIA = IKIP7(_wkaia);
        stKAIA = IKIP7(_stKaia);
        STABLECOIN = IKIP7(_stablecoin);
        MIN_BORROW = _minBorrow;
        oracle = IPriceOracle(_oracle);
        interestRateModel = IInterestRateModel(_interestRateModel);
        lastAccrualTimestamp = block.timestamp;
    }

    // ============ Core Functions ============

    function accrueInterest() public {
        uint256 currentTimestamp = block.timestamp;
        uint256 timeDelta = currentTimestamp - lastAccrualTimestamp;
        
        if (timeDelta == 0) return;

        uint256 utilization = getUtilizationRate();
        uint256 borrowRate = interestRateModel.getBorrowRate(utilization);
        uint256 supplyRate = interestRateModel.getSupplyRate(utilization, borrowRate);
        
        // Calculate interest factors
        uint256 borrowInterestFactor = borrowRate * timeDelta / 365 days;
        uint256 supplyInterestFactor = supplyRate * timeDelta / 365 days;
        
        // Calculate accumulated interest
        uint256 interestAccumulated = totalStablecoinBorrowed * borrowInterestFactor / 1e18;
        
        // Update global state
        totalStablecoinBorrowed += interestAccumulated;
        totalReserves += (interestAccumulated * PROTOCOL_FEE) / 10000;
        
        // Update indices
        borrowIndex += (borrowIndex * borrowInterestFactor) / 1e18;
        supplyIndex += (supplyIndex * supplyInterestFactor) / 1e18;
        
        lastAccrualTimestamp = currentTimestamp;

        emit InterestAccrued(totalStablecoinBorrowed, totalReserves, borrowIndex, supplyIndex);
    }

    // ============ Collateral Functions ============

    function depositWKaiaCollateral(uint256 amount) external virtual nonReentrant whenNotPaused {
        require(amount >= MIN_COLLATERAL, "Amount below minimum");
        
        accrueInterest();
        
        WKAIA.safeTransferFrom(msg.sender, address(this), amount);
        userCollateral[msg.sender].wkaiaAmount += amount;
        userCollateral[msg.sender].depositTimestamp = block.timestamp;

        emit CollateralDeposited(msg.sender, address(WKAIA), amount);
    }

    function depositStKaiaCollateral(uint256 amount) external virtual nonReentrant whenNotPaused {
        require(amount >= MIN_COLLATERAL, "Amount below minimum");
        
        accrueInterest();
        
        stKAIA.safeTransferFrom(msg.sender, address(this), amount);
        userCollateral[msg.sender].stKaiaAmount += amount;
        userCollateral[msg.sender].depositTimestamp = block.timestamp;

        emit CollateralDeposited(msg.sender, address(stKAIA), amount);
    }

    function withdrawWKaiaCollateral(uint256 amount) external virtual nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(userCollateral[msg.sender].wkaiaAmount >= amount, "Insufficient collateral");
        
        accrueInterest();
        
        userCollateral[msg.sender].wkaiaAmount -= amount;
        require(isHealthy(msg.sender), "Withdrawal would make position unhealthy");
        
        WKAIA.safeTransfer(msg.sender, amount);
        emit CollateralWithdrawn(msg.sender, address(WKAIA), amount);
    }

    function withdrawStKaiaCollateral(uint256 amount) external virtual nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(userCollateral[msg.sender].stKaiaAmount >= amount, "Insufficient collateral");
        
        accrueInterest();
        
        userCollateral[msg.sender].stKaiaAmount -= amount;
        require(isHealthy(msg.sender), "Withdrawal would make position unhealthy");
        
        stKAIA.safeTransfer(msg.sender, amount);
        emit CollateralWithdrawn(msg.sender, address(stKAIA), amount);
    }

    // ============ Supply Functions ============

    function supplyStablecoin(uint256 amount) external virtual nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        
        accrueInterest();
        
        STABLECOIN.safeTransferFrom(msg.sender, address(this), amount);
        
        // Update user supply with current index
        if (userSupplies[msg.sender].amount == 0) {
            userSupplies[msg.sender].interestIndex = supplyIndex;
        } else {
            // Compound existing supply
            uint256 currentBalance = getUserSupplyBalance(msg.sender);
            userSupplies[msg.sender].amount = currentBalance;
            userSupplies[msg.sender].interestIndex = supplyIndex;
        }
        
        userSupplies[msg.sender].amount += amount;
        userSupplies[msg.sender].depositTimestamp = block.timestamp;
        totalStablecoinSupplied += amount;

        emit StablecoinSupplied(msg.sender, amount);
    }

    function withdrawStablecoin(uint256 amount) external virtual nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        
        accrueInterest();
        
        uint256 userBalance = getUserSupplyBalance(msg.sender);
        require(userBalance >= amount, "Insufficient balance");
        
        // Check liquidity
        uint256 availableLiquidity = STABLECOIN.balanceOf(address(this)) - totalReserves;
        require(availableLiquidity >= amount, "Insufficient liquidity");
        
        // Update user supply
        userSupplies[msg.sender].amount = userBalance - amount;
        userSupplies[msg.sender].interestIndex = supplyIndex;
        totalStablecoinSupplied -= amount;
        
        STABLECOIN.safeTransfer(msg.sender, amount);
        emit StablecoinWithdrawn(msg.sender, amount);
    }

    // ============ Borrow Functions ============

    function borrowStablecoin(uint256 amount) external virtual nonReentrant whenNotPaused {
        require(amount >= MIN_BORROW, "Amount below minimum");
        
        accrueInterest();
        
        // Check borrowing capacity
        uint256 maxBorrow = getMaxBorrowAmount(msg.sender);
        uint256 currentDebt = getBorrowBalance(msg.sender);

        require(maxBorrow >= currentDebt + amount, "Insufficient collateral");
        
        // Check liquidity
        uint256 availableLiquidity = STABLECOIN.balanceOf(address(this)) - totalReserves;
        require(availableLiquidity >= amount, "Insufficient liquidity");
        
        // Update user borrow state
        if (userBorrows[msg.sender].principal == 0) {
            userBorrows[msg.sender].interestIndex = borrowIndex;
        } else {
            // Accrue interest to existing debt
            uint256 currentDebtTotal = getBorrowBalance(msg.sender);
            userBorrows[msg.sender].principal = currentDebtTotal;
            userBorrows[msg.sender].interestIndex = borrowIndex;
        }
        
        userBorrows[msg.sender].principal += amount;
        userBorrows[msg.sender].lastUpdateTimestamp = block.timestamp;
        totalStablecoinBorrowed += amount;
        
        STABLECOIN.safeTransfer(msg.sender, amount);
        emit StablecoinBorrowed(msg.sender, amount);
    }

    function repayStablecoin(uint256 amount) external virtual nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        
        accrueInterest();
        
        uint256 currentDebt = getBorrowBalance(msg.sender);
        require(currentDebt > 0, "No debt to repay");
        
        uint256 repayAmount = amount > currentDebt ? currentDebt : amount;
        
        STABLECOIN.safeTransferFrom(msg.sender, address(this), repayAmount);
        
        // Update user borrow state
        uint256 newPrincipal = currentDebt - repayAmount;
        userBorrows[msg.sender].principal = newPrincipal;
        userBorrows[msg.sender].interestIndex = borrowIndex;
        userBorrows[msg.sender].lastUpdateTimestamp = block.timestamp;
        
        totalStablecoinBorrowed -= repayAmount;
        emit StablecoinRepaid(msg.sender, repayAmount);
    }

    // ============ Liquidation Functions ============

    function liquidate(address borrower, uint256 repayAmount) external virtual nonReentrant whenNotPaused {
        require(repayAmount > 0, "Repay amount must be greater than 0");
        
        accrueInterest();
        
        require(!isHealthy(borrower), "Position is healthy");
        
        uint256 borrowBalance = getBorrowBalance(borrower);
        require(borrowBalance > 0, "No debt to liquidate");
        
        // Calculate max liquidation amount (50% of debt)
        uint256 maxLiquidation = borrowBalance / 2;
        uint256 actualRepayAmount = repayAmount > maxLiquidation ? maxLiquidation : repayAmount;
        
        // Calculate collateral to seize (with penalty)
        uint256 collateralValueToSeize = _calculateCollateralValue(actualRepayAmount);
        
        // Seize collateral
        (uint256 wkaiaSeized, uint256 stKaiaSeized) = calculateCollateralSeizure(borrower, collateralValueToSeize);
        
        // Transfer repayment from liquidator
        STABLECOIN.safeTransferFrom(msg.sender, address(this), actualRepayAmount);
        
        // Update borrower state
        uint256 newDebt = borrowBalance - actualRepayAmount;
        userBorrows[borrower].principal = newDebt;
        userBorrows[borrower].interestIndex = borrowIndex;
        totalStablecoinBorrowed -= actualRepayAmount;
        
        // Transfer seized collateral to liquidator
        if (wkaiaSeized > 0) {
            userCollateral[borrower].wkaiaAmount -= wkaiaSeized;
            WKAIA.safeTransfer(msg.sender, wkaiaSeized);
        }
        
        if (stKaiaSeized > 0) {
            userCollateral[borrower].stKaiaAmount -= stKaiaSeized;
            stKAIA.safeTransfer(msg.sender, stKaiaSeized);
        }

        emit Liquidation(borrower, msg.sender, actualRepayAmount, collateralValueToSeize);
    }

    // ============ View Functions ============

    function getCollateralValue(address user) public view returns (uint256) {
        UserCollateral memory collateral = userCollateral[user];
        
        uint256 wkaiaPrice = oracle.getPrice(address(WKAIA));
        uint256 wkaiaValue = collateral.wkaiaAmount * wkaiaPrice / 1e18;
        
        uint256 stKaiaExchangeRate = oracle.getStKaiaExchangeRate();
        uint256 stKaiaInWKaia = collateral.stKaiaAmount * stKaiaExchangeRate / 1e18;
        uint256 stKaiaValue = stKaiaInWKaia * wkaiaPrice / 1e18;
        
        return wkaiaValue + stKaiaValue;
    }

    function getMaxBorrowAmount(address user) public view returns (uint256) {
        UserCollateral memory collateral = userCollateral[user];
        
        uint256 wkaiaPrice = oracle.getPrice(address(WKAIA));
        uint256 wkaiaValue = collateral.wkaiaAmount * wkaiaPrice * WKAIA_LTV / (1e18 * 10000);
        
        uint256 stKaiaExchangeRate = oracle.getStKaiaExchangeRate();
        uint256 stKaiaInWKaia = collateral.stKaiaAmount * stKaiaExchangeRate / 1e18;
        uint256 stKaiaValue = stKaiaInWKaia * wkaiaPrice * STKAIA_LTV / (1e18 * 10000);
        
        uint256 maxBorrowUSD = wkaiaValue + stKaiaValue;
        
        // Convert USD value to stablecoin amount
        return _convertUSDToStablecoin(maxBorrowUSD);
    }

    function getBorrowBalance(address user) public view returns (uint256) {
        UserBorrow memory borrow = userBorrows[user];
        if (borrow.principal == 0) return 0;
        
        return borrow.principal * borrowIndex / borrow.interestIndex;
    }

    function getUserSupplyBalance(address user) public view returns (uint256) {
        UserSupply memory supply = userSupplies[user];
        if (supply.amount == 0) return 0;
        
        return supply.amount * supplyIndex / supply.interestIndex;
    }

    function isHealthy(address user) public view returns (bool) {
        uint256 collateralValue = getCollateralValue(user);
        uint256 borrowBalance = getBorrowBalance(user);
        
        if (borrowBalance == 0) return true;
        
        // Convert borrow balance to USD for comparison
        uint256 borrowValueUSD = _convertStablecoinToUSD(borrowBalance);
        uint256 healthFactor = collateralValue * 10000 / borrowValueUSD;
        return healthFactor >= LIQUIDATION_THRESHOLD;
    }

    function getUtilizationRate() public view returns (uint256) {
        if (totalStablecoinSupplied == 0) return 0;
        return totalStablecoinBorrowed * 1e18 / totalStablecoinSupplied;
    }

    // ============ Internal Functions ============

    function calculateCollateralSeizure(address borrower, uint256 targetValueUSD) 
        internal 
        view 
        returns (uint256 wkaiaSeized, uint256 stKaiaSeized) 
    {
        UserCollateral memory collateral = userCollateral[borrower];
        uint256 wkaiaPrice = oracle.getPrice(address(WKAIA));
        uint256 stKaiaExchangeRate = oracle.getStKaiaExchangeRate();
        
        uint256 remainingValue = targetValueUSD;
        
        // First, seize stKAIA (higher value due to yield)
        if (collateral.stKaiaAmount > 0 && remainingValue > 0) {
            uint256 stKaiaInWKaia = collateral.stKaiaAmount * stKaiaExchangeRate / 1e18;
            uint256 stKaiaTotalValue = stKaiaInWKaia * wkaiaPrice / 1e18;
            
            if (stKaiaTotalValue <= remainingValue) {
                stKaiaSeized = collateral.stKaiaAmount;
                remainingValue -= stKaiaTotalValue;
            } else {
                stKaiaSeized = remainingValue * 1e18 / (stKaiaExchangeRate * wkaiaPrice / 1e18);
                remainingValue = 0;
            }
        }
        
        // Then, seize WKAIA if needed
        if (collateral.wkaiaAmount > 0 && remainingValue > 0) {
            uint256 wkaiaTotalValue = collateral.wkaiaAmount * wkaiaPrice / 1e18;
            
            if (wkaiaTotalValue <= remainingValue) {
                wkaiaSeized = collateral.wkaiaAmount;
            } else {
                wkaiaSeized = remainingValue * 1e18 / wkaiaPrice;
            }
        }
    }

    // ============ Abstract Functions ============
    
    /**
     * @dev Convert USD amount to stablecoin amount - implemented by child contracts
     */
    function _convertUSDToStablecoin(uint256 usdAmount) internal view virtual returns (uint256);
    
    /**
     * @dev Convert stablecoin amount to USD - implemented by child contracts
     */
    function _convertStablecoinToUSD(uint256 stablecoinAmount) internal view virtual returns (uint256);
    
    /**
     * @dev Calculate collateral value to seize including penalty - implemented by child contracts
     */
    function _calculateCollateralValue(uint256 repayAmount) internal view virtual returns (uint256);

    // ============ Admin Functions ============

    function setOracle(address _oracle) external onlyOwner {
        oracle = IPriceOracle(_oracle);
    }

    function setInterestRateModel(address _interestRateModel) external onlyOwner {
        interestRateModel = IInterestRateModel(_interestRateModel);
    }

    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
        emit ProtocolPaused(_paused);
    }

    function withdrawReserves(uint256 amount) external onlyOwner {
        require(amount <= totalReserves, "Insufficient reserves");
        totalReserves -= amount;
        STABLECOIN.safeTransfer(owner(), amount);
    }

    // ============ KIP7Receiver Implementation ============

   function onKIP7Received(
        address,
        address,
        uint256,
        bytes memory
    ) public virtual override returns (bytes4) {
        return this.onKIP7Received.selector;
    }

    function supportsInterface(bytes4 interfaceId) public view virtual returns (bool) {
        return interfaceId == type(IKIP7Receiver).interfaceId;
    }
}