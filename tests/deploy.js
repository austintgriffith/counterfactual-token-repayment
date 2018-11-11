const clevis = require("./clevis.js")
for(let c in clevis.contracts){
  //skip Sweeper deploy
  if(clevis.contracts[c]!="Sweeper") clevis.deploy(clevis.contracts[c],0)
}
