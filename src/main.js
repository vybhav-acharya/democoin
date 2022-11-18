var bodyParser =require( 'body-parser');
var express =require('express');
const cors = require('cors');

var {
    Block, generatenextBlockWithTransaction, generateRawNextBlock, getAccountBalance,
    getBlockchain,  connectToPeers, getSockets, initP2PServer,getBlocks
} =require( './blockchain');

var {getPublicFromWallet, initWallet} =require( './wallet');

const httpPort =process.env.HTTP_PORT||3001;

const p2pPort = process.env.P2P_PORT || 6001;

const initHttpServer = (myHttpPort) => {
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
        const newBlock = generateRawNextBlock();
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
  
    app.post('/mineTransaction', (req, res) => {
        // console.log(req.body)
        const sender = req.body.sender;
        const receiver=req.body.receiver;
        let amount = req.body.amount;
        amount=parseFloat(amount)
       
        const resp = generatenextBlockWithTransaction(sender,receiver, amount,getAccountBalance());
        
        res.status(200).json({"message":resp})
            
            
        
    });

   


    app.get('/peers', (req, res) => {
        res.send(getSockets().map((s) => s._socket.remoteAddress + ':' + s._socket.remotePort));
    });
    
        app.post('/addPeer', (req, res) => {
            let y=connectToPeers(req.body.peer);
            if(y)res.send("added successfully")
            else res.send("failed");
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
