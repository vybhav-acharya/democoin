const { get } = require("lodash");
const { getPrivateFromWallet ,getPublicKey, getPublicFromWallet} = require("./wallet");
class Transaction{
    constructor(sender,receiver,amount)
    {
        this.sender=sender
        this.receiver=receiver
        this.amount=amount
    }
}
const makeTransaction=(sender,receiver,amount,amount_there,blocks)=>
{
    var myAddress= getPublicFromWallet();
    for(let i in blocks)
    {
        console.log("in make transaction",blocks[i])
        if(blocks[i].sender==myAddress || blocks[i].receiver==myAddress)
        return [amount_there,false,"mine all the blocks before doing this transactions"]
    }
 

  
    if(myAddress==sender)
    {
        if(amount_there<amount)
        {
            console.log("Do not have the needed balance to do so")
            return [amount_there,false,"Do not have the needed balance to do so"]
        }
        
    return [amount_there-amount,true," Transaction valid"]
    }
    else if(myAddress==receiver && sender=="")
    {
        return [amount,true," valid "];
    }
   
    else
    {
        return [amount_there,false,"SHould be sender to make this transaction"]
    }

}



module.exports={makeTransaction,Transaction}