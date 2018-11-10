pragma solidity ^0.4.24;

contract Sweeper {
  constructor(address to,address token,uint256 value) public {
    IERC20(token).approve(to,value);
    Loan(to).repay(address(this),token,value);
    selfdestruct(to);
  }
}

contract IERC20 {
  function approve(address spender, uint256 value) external {}
}

contract Loan {
  function repay(address from, address token, uint256 value) public returns (bool) {}
}
