var CryptoJS=require('crypto-js');
var  WebSocket =require('ws');
var {hexToBinary}=require("./utils")
var {validateTransaction,sign,getPublicFromWallet} =require( './wallet');
const { makeTransaction,Transaction,accounter } = require('./transaction');
class Block {
    constructor(index , hash, previousHash,
                timestamp, data, difficulty, nonce,miner) {
        this.index = index;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.data = data;
        this.hash = hash;
        this.difficulty = difficulty;
        this.nonce = nonce;
        this.miner=miner;   
    }
}


var MessageType ={
    QUERY_LATEST: 0,
    QUERY_ALL : 1,
    RESPONSE_BLOCKCHAIN : 2,
    SENDING_DATA : 3,
    TRANSACTION_POOL : 4
}

class Message {
  
    constructor(type,data)
    {
        this.type=type
        this.data=data
    }
}
const sockets = [];
let blockchain = [];
let blocks=[]
let amount_here=0
let reward=5
const getBlockchain = ()=> blockchain;
const getBlocks=()=>blocks
var getLatestBlockData=()=>blocks[blocks.length-1]
var getLatestBlock = () =>  blockchain[blockchain.length - 1];
var getAccountBalance = () => {
   return accounter(blockchain,reward)
}
const calculateHash = (index, previousHash, timestamp, data,
    difficulty, nonce) =>
CryptoJS.SHA256(index + previousHash + timestamp + data + difficulty + nonce).toString();


const getDifficulty = (aBlockchain) => {
    if(aBlockchain.length==0)return 2;
    if (aBlockchain.length %10==0) {
        return getLatestBlock().difficulty+1
    } 
    return  getLatestBlock().difficulty;
};



const generateRawNextBlock = (httpPort) => {
   
    if(blocks.length>0){
        let newBlock;
        if(blockchain.length==0)
        {
        var difficulty = getDifficulty(blockchain);
        const nextIndex = blockchain.length+1;
        const nextTimestamp =  Math.round(new Date().getTime() / 1000);
        newBlock = findBlock(1, "316534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7", nextTimestamp, getLatestBlockData(), difficulty,httpPort);
        }
        else
        {
        const previousBlock = getLatestBlock()
    
        const difficulty = getDifficulty(blockchain);
    
        const nextIndex = blockchain.length+1;
        const nextTimestamp =  Math.round(new Date().getTime() / 1000);
    
        newBlock = findBlock(nextIndex, previousBlock.hash, nextTimestamp, blocks[blocks.length-1], difficulty,httpPort);
        }
        var myAddress=getPublicFromWallet()
        blockchain.push(newBlock)

        blocks.pop()
        broadcastLatest(newBlock);
        return newBlock;
}
else{return "No more blocks to be mined "}

};

const generateTransaction = (transaction) => {
    amount_here=accounter(blockchain,reward)
    const resp=makeTransaction(transaction,amount_here,blocks,blockchain.length)
    console.log("in generatenextBlockwithtransaction. amount is "+resp[0])
  
   
    if(resp[1]==false)
    return resp[2]
    
  
   
    
    let    signature=sign(transaction,transaction.sender)
    transaction["signature"]=signature
    
    if(validateTransaction(transaction,transaction.sender))
        {console.log("done with generate block with transaction")
            blocks.push(transaction)
        broadcastData(transaction);
        return "added the transaction"}
        return "not done transaction"
    
    
};

const findBlock = (index, previousHash, timestamp, data, difficulty,httpPort) => {
    let nonce = 0;
    console.log("we here in findBlock")
    while (true) {
        const hash= calculateHash(index, previousHash, timestamp, data, difficulty, nonce);
        if (hashMatchesDifficulty(hash, difficulty)) {
            return new Block(index, hash, previousHash, timestamp, data, difficulty, nonce,httpPort);
        }
        nonce++;
    }
};


const hashMatchesDifficulty = (hash, difficulty) => {
   
    if(difficulty===0)return true;
    const hashInBinary = hexToBinary(hash);
    let requiredPrefix=''
    for(let i=0;i<difficulty.valueOf() ;i++)requiredPrefix+='0'
    
    return hashInBinary.startsWith(requiredPrefix);
};


 
const updateAmount =(transaction)=>{
   
    var ret=0
    var myAddress=getPublicFromWallet()
    
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
 
    


    
  

const initP2PServer = (p2pPort) => {
    const server = new WebSocket.Server({port: p2pPort});

    server.on('connection', (ws) => {
        initConnection(ws);
    });
  
};
const getSockets = () => sockets;
const initConnection = (ws) => {
  
    sockets.push(ws);
    initMessageHandler(ws);
    initErrorHandler(ws);
    write(ws, queryChainLengthMsg());


};
const initMessageHandler = (ws) => {
    ws.on('message', (data) => {

        try {
            const message = JSON.parse(data)
            if (message === null) {
                return;
            }
            
            switch (message.type) {
                case MessageType.QUERY_LATEST:
                    write(ws, "added the peer succesfully");
                    if(blockchain.length>0)
                        write(ws,broadcastAll(blockchain))
                    if(blocks.length>0)
                        write(ws,broadcastAllT(blocks))
                    break;
                case MessageType.QUERY_ALL:
                    var receivedBlockChain=message.data
                    console.log(parseInt(receivedBlockChain[0].miner))
                    if(blockchain.length==0) {blockchain=receivedBlockChain
                    break;}
                    
                    if(parseInt(receivedBlockChain[0].timestamp)>parseInt(blockchain[0].timestamp))
                        break;
                        blockchain=receivedBlockChain
                    break;
                // case MessageType.TRANSACTION_POOL:
                //     var receivedTransactions=message.data
                //     if(parseInt(receivedBlockChain[0].miner)>parseInt(process.env.HTTP_PORT))
                //         break;
                
                //     blocks=receivedTransactions
                    
                    
                //     break;
                case MessageType.RESPONSE_BLOCKCHAIN:
                    const receivedBlocks = message;
                    if (receivedBlocks === null) {
                       
                        break;
                    }
                    blocks.pop()
                    updateAmount(receivedBlocks.data);
                  
                    break;
                case MessageType.SENDING_DATA:
                    if(validateTransaction(message.data))
                       {blocks.push(message.data)}
    
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

const responseAllBlocks=(blockChain)=>({
    'type': MessageType.QUERY_ALL,
    'data': blockChain
})
const responseAllBlocksT=(blockChain)=>({
    'type': MessageType.TRANSACTION_POOL,
    'data': blockChain
})
const initErrorHandler = (ws) => {
    const closeConnection = (myWs) => {
       
        sockets.splice(sockets.indexOf(myWs), 1);
    };
    ws.on('close', () => closeConnection(ws));
    ws.on('error', () => closeConnection(ws));
};

const broadcastAll=(blockchain)=>{
    broadcast(responseAllBlocks(blockchain))
}
const broadcastAllT=(blockchain)=>{
    broadcast(responseAllBlocksT(blockchain))
}

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
        // console.log('connection failed');
        return false
    });
}
return true
};


module.exports= {
    Block, getBlockchain, getLatestBlock, 
    generateRawNextBlock,  generateTransaction,
    getBlocks,
    getAccountBalance,connectToPeers, broadcastLatest, initP2PServer, getSockets
};

