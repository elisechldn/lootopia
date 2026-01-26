FROM node:24-bookworm-slim AS build

WORKDIR /server


COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]

