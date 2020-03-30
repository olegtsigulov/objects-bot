FROM node:13

RUN mkdir -p /usr/src/objects-bot/
WORKDIR /usr/src/objects-bot/

COPY . /usr/src/objects-bot/package.json
RUN npm install

COPY . /usr/src/objects-bot/

CMD ["node", "bin/service.js"]
