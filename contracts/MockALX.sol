// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @dev 测试用的 Mock ALX 代币
 */
contract MockALX is ERC20 {
    constructor() ERC20("Mock ALX", "mALX") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
