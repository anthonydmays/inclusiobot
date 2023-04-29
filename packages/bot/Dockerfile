FROM --platform=linux/amd64 node:lts-alpine

WORKDIR /usr/src/bot

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
RUN npm run deploy-commands

ARG API_VERSION
ENV INCLUSIO_API_VERSION=$API_VERSION

CMD [ "node", "dist/index.js" ]