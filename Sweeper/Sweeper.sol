pragma solidity ^0.4.24;

contract Sweeper {

  constructor(address to,address token,uint256 value) public {

    // CALL SOME REPAY() FUNCTION

    IERC20(token).transfer(to,value);
    selfdestruct(to);
  }

}

contract IERC20 {
  function transfer(address to, uint256 value) external {}
}
