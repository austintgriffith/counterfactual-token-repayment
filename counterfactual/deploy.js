var ethers = require('ethers');
let httpProvider = new ethers.providers.JsonRpcProvider();
console.log("Sending...")
httpProvider.sendTransaction(process.argv[2]).then((result)=>{
  console.log(result)
})
