var bodyParser =require( 'body-parser');
var express =require('express');
const cors = require('cors');

var {
    Block, generateTransaction, generateRawNextBlock, getAccountBalance,
    getBlockchain,  connectToPeers, getSockets, initP2PServer,getBlocks
} =require( './blockchain');
var {Transaction}=require('./transaction')
var {getPublicFromWallet, initWallet} =require( './wallet');

const httpPort =process.env.HTTP_PORT||3001;

const p2pPort = process.env.P2P_PORT || 6001;

const initHttpServer = (myHttpPort) => 
{
    const app = express();
    app.use(cors())
    app.use(bodyParser.json());

    app.use((err, req, res, next) => {
        if (err) {
            res.status(400).send(err.message);
        }
    });
    app.get('/transactions',(req,res)=>{
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(getBlocks()));
    })

    app.get('/blocks', (req, res) => {
        // console.log(getBlockchain())
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(getBlockchain()));
    });



    app.get('/mineBlock', (req, res) => {
        const newBlock = generateRawNextBlock(httpPort);
        if (newBlock === null) {
            res.status(400).send('could not generate block');
        } else {
            res.send(newBlock);
        }
    });

    app.get('/balance', (req, res) => {
        const balance = getAccountBalance();
        res.send({'balance': balance});
    });

    app.get('/address', (req, res) => {
        const address = getPublicFromWallet();
       
        res.status(200).json({'address': address})
        
    });
  
    app.post('/createTransaction', (req, res) => {
        const transaction=new Transaction(req.body.sender,req.body.receiver,parseFloat(req.body.amount))
        
        console.log(transaction)
        const resp = generateTransaction(transaction);
        res.status(200).json({"message":resp})  
    });
    app.get('/peers', (req, res) => {
        res.send(getSockets().map((s) => s._socket.remoteAddress + ':' + s._socket.remotePort));
    });
        app.get('/addPeer', (req, res) => {
            let data
            if(process.env.HTTP_PORT=="3003")
            {
                data=["ws://node2:localhost:6001",
                "ws://node1:localhost:6001"]
            }
            if(process.env.HTTP_PORT=="3002")
            {
                data=[
                "ws://node1:localhost:6001"]
            }
            if(process.env.HTTP_PORT=="3001")res.status(200).send("No peers to add")
            else{
            // let y=connectToPeers(req.body.peer);
            let y=connectToPeers(data);
            if(y)res.status(200).send("added successfully")
            else res.status(500).send("failed");
            }
        });
   

    app.post('/stop', (req, res) => {
        res.send({'msg' : 'stopping server'});
        process.exit();
    });

    app.listen(myHttpPort, () => {
        console.log('Listening http on port: ' + myHttpPort);
    });
};

initHttpServer(httpPort);
initP2PServer(p2pPort);
initWallet();
