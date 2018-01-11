FROM node:8

RUN apt-get update && \
    apt-get install -y git make gcc libssl-dev libgmp-dev libxml2-dev libxslt1-dev zlib1g-dev

COPY . /src

RUN npm install

CMD ["node", "/src/app.js"]
