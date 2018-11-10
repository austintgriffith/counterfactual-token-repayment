var fs = require("fs")
module.exports = [
  fs.readFileSync("Loan/Loan.address").toString(),
  fs.readFileSync("SomeCoin/SomeCoin.address").toString(),
  0
]
