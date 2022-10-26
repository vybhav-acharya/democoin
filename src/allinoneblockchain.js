var CryptoJS=require('crypto-js');
var  WebSocket =require('ws');
var {Server} =require( 'ws');

var {hexToBinary}=require("./utils")
var _=require('lodash')


var {createTransaction, findUnspentTxOuts, getBalance, getPrivateFromWallet, getPublicFromWallet} =require( './wallet');
const { makeTransaction } = require('./allinone');

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

const genesisTransaction = {
    'txIns': [{'signature': '', 'txOutId': '', 'txOutIndex': 0}],
    'txOuts': [{
        'address': 'starter',
        'amount': 50
    }],
    'id': 'e655f6a5f26dc9b4cac6e46f52336428287759cf81ef5ff10854f69d68f43fa3'
};

const genesisBlock = new Block(
    0, '91a73664bc84c0baa1fc75ea6e4aa6d1d20c5df664c724e3159aefc2e1186627', '', 1465154705, [genesisTransaction], 10, 0
);

let blockchain = [];

// the unspent txOut of genesis block is set to unspentTxOuts on startup


const getBlockchain = ()=> blockchain;


// and txPool should be only updated at the same time

var getLatestBlock = () =>  blockchain[blockchain.length - 1];




// difficulty increased every 10 blocks mined
const getDifficulty = (aBlockchain) => {
    const latestBlock = aBlockchain[aBlockchain.length - 1];
    
    
    if (latestBlock.index %10==0) {
        return latestBlock.difficulty+1;
    } 
      
    return latestBlock.difficulty;
};



const generateRawNextBlock = (blockData) => {
    if(blockchain.length>0){
    const previousBlock = blockchain[blockchain.length-1] ;
    console.log("in generaterawblock with previous index"+previousBlock.index)
    const difficulty = getDifficulty(blockchain);
    console.log("in generaterawblock with difficulty"+difficulty)
    const nextIndex = previousBlock.index + 1;
    console.log("in generaterawblock with nextIndex"+nextIndex)
    const nextTimestamp =  Math.round(new Date().getTime() / 1000);
    const newBlock = findBlock(nextIndex, previousBlock.hash, nextTimestamp, blockData, difficulty);
    if (addBlockToChain(newBlock)) {
        console.log("done with adding to chain")
        broadcastLatest(newBlock);
        return newBlock;
    } else {
        return null;
    }

}
else{
    console.log("we here in generateRawBlock")
    const newBlock = findBlock(1, "91a73664bc84c0baa1fc75ea6e4aa6d1d20c5df664c724e3159aefc2e1186627",  Math.round(new Date().getTime() / 1000), blockData, 0);
    if (addBlockToChain(newBlock)) {
        console.log("done with adding to chain")
        broadcastLatest(newBlock);
        return newBlock;
    } else {
        return null;
    }
}

};

// gets the unspent transaction outputs owned by the wallet


let amount_here=50
const generatenextBlockWithTransaction = (sender,receiver,amount) => {
 
    const resp=makeTransaction(sender,receiver,amount,amount_here)
    console.log("in generatenextBlockwithtransaction. amount is "+resp[0])
    amount_here=resp[0]
   
    if(resp[1]==false)
    return resp[2]

    amount_here=resp[0]
    
    const blockData ={"sender":sender,"receiver":receiver,"amount":amount}
    console.log(blockData)
    console.log("donw with generate block with transaction")
    return generateRawNextBlock(blockData);
};

const findBlock = (index, previousHash, timestamp, data, difficulty) => {
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


const calculateHashForBlock = (block) =>
    calculateHash(block.index, block.previousHash, block.timestamp, block.data, block.difficulty, block.nonce);

const calculateHash = (index, previousHash, timestamp, data,
                       difficulty, nonce) =>
    CryptoJS.SHA256(index + previousHash + timestamp + data + difficulty + nonce).toString();




const getAccumulatedDifficulty = (aBlockchain) => {
    return aBlockchain
        .map((block) => block.difficulty)
        .map((difficulty) => Math.pow(2, difficulty))
        .reduce((a, b) => a + b);
};

const isValidTimestamp = (newBlock, previousBlock) => {
    return ( previousBlock.timestamp - 60 < newBlock.timestamp )
        && newBlock.timestamp - 60 < getCurrentTimestamp();
};


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
   if(transaction.data.index<=blockchain.length)return;
    var ret=0
    var myAddress=getPublicFromWallet()
    console.log("In UpdateAmount "+transaction.data.amount)
    // if(transaction.sender!=undefined || transaction.receiver!=undefined || transaction.amount!=undefined)
    // {console.log("no updates since not ccorrect in updateamount")
    // return ;}
    if(transaction.data.sender!=myAddress)
        blockchain.push(transaction)
       
            if(transaction.data.receiver==myAddress)
            {
                ret+=transaction.data.amount
            }
            amount_here+=ret;

    }
 
    

const addBlockToChain = (newBlock) => {
     
            blockchain.push(newBlock);
            console.log("In addblocktochain")
            return true;
        };
    
  
const sockets = [];

var MessageType ={
    QUERY_LATEST: 0,
    QUERY_ALL : 1,
    RESPONSE_BLOCKCHAIN : 2,
    QUERY_TRANSACTION_POOL : 3,
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
                    console.log(receivedBlocks.data)
                    updateAmount(receivedBlocks.data);
                  
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

const queryAllMsg = () => ({'type': MessageType.QUERY_ALL, 'data': null});

const responseChainMsg = () => ({
    'type': MessageType.RESPONSE_BLOCKCHAIN, 'data':getBlockchain()
});

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

const handleBlockchainResponse = (receivedBlocks) => 
    {
        console.log(`in handleBlock response `)
    if (receivedBlocks.length === 0) {
        console.log('received block chain size of 0');
        return;
    }
    const latestBlockReceived = receivedBlocks;
   
    var latestBlockHeld =getLatestBlock()
    console.log(latestBlockReceived,latestBlockReceived.data.index)
    
    if (latestBlockReceived.data.index > latestBlockHeld.index) {
        console.log(' In handleBlockchainresponse:blockchain possibly behind. We got: '
            + latestBlockHeld.index + ' Peer got: ' + latestBlockReceived.index);
        if (latestBlockHeld.hash === latestBlockReceived.data.previousHash) {
            if (addBlockToChain(latestBlockReceived)) {
                broadcast(responseLatestMsg());
            }
        } else if (receivedBlocks.length === 1) {
            console.log('In handleBlockchainresponse:We have to query the chain from our peer');
            broadcast(queryAllMsg());
        } else {
            console.log('In handleBlockchainresponse:Received blockchain is longer than current blockchain');
            replaceChain(receivedBlocks);
        }
    } else {
        console.log('In handleBlockchainresponse:received blockchain is not longer than received blockchain. Do nothing');
    }
};

const broadcastLatest = (block) => {
    broadcast(responseLatestMsg(block));
};

const connectToPeers = (newPeer) => {
    const ws = new WebSocket(newPeer);
    ws.on('open', () => {
        initConnection(ws);
    });
    ws.on('error', () => {
        console.log('connection failed');
    });
};

const broadCastTransactionPool = () => {
    broadcast(responseTransactionPoolMsg());
};


module.exports= {
    Block, getBlockchain, getLatestBlock, 
    generateRawNextBlock,  generatenextBlockWithTransaction,
    
    getAccountBalance, addBlockToChain,connectToPeers, broadcastLatest, broadCastTransactionPool, initP2PServer, getSockets
};

// const isValidNewBlock = (newBlock, previousBlock) => {
 
//     if (previousBlock.index + 1 !== newBlock.index) {
//         console.log('invalid index');
//         return false;
//     } else if (previousBlock.hash !== newBlock.previousHash) {
//         console.log('invalid previoushash');
//         return false;
//     } else if (!isValidTimestamp(newBlock, previousBlock)) {
//         console.log('invalid timestamp');
//         return false;
//     } else if (!hasValidHash(newBlock)) {
//         return false;
//     }
//     return true;
// };