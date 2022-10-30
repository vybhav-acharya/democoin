var CryptoJS=require('crypto-js');
var  WebSocket =require('ws');
var {Server} =require( 'ws');
var crypto=require('crypto')

var {hexToBinary,toHexString}=require("./utils")



var {  validateTransaction,sign,getPublicFromWallet} =require( './wallet');
const { makeTransaction } = require('./transaction');

class Block {



    constructor(index , hash, previousHash,
                timestamp, data, difficulty, nonce) {
        this.index = index;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.data = data;
        this.hash = hash;
        this.difficulty = difficulty;
        this.nonce = nonce;
        
    }
}


let blockchain = [];
let blocks=[]
let difficulty=0

// the unspent txOut of genesis block is set to unspentTxOuts on startup


const getBlockchain = ()=> blockchain;
const getBlocks=()=>blocks


// and txPool should be only updated at the same time
var getLatestBlockData=()=>blocks[blocks.length-1]
var getLatestBlock = () =>  blockchain[blockchain.length - 1];




// difficulty increased every 10 blocks mined
const getDifficulty = (aBlockchain) => {
 
    
    if(aBlockchain.length==0)return 0;
    if (aBlockchain.length %10==0) {
        return getLatestBlock().difficulty+1
    } 
      
    return  getLatestBlock().difficulty;
};



const generateRawNextBlock = () => {
   
    if(blocks.length>0){
        let newBlock;
        if(blockchain.length==0)
        {
            const difficulty = getDifficulty(blockchain);
        console.log("in generaterawblock with difficulty"+difficulty)
        const nextIndex = blockchain.length+1;
        console.log("in generaterawblock with nextIndex"+nextIndex)
        const nextTimestamp =  Math.round(new Date().getTime() / 1000);
             newBlock = findBlock(1, "316534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7", nextTimestamp, getLatestBlockData(), difficulty);

        }
        else
        {
            
    
           
            const previousBlock = getLatestBlock()
    console.log("in generaterawblock with previous index"+previousBlock.index)
    const difficulty = getDifficulty(blockchain);
    console.log("in generaterawblock with difficulty"+difficulty)
    const nextIndex = blockchain.length+1;
    console.log("in generaterawblock with nextIndex"+nextIndex)
    const nextTimestamp =  Math.round(new Date().getTime() / 1000);
    
     newBlock = findBlock(nextIndex, previousBlock.hash, nextTimestamp, blocks[blocks.length-1], difficulty);
        }

    
        var myAddress=getPublicFromWallet()
        
        blockchain.push(newBlock)
       if(newBlock.data.receiver==myAddress)
       amount_here+=newBlock.data.amount
       if(newBlock.data.sender==myAddress)
       amount_here-=newBlock.data.amount
        blocks.pop()
        broadcastLatest(newBlock);
        return newBlock;
  
}
else{
   
   return "No more blocks to be mined "
}

};

// gets the unspent transaction outputs owned by the wallet


let amount_here=0
const generatenextBlockWithTransaction = (sender,receiver,amount) => {
 
    const resp=makeTransaction(sender,receiver,amount,amount_here,blocks)
    console.log("in generatenextBlockwithtransaction. amount is "+resp[0])
  
   
    if(resp[1]==false)
    return resp[2]
    let blockData ={"sender":sender,"receiver":receiver,"amount":amount}
    
  
   
    
    let    signature=sign(blockData,sender)
    blockData["signature"]=signature
    console.log("donw with generate block with transaction")
    if(validateTransaction(blockData,sender))
        {blocks.push(blockData)
        broadcastData(blockData);}
    return blockData
    
};

const findBlock = (index, previousHash, timestamp, data, difficulty,signature) => {
    let nonce = 0;
    console.log("we here in findBlock")
    while (true) {
        const hash= calculateHash(index, previousHash, timestamp, data, difficulty, nonce);
        if (hashMatchesDifficulty(hash, difficulty)) {
            return new Block(index, hash, previousHash, timestamp, data, difficulty, nonce);
        }
        nonce++;
    }
};

const getAccountBalance = () => {
    return amount_here;
};




const calculateHash = (index, previousHash, timestamp, data,
                       difficulty, nonce) =>
    CryptoJS.SHA256(index + previousHash + timestamp + data + difficulty + nonce).toString();



const hashMatchesDifficulty = (hash, difficulty) => {
    console.log("we here in hashmatchesdifficulty, difficulty being "+difficulty)
    if(difficulty===0)return true;
    console.log("came here ;(")
    const hashInBinary = hexToBinary(hash);
    let requiredPrefix=''
    for(let i=0;i<difficulty.valueOf() ;i++)requiredPrefix+='0'
    
    return hashInBinary.startsWith(requiredPrefix);
};


 
const updateAmount =(transaction)=>{
   
    var ret=0
    var myAddress=getPublicFromWallet()
    console.log("In UpdateAmount "+transaction.data.amount)
    // if(transaction.sender!=undefined || transaction.receiver!=undefined || transaction.amount!=undefined)
    // {console.log("no updates since not ccorrect in updateamount")
    // return ;}
    
        blockchain.push(transaction)
       
            if(transaction.data.receiver==myAddress)
            {
                ret+=transaction.data.amount
            }
            if(transaction.data.sender==myAddress)

            {
                ret-=transaction.data.amount
            }
            amount_here+=ret;


    }
 
    


    
  
const sockets = [];

var MessageType ={
    QUERY_LATEST: 0,
    QUERY_ALL : 1,
    RESPONSE_BLOCKCHAIN : 2,
    SENDING_DATA : 3,
    RESPONSE_TRANSACTION_POOL : 4
}

class Message {
  
    constructor(type,data)
    {
        this.type=type
        this.data=data
    }
}

const initP2PServer = (p2pPort) => {
    const server = new WebSocket.Server({port: p2pPort});
    console.log("came to initp2pserver")
    server.on('connection', (ws) => {
        initConnection(ws);
    });
    console.log('listening websocket p2p port on: ' + p2pPort);
};

const getSockets = () => sockets;

const initConnection = (ws) => {
    console.log("We came to initConnection")
    sockets.push(ws);
    initMessageHandler(ws);
    initErrorHandler(ws);
    write(ws, queryChainLengthMsg());

    // query transactions pool only some time after chain query
    // setTimeout(() => {
    //     broadcast(queryTransactionPoolMsg());
    // }, 500);
};



const initMessageHandler = (ws) => {
    ws.on('message', (data) => {

        try {
            console.log("we in initmessagehandller")
            const message = JSON.parse(data)
            if (message === null) {
                console.log('could not parse received JSON message: ' + data);
                return;
            }
            console.log('Received message: %s',message);
            switch (message.type) {
                case MessageType.QUERY_LATEST:
                    write(ws, "added the peer succesfully");
                    break;
                case MessageType.QUERY_ALL:
                    // write(ws, "we in query_all"+responseChainMsg());
                    write(ws,"we in queryall")
                    break;
                case MessageType.RESPONSE_BLOCKCHAIN:
                    const receivedBlocks = message;
                    if (receivedBlocks === null) {
                        console.log('invalid blocks received: %s', JSON.stringify(message.data));
                        break;
                    }
                   
                    blocks.pop()
                    console.log(blocks)
                    updateAmount(receivedBlocks.data);
                  
                    break;
                case MessageType.SENDING_DATA:
                    if(validateTransaction(message.data))
                       {blocks.push(message.data)
                        console.log("in initmessagehandler , successfully pushed")}
                    else
                    console.log("in initmessagehandler , failed to push block due to not valid signature")
                    break;
                default:
                    console.log("agilla macha @initMessageHandler")
            
            }
        } catch (e) {
            console.log(e);
        }
    });
};

const write = (ws, message) => ws.send(JSON.stringify(message));
const broadcast = (message) => sockets.forEach((socket) => write(socket, message));

const queryChainLengthMsg = () => ({'type': MessageType.QUERY_LATEST, 'data': "We in type 0"});


const responseLatestBlock=(blockData)=>({
    'type':MessageType.SENDING_DATA,
    'data':blockData
})
const responseLatestMsg = (block) => ({
    'type': MessageType.RESPONSE_BLOCKCHAIN,
    'data': block
});


const initErrorHandler = (ws) => {
    const closeConnection = (myWs) => {
        console.log('connection failed to peer: ' + myWs.url);
        sockets.splice(sockets.indexOf(myWs), 1);
    };
    ws.on('close', () => closeConnection(ws));
    ws.on('error', () => closeConnection(ws));
};



const broadcastLatest = (block) => {
    broadcast(responseLatestMsg(block));
};
const broadcastData = (block) => {
    broadcast(responseLatestBlock(block));
};

const connectToPeers = (li) => {
    for(let np in li)
    {   let newPeer=li[np]
    
        const ws = new WebSocket(newPeer);
    ws.on('open', () => {
        initConnection(ws);
    });
    ws.on('error', () => {
        console.log('connection failed');
    });
}
};

const broadCastTransactionPool = () => {
    broadcast(responseTransactionPoolMsg());
};


module.exports= {
    Block, getBlockchain, getLatestBlock, 
    generateRawNextBlock,  generatenextBlockWithTransaction,
    getBlocks,
    getAccountBalance,connectToPeers, broadcastLatest, broadCastTransactionPool, initP2PServer, getSockets
};

