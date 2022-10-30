# democoin
Trying to build a cryptocurrency on the distributed blockchain ledger using web sockets and nodejs

Steps for running
1) Clone the repo: git clone https://github.com/vybhav-acharya/democoin.git
2) Navigate to the folder and run: docker-compose up --build(make sure you have docker installed) 
3) run the requests in order mentioned (Import the requests file into postman)


BlockChain 

A set of blocks which are connected to each other using hashes , whose copy is stored with all the nodes in the network 
Data held in each block in blockchain- transactions

Transactions

Each transaction has a sender and a receiver , with a specified amount. This data is digitally signed.
Each sender/receiver has an address which comrpises of two parts- public key and private key. 
Each transaction , when sent by the sender is digitally signed with their private key. 
When this transaction reaaches the other nodes , the nodes verify that this transaction is legit when they verify the details with the public key aka the address of the sender of the trasaction


P2P system

We have used web sockets for each node to communicate with the other nodes.
The nodes which either mine a transaction/block will boradcast this detail to all the other nodes.The other nodes will always have their web sockets in listening mode , therfore updating themselves on correct verification

PoW-Proof of Work

Each hash is created with a proof of work- we have implemented a simple problem. The new hash which is generated should have the difficulty of 0s in its value

Working:

Initally the docker deployment will spin up 3 nodes, which will have HTTP and websocket urls
The nodes need to be connected to each other using the /addPeer request.
Make sure that each node has 2 values in the response when /peers request is sent.(Each node needs to be connected to the other nodes)
Now we can figure out any node address with /address api call, which will be a public key of each node
Rules
For every transaction, the sender has to be the which makes the transaction.
All transactions have to be mined before a concurrent transaction can be made


