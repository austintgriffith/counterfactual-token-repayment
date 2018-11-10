import React, { Component } from 'react';
import './App.css';
import { Metamask, Gas, ContractLoader, Transactions, Events, Scaler, Blockie, Address, Button } from "dapparatus"
import Web3 from 'web3';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      web3: false,
      account: false,
      gwei: 4,
      doingTransaction: false,
    }
  }
  handleInput(e){
    let update = {}
    update[e.target.name] = e.target.value
    this.setState(update)
  }
  render() {
    let {web3,account,contracts,tx,gwei,block,avgBlockTime,etherscan} = this.state
    let connectedDisplay = []
    let contractsDisplay = []
    if(web3){
      connectedDisplay.push(
       <Gas
         key="Gas"
         onUpdate={(state)=>{
           console.log("Gas price update:",state)
           this.setState(state,()=>{
             console.log("GWEI set:",this.state)
           })
         }}
       />
      )

      connectedDisplay.push(
        <ContractLoader
         key="ContractLoader"
         config={{DEBUG:true}}
         web3={web3}
         require={path => {return require(`${__dirname}/${path}`)}}
         onReady={(contracts,customLoader)=>{
           console.log("contracts loaded",contracts)
           this.setState({contracts:contracts},async ()=>{
             console.log("Contracts Are Ready:",this.state.contracts)
           })
         }}
        />
      )
      connectedDisplay.push(
        <Transactions
          key="Transactions"
          config={{DEBUG:false}}
          account={account}
          gwei={gwei}
          web3={web3}
          block={block}
          avgBlockTime={avgBlockTime}
          etherscan={etherscan}
          onReady={(state)=>{
            console.log("Transactions component is ready:",state)
            this.setState(state)
          }}
          onReceipt={(transaction,receipt)=>{
            // this is one way to get the deployed contract address, but instead I'll switch
            //  to a more straight forward callback system above
            console.log("Transaction Receipt",transaction,receipt)
          }}
        />
      )

      if(contracts){
        contractsDisplay.push(
          <div key="UI" style={{padding:30}}>
            <div>
              <Address
                {...this.state}
                address={contracts.Loan._address}
              />
            </div>
            <div>{"1. clevis test full"}</div>
            <div>{"2. clevis contract mint SomeCoin 0 (cat Loan/Loan.address) 1000"}</div>
            <div>{"clevis contract balanceOf SomeCoin (cat Loan/Loan.address)"}</div>
            <div>{"3. clevis contract issue Loan 0 (clevis randomhex 32) 0x2a906694D15Df38F59e76ED3a5735f8AAbccE9cb (cat SomeCoin/SomeCoin.address) 100"}</div>
            <div>{"clevis contract balanceOf SomeCoin 0x2a906694D15Df38F59e76ED3a5735f8AAbccE9cb"}</div>
            <div>{"clevis contract balanceOf SomeCoin (cat Loan/Loan.address)"}</div>
            <div>{'4. cd counterfactual; node craft.js "../Sweeper/Sweeper.abi" "../Sweeper/Sweeper.bytecode" 250000 100000000000 *LOANID* (cat ../Loan/Loan.address) (cat ../SomeCoin/SomeCoin.address) 100'}</div>
            <div>{"recipent is given payback address... can prove tx goes to bytecode... recipient uses tokens for good... recipient earns tokens back... ready to repay..."}</div>
            <div>{"5. recipent sends tokens to counterfactual address"}</div>
            <div>{"clevis contract balanceOf SomeCoin *counterfactualaddress* "}</div>
            <div>{"6. fund one time counterfactualFrom"}</div>
            <div>{"clevis sendTo 0.025 0 *counterfactualFROMaddress*"}</div>
            <div>{"7. execute counterfactual tx and sweep funds"}</div>
            <div>{"cd counterfactual; node deploy.js *TX*"}</div>
            <div>{"clevis contract balanceOf SomeCoin (cat Loan/Loan.address)"}</div>
            <div>{""}</div>
            <div>{""}</div>
          </div>
        )
      }

    }
    return (
      <div className="App">
        <Metamask
          config={{requiredNetwork:['Unknown','Rinkeby']}}
          onUpdate={(state)=>{
           console.log("metamask state update:",state)
           if(state.web3Provider) {
             state.web3 = new Web3(state.web3Provider)
             this.setState(state)
           }
          }}
        />
        {connectedDisplay}
        {contractsDisplay}
      </div>
    );
  }
}

export default App;
