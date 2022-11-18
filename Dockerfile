FROM node:16.13.0-alpine

COPY package.json ./
ENTRYPOINT npm start 
