FROM node:16-alpine

WORKDIR /app

RUN apk add --no-cache python3 py3-pip
COPY package*.json ./
RUN npm install

COPY req.txt ./
RUN pip3 install -r req.txt

COPY . .

EXPOSE 5000

VOLUME ["/app/node_modules"]
CMD sh -c "npx webpack --mode development --watch & python3 server.py"
