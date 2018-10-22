var ethers = require('ethers');
var fs = require('fs');
var Wallet = ethers.Wallet;

//usage: node index.js TO_ADDRESS TOKEN_ADDRESS TOKEN_AMOUNT

const wallet = ethers.Wallet.createRandom();
let httpProvider = new ethers.providers.JsonRpcProvider();
let abi = fs.readFileSync("../Sweeper/Sweeper.abi").toString()
let bytecode = fs.readFileSync("../Sweeper/Sweeper.bytecode").toString()
let factory = new ethers.ContractFactory(abi, bytecode, wallet);
let contractDeployTx = factory.getDeployTransaction(process.argv[2],process.argv[3],process.argv[4]);
//
//ADAPTED FROM https://github.com/LimeChain/IdentityProxy/blob/master/relayer_api/services/relayerService.js
//
contractDeployTx.gasLimit = 4500000
contractDeployTx.gasPrice = 100000000000
wallet.sign(contractDeployTx).then((signedDeployTx)=>{
  const signedTransNoRSV = signedDeployTx.substring(0, signedDeployTx.length - 134);
  let randomS = ethers.utils.keccak256(ethers.utils.randomBytes(3));
	randomS = '0' + randomS.substring(3, randomS.length);
  const counterfactualMagic = `1ba079be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798a0`;
	let counterfactualTx = `${signedTransNoRSV}${counterfactualMagic}${randomS}`;
  const parsedTrans = ethers.utils.parseTransaction(counterfactualTx);
	const counterfactualDeploymentPayer = parsedTrans.from;
	httpProvider.getTransactionCount(counterfactualDeploymentPayer).then((nonce)=>{
    const transaction = {
  		from: counterfactualDeploymentPayer,
  		nonce: nonce
  	};
  	const counterfactualContractAddress = ethers.utils.getContractAddress(transaction);
    console.log("counterfactualTx:",counterfactualTx)
    console.log("counterfactualContractAddress",counterfactualContractAddress)
  })
})
