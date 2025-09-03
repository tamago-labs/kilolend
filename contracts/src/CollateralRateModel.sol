// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;
 
import "./InterestRateModel.sol"; 

/**
 * @title CollateralRateModel  
 * @notice Conservative rate model for collateral-only markets
 */
contract CollateralRateModel is InterestRateModel {
    
    // Override to always return 0 for borrow rate
    function getBorrowRate(uint cash, uint borrows, uint reserves) override external pure returns (uint) {
        cash; borrows; reserves; // silence warnings
        return 0;
    }
    
    // Override to provide minimal supply rate for gas refunds
    function getSupplyRate(uint cash, uint borrows, uint reserves, uint reserveFactorMantissa) override external pure returns (uint) {
        cash; borrows; reserves; reserveFactorMantissa; // silence warnings
        return 0.001e18; // 0.1% APY for suppliers
    }
}