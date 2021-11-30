FROM node:alpine

WORKDIR /app

RUN mkdir server

COPY ./server/package.json ./server
COPY ./server/package-lock.json ./server
COPY package.json .
COPY package-lock.json .

RUN npm i
COPY . .

ENV PORT=3000
EXPOSE 3000

CMD ["npm", "run", "start"]
