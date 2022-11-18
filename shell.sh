#bin/bash
docker compose up  $1 $2 $3
sleep 10
curl -X POST http://localhost:3003/addPeer -H "Content-Type: application/json"   -d '{ "peer": [
        "ws://node1:localhost:6001",
        "ws://node2:localhost:6001"
    ]                              
}'

curl -X POST http://localhost:3002/addPeer -H "Content-Type: application/json"   -d '{ "peer": [
        "ws://node1:localhost:6001" 
    ]                              
}'