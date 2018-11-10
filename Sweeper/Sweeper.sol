pragma solidity ^0.4.24;

contract Sweeper {
  constructor(bytes32 id, address to,address token,uint256 value) public {
    IERC20(token).approve(to,value);
    Loan(to).repay(id);
    selfdestruct(to);
  }
}

contract IERC20 {
  function approve(address spender, uint256 value) external {}
}

contract Loan {
  function repay(bytes32 id) public returns (bool) {}
}
