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
const makeTransaction=(sender,receiver,amount,amount_there)=>
{
    
    
    var myAddress= getPublicFromWallet();

   
    if(myAddress==sender)
    {
        if(amount_there<amount)
        {
            console.log("Do not have the needed balance to do so")
            return [amount_there,false,"Do not have the needed balance to do so"]
        }
        
    return [amount_there-amount,true," Transaction valid"]
    }
    else if(myAddress==receiver)
    {
        return [amount_there,false,"Cannot be the receiver while mining this "];
    }
    else
    {
        return [amount_there,false,"SHould be either receiver or sender "]
    }

}



module.exports={makeTransaction,Transaction}