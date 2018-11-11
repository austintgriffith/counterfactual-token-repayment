var fs = require("fs")
module.exports = [
  "0xe5bb513562e705c419d60a2ad2a2baa7ff835968b09315491cbbc3650f824713",
  fs.readFileSync("Loan/Loan.address").toString(),
  fs.readFileSync("SomeCoin/SomeCoin.address").toString(),
  0
]
