FROM --platform=linux/amd64 node:lts-alpine

WORKDIR /usr/src/bot

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
RUN npm run deploy-commands

CMD [ "node", "dist/index.js" ]