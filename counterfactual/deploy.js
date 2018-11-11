var ethers = require('ethers');
let httpProvider = new ethers.providers.JsonRpcProvider();
//let httpProvider = ethers.getDefaultProvider('rinkeby');
console.log("Sending...")
httpProvider.sendTransaction(process.argv[2]).then((result)=>{
  console.log(result)
})
