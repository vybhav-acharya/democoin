FROM node:16.13.0-alpine
COPY . ./

ENTRYPOINT npm install && npm start