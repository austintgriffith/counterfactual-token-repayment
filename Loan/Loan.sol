pragma solidity ^0.4.24;

contract Loan {

  address loaner;

  constructor() public {
    loaner=msg.sender;
  }

  struct Loan {
    address recipient;
    address token;
    uint256 amount;
    bool repaid;
  }
  mapping (bytes32 => Loan) public loans;

  function issue(bytes32 id, address recipient, address token, uint256 value) public returns (bool){
    //make sure it is the loaner that is loaning
    require(msg.sender==loaner,"Loan::issue only loaner can loan");
    //make sure there isnt already a fund here
    require(loans[id].recipient==address(0),"Loan::issue id already exists");
    //store loan information
    loans[id] = Loan({
      recipient: recipient,
      token: token,
      amount: value,
      repaid: false
    });
    //transfer tokens to recipient
    IERC20(token).transfer(recipient,value);
    //fire event for logging
    emit Issue(id, recipient, token, value);
    return true;
  }
  event Issue(bytes32 id, address recipient, address token, uint256 value);

  function repay(bytes32 id) public returns (bool){
    //make sure it is a valid loan
    require(loans[id].recipient!=address(0),"Loan::repay id does not exists");
    require(!loans[id].repaid,"Loan::repay loan already paid off");
    //mark loan as repaid here to avoid reentrance?
    loans[id].repaid = true;
    //transfer funds into this contract from recipient and verify
    uint256 startingBalance = IERC20(loans[id].token).balanceOf(address(this));
    IERC20(loans[id].token).transferFrom(loans[id].recipient,address(this),loans[id].amount);
    require(
     (startingBalance+loans[id].amount) == IERC20(loans[id].token).balanceOf(address(this)),
     "ERC20 Balance did not change correctly"
    );
    //emit event for logging
    emit Repay(id,loans[id].recipient,loans[id].token,loans[id].amount);
    return true;
  }
  event Repay(bytes32 id, address recipient, address token, uint256 value);

}

contract IERC20 {
  function transferFrom(address from, address to, uint256 value) external returns (bool) {}
  function transfer(address to, uint256 value) external returns (bool) {}
  function balanceOf(address who) external view returns (uint256) {}
}
