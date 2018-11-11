"use strict";
const clevis = require("clevis")
const { exec } = require('child_process');
const express = require('express');
const helmet = require('helmet');
const app = express();
const fs = require('fs');
const ContractLoader =  function(contractList,web3){
  let contracts = []
  for(let c in contractList){
    try{
      let abi = require("./src/contracts/"+contractList[c]+".abi.js")
      let address = require("./src/contracts/"+contractList[c]+".address.js")
      console.log(contractList[c],address,abi.length)
      contracts[contractList[c]] = new web3.eth.Contract(abi,address)
      console.log("contract")
      contracts[contractList[c]].blockNumber = require("./src/contracts/"+contractList[c]+".blocknumber.js")
      console.log("@ Block",contracts[contractList[c]].blockNumber)
    }catch(e){console.log(e)}
  }
  return contracts
}



var bodyParser = require('body-parser')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(helmet());
var cors = require('cors')
app.use(cors())
let contracts;
var Web3 = require('web3');
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://0.0.0.0:8545'));

var childProcess = require('child_process');

let transactions = {}

const DESKTOPMINERACCOUNT = 3 //index in geth

let accounts
web3.eth.getAccounts().then((_accounts)=>{
  accounts=_accounts
  console.log("ACCOUNTS",accounts)
})

console.log("LOADING CONTRACTS")
contracts = ContractLoader(["Loan","SomeCoin"],web3);

app.get('/', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  console.log("/")
  res.set('Content-Type', 'application/json');
  res.end(JSON.stringify({hello:"world"}));
});

app.get('/miner', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  console.log("/miner")
  res.set('Content-Type', 'application/json');
  res.end(JSON.stringify({address:accounts[DESKTOPMINERACCOUNT]}));
});

app.get('/tx/:id', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  let id = req.params.id.replace(/[\W_]+/g,"");
  console.log("/tx/"+id)
  try{
    res.end(fs.readFileSync("txs/"+id))
  }catch(e){
    res.end("{}")
  }

});

app.post('/issue', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  console.log("/issue",req.body)
  let id = web3.utils.randomHex(32)
  console.log("id",id)
  console.log(await clevis("version"))

  let counterfactualParams = `"Sweeper/Sweeper.abi" `+
  `"Sweeper/Sweeper.bytecode" `+
  `250000 `+
  `100000000000 `+
  id+" "+
  contracts.Loan._address+" "+
  contracts.SomeCoin._address+" "+
  req.body.loanAmount

  exec('/usr/local/bin/node counterfactual/craft.js '+counterfactualParams,async (err, stdout, stderr) => {
    if (err) {
      console.error("err",err);
      return;
    }
    if(stderr){
      console.log("ERROR:",stderr)
    }else{
      console.log("STDOUT:",stdout)
      let counterfactual = JSON.parse(stdout)
      console.log(counterfactual)

      if (!fs.existsSync("txs")){fs.mkdirSync("txs");}
      fs.writeFileSync("txs/"+id,stdout);

      //issue loan using clevis:
      let result = await clevis(
        "contract",
        "issue",
        "Loan",
        0,
        id,
        req.body.loanRecipient,
        contracts.SomeCoin._address,
        req.body.loanAmount
      )
      console.log(result)

      res.set('Content-Type', 'application/json');
      res.end(JSON.stringify({id,counterfactual,result}));
    }
  });

});

app.listen(1337);
console.log(`http listening on 1337`);
