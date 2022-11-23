#bin/bash
docker compose up  -d $2 $3
echo "done with docker compose"

sleep 10

#/bin/bash 
xdg-open http://localhost:4001
#/bin/bash 
xdg-open http://localhost:4002
#/bin/bash 
xdg-open http://localhost:4003


