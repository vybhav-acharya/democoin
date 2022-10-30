var bodyParser =require( 'body-parser');
var express =require('express');


var {
    Block, generatenextBlockWithTransaction, generateRawNextBlock, getAccountBalance,
    getBlockchain,  connectToPeers, getSockets, initP2PServer,getBlocks
} =require( './blockchain');

var {getPublicFromWallet, initWallet} =require( './wallet');

const httpPort =process.env.HTTP_PORT || 3001;
const p2pPort = process.env.P2P_PORT || 6001
;

const initHttpServer = (myHttpPort) => {
    const app = express();
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
        console.log(getBlockchain())
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
        res.send({'address': address});
    });
  
    app.post('/mineTransaction', (req, res) => {
        const sender = req.body.data.sender;
        const receiver=req.body.data.receiver;
        const amount = req.body.data.amount;
        try {
            const resp = generatenextBlockWithTransaction(sender,receiver, amount,getAccountBalance());
            res.send(resp)
            
            
        } catch (e) {
            console.log(e.message);
            res.status(400).send(e.message);
        }
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
