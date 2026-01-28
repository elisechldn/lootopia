# -------- BUILD --------
FROM node:24-bookworm-slim AS build

WORKDIR /server

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# -------- PRODUCTION--------
FROM node:24-bookworm-slim AS production

WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /server/.next/standalone/ ./
COPY --from=build /server/.next/static/ ./.next/static/
COPY --from=build /server/public ./public

EXPOSE 3000

CMD ["node", "server.js"]

