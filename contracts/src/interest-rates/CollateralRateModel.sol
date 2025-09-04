// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.10;

import "../interfaces/InterestRateModel.sol";

contract CollateralRateModel is InterestRateModel {
    
    function getBorrowRate(uint cash, uint borrows, uint reserves) override external pure returns (uint) {
        cash; borrows; reserves;
        return 0;
    }
    
    function getSupplyRate(uint cash, uint borrows, uint reserves, uint reserveFactorMantissa) override external pure returns (uint) {
        cash; borrows; reserves; reserveFactorMantissa;
        return 0.001e18; // 0.1% APY for suppliers
    }
     
}
