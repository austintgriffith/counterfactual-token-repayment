pragma solidity ^0.4.24;

contract Loan {

  constructor() public {

  }

  function repay(address from, address token, uint256 value) public returns (bool){

    IERC20(token).transferFrom(from,address(this),value);

    //other house keeping

    //maybe make the loan as paid on chain or delete the struct or something

    return true;
  }



}

contract IERC20 {
  function transferFrom(address from, address to, uint256 value)
    external returns (bool) {}
}
