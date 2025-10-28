// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import "@kaiachain/contracts/KIP/token/KIP7/KIP7.sol";

contract MockToken is KIP7 {

    uint8 private _decimals;

    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_,
        uint256 initialSupply
    ) KIP7(name, symbol) {
        _decimals = decimals_;
        _mint(msg.sender, initialSupply);
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function decimals() public view override returns (uint8) {
        return _decimals;
    }

}
