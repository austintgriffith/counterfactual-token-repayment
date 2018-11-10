var ethers = require('ethers');
var fs = require('fs');
var Wallet = ethers.Wallet;
//usage: node craft.js ABI_FILE BYTECODE_FILE GAS_LIMIT GAS_PRICE [...CONSTRUCTOR ARGUMENTS]
//node craft.js "../Sweeper/Sweeper.abi" "../Sweeper/Sweeper.bytecode" 250000 100000000000 (cat ../Loan/Loan.address) (cat ../SomeCoin/SomeCoin.address) 1
const wallet = ethers.Wallet.createRandom();
let httpProvider = new ethers.providers.JsonRpcProvider();
let abi = fs.readFileSync(process.argv[2]).toString()
let bytecode = fs.readFileSync(process.argv[3]).toString()
let factory = new ethers.ContractFactory(abi, bytecode, wallet);
let contractDeployTx = factory.getDeployTransaction(...process.argv.splice(6));
//
//ADAPTED FROM https://github.com/LimeChain/IdentityProxy/blob/master/relayer_api/services/relayerService.js
//
contractDeployTx.gasLimit = parseInt(process.argv[4])
contractDeployTx.gasPrice = parseInt(process.argv[5])
wallet.sign(contractDeployTx).then((signedDeployTx)=>{
  const signedTransNoRSV = signedDeployTx.substring(0, signedDeployTx.length - 134);
  let randomS = ethers.utils.keccak256(ethers.utils.randomBytes(3));
  //add four cows to prove it's arbitrary and therefore random at a glance
  //  (there is no way someone controls this private key)
	randomS = '0' + randomS.substring(3, randomS.length-16)+"beefbeefbeefbeef";
  const counterfactualMagic = `1ba079be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798a0`;
	let counterfactualTx = `${signedTransNoRSV}${counterfactualMagic}${randomS}`;
  const parsedTrans = ethers.utils.parseTransaction(counterfactualTx);
	const counterfactualDeploymentPayer = parsedTrans.from;
	httpProvider.getTransactionCount(counterfactualDeploymentPayer).then((nonce)=>{
    const transaction = {
  		from: counterfactualDeploymentPayer,
  		nonce: nonce
  	};
    console.log("\ntransactionForValidationWithoutSig:",signedTransNoRSV)
  	const counterfactualContractAddress = ethers.utils.getContractAddress(transaction);
    console.log("\ncounterfactualTx:",counterfactualTx)
    console.log("\ncounterfactualFrom (will need "+(contractDeployTx.gasPrice*contractDeployTx.gasLimit)/10**18+"ETH):",counterfactualDeploymentPayer)
    console.log("\ncounterfactualContractAddress:",counterfactualContractAddress)
  })
})
