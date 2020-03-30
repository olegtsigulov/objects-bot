FROM node:13

RUN mkdir -p /usr/src/objects-bot/
WORKDIR /usr/src/objects-bot/

COPY . /usr/src/objects-bot/package.json
RUN npm install

CMD ["node", "bin/service.js"]
