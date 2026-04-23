FROM node:24-bookworm-slim AS pruner
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune api --docker && \
    npm install -g prisma && \
    npm install dotenv && \
    cd apps/api && \
    npx prisma generate

FROM node:24-bookworm-slim AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json
COPY --from=pruner /app/turbo.json ./turbo.json
RUN npm ci

FROM node:24-bookworm-slim AS builder
WORKDIR /app
COPY --from=installer /app/ .
COPY --from=pruner /app/out/full/ .
RUN npm run build

FROM node:24-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/ .
RUN apt-get update -y && \
    apt-get install -y openssl

EXPOSE 8000

CMD ["node", "apps/api/dist/src/main"]