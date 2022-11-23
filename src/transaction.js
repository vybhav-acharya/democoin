const { get } = require("lodash");
const { getPrivateFromWallet ,getPublicKey, getPublicFromWallet} = require("./wallet");
class Transaction{
    constructor(sender,receiver,amount,signature)
    {
        this.sender=sender
        this.receiver=receiver
        this.amount=amount
        this.signature=signature
    }
}
const makeTransaction=(transaction,amount_there,blocks,l)=>
{
    var{sender,receiver,amount}=transaction
    
    var myAddress= getPublicFromWallet();
    for(let i in blocks)
    {
        
        if(blocks[i].sender==myAddress )
        return [amount_there,false,"mine all the blocks before doing these transactions"]
    }
 

  
    if(myAddress==sender &&  receiver!=myAddress && receiver!="")
    {
        if(amount_there<amount)
        {
            
            return [amount_there,false,"Do not have the needed balance to do so"]
        }
        
    return [amount_there-amount,true," Transaction valid"]
    }
    else if(myAddress==receiver && sender=="" && l==0)
    {
        return [amount,true," valid "];
    }
    else if(sender=="" && receiver=="")
    {
        return [amount_there,false,"Both cannot be null"]
    }
    else
    {
        return [amount_there,false,"Transaction is invalid"]
    }
}

var accounter=(blockchain,reward)=>{
    let am=0;
    var myAddress= getPublicFromWallet();
    for(let i=0;i<blockchain.length;i++)
    {
        
        if(blockchain[i].data.sender==myAddress)
        am-=blockchain[i].data.amount
        else if(blockchain[i].data.receiver==myAddress)
        am+=blockchain[i].data.amount

        if(blockchain[i].miner==process.env.HTTP_PORT)
        am+=reward
    }

    return am;
}

module.exports={makeTransaction,Transaction,accounter}