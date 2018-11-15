import React, { Component } from 'react';
import './App.css';
import { Metamask, Gas, ContractLoader, Transactions, Events, Scaler, Blockie, Address, Button } from "dapparatus"
import Web3 from 'web3';
import axios from 'axios'

const backendUrl = "http://0.0.0.0:1337/"

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      web3: false,
      account: false,
      gwei: 4,
      doingTransaction: false,
      txs: {}
    }
    this.poll()
    setInterval(this.poll.bind(this),1500)
  }
  handleInput(e){
    let update = {}
    update[e.target.name] = e.target.value
    this.setState(update)
  }
  async poll(){
    if(this.state && this.state.contracts && this.state.contracts.SomeCoin){
      let somecoinLoanBalance = await this.state.contracts.SomeCoin.balanceOf(this.state.contracts.Loan._address).call()
      let somecoinBalance = await this.state.contracts.SomeCoin.balanceOf(this.state.account).call()

      let loans = {}
      for(let e in this.state.events){
        //console.log("ID",this.state.events[e].id)
        let txs = this.state.txs
        if(!txs[this.state.events[e].id]){
          axios.get(backendUrl+'tx/'+this.state.events[e].id, {
            headers: {
                'Content-Type': 'application/json',
            }
          }).then((response)=>{
            console.log("Saved tx ",this.state.events[e].id)
            txs[this.state.events[e].id] = response.data
            this.setState({txs})
          })
          .catch((error)=>{
            console.log(error);
          });
        }else{
          txs[this.state.events[e].id].balance = await this.state.contracts.SomeCoin.balanceOf(txs[this.state.events[e].id].address).call()
        }
      }

      this.setState({somecoinBalance,somecoinLoanBalance})
    }
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


        let allLoans = []
        for(let e in this.state.events){
          //console.log("EVENT",this.state.events[e])
          let found = false
          for(let r in this.state.repayEvents){
            if(this.state.repayEvents[r] &&  this.state.events[e] && this.state.repayEvents[r].id == this.state.events[e].id){
              found = this.state.repayEvents[r]
            }
          }

          let border = "#555555"

          let counterfactualData = ""
          let collectButton = ""
          if(this.state.txs[this.state.events[e].id]){
            let tx = this.state.txs[this.state.events[e].id]
            counterfactualData = (
              <div style={{margin:10}}>
                Please repay to: <Address
                  {...this.state}
                  address={tx.address}
                />
                <div>
                  {tx.balance} (SomeCoin)
                </div>
              </div>
            )
            if(this.state.events[e].value<=tx.balance){
              border = "#5555cc"
              collectButton = (
                <Button size="2" onClick={()=>{
                  axios.post(backendUrl+'collect',{id:this.state.events[e].id}, {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                  }).then((response)=>{
                    console.log("COLLECTED",response.data)
                  })
                  .catch((error)=>{
                    console.log(error);
                  });

                  }}>
                  Collect
                </Button>
              )
            }
          }

          if(found){
            allLoans.push(
              <div key={e} style={{fontSize:16,margin:20,padding:20,border:"1px solid #55dd55"}}>
                <div>{this.state.events[e].id}</div>
                <div><Address
                  {...this.state}
                  address={this.state.events[e].recipient}
                /></div>
                <div>{this.state.events[e].value} (SomeCoin)</div>
                <div style={{color:"#55dd55"}}>PAID</div>
              </div>
            )
          }else{
            allLoans.push(
              <div key={e} style={{fontSize:16,margin:20,padding:20,border:"1px solid "+border}}>
                <div>{this.state.events[e].id}</div>
                <div><Address
                  {...this.state}
                  address={this.state.events[e].recipient}
                /></div>
                <div>{this.state.events[e].value} (SomeCoin)</div>
                {counterfactualData}
                {collectButton}
              </div>
            )
          }

        }

        contractsDisplay.push(
          <div key="UI" style={{padding:30}}>
            <h2>counterfactual loan repayment</h2>
            <div style={{padding:20,borderBottom:"1px solid #444444"}}>
              <div>
                <Address
                  {...this.state}
                  address={contracts.Loan._address}
                />
              </div>
              <div>
                Balance: {this.state.somecoinLoanBalance} (SomeCoin)
              </div>
            </div>


            <div style={{padding:20,borderBottom:"1px solid #444444"}}>
              <div>Issue Loan to <input
                  style={{width:300,margin:6,marginTop:20,maxHeight:20,padding:5,border:'2px solid #ccc',borderRadius:5}}
                  type="text" name="loanRecipient" value={this.state.loanRecipient} onChange={this.handleInput.bind(this)}
              /> for <input
                  style={{width:60,margin:6,marginTop:20,maxHeight:20,padding:5,border:'2px solid #ccc',borderRadius:5}}
                  type="text" name="loanAmount" value={this.state.loanAmount} onChange={this.handleInput.bind(this)}
              /> tokens   <Button size="2" onClick={()=>{
                    axios.post(backendUrl+'issue',{loanAmount:this.state.loanAmount,loanRecipient:this.state.loanRecipient}, {
                      headers: {
                          'Content-Type': 'application/json',
                      }
                    }).then((response)=>{
                      console.log("ISSUED",response.data)
                      this.setState({loanAmount:"",loanRecipient:""})
                    })
                    .catch((error)=>{
                      console.log(error);
                    });

                  }}>
                  Issue
                </Button>
              </div>
            </div>

            <div style={{padding:20,borderBottom:"1px solid #444444"}}>
              {allLoans}
            </div>

            <div style={{padding:20,borderBottom:"1px solid #444444"}}>
              <div>
                <Address
                  {...this.state}
                  address={this.state.account}
                />
              </div>

              <div>
                Balance: {this.state.somecoinBalance} (SomeCoin)
              </div>
              <div>
                Send <input
                    style={{width:60,margin:6,marginTop:20,maxHeight:20,padding:5,border:'2px solid #ccc',borderRadius:5}}
                    type="text" name="sendAmount" value={this.state.sendAmount} onChange={this.handleInput.bind(this)}
                />to<Blockie
                  address={this.state.sendTo}
                  config={{size:2}}
                 /><input
                    style={{width:300,margin:6,marginTop:20,maxHeight:20,padding:5,border:'2px solid #ccc',borderRadius:5}}
                    type="text" name="sendTo" value={this.state.sendTo} onChange={this.handleInput.bind(this)}
                />
                <Button size="2" color={"green"} onClick={()=>{
                    tx(contracts.SomeCoin.transfer(this.state.sendTo,this.state.sendAmount),(receipt)=>{
                      console.log("TX CALLED BACK",receipt)
                      this.setState({sendTo:"",sendAmount:""})
                    })
                  }}>
                  Send
                </Button>

              </div>
            </div>


            <Events
              /*config={{hide:false}}*/
              contract={contracts.Loan}
              eventName={"Issue"}
              block={this.state.block}
              onUpdate={(eventData,allEvents)=>{
                //console.log("EVENT DATA:",eventData)
                this.setState({events:allEvents})
              }}
            />
            <Events
              /*config={{hide:false}}*/
              contract={contracts.Loan}
              eventName={"Repay"}
              block={this.state.block}
              onUpdate={(eventData,allEvents)=>{
                //console.log("EVENT DATA:",eventData)
                this.setState({repayEvents:allEvents})
              }}
            />
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
