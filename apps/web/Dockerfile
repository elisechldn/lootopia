FROM node:24-bookworm-slim AS pruner
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune web --docker

FROM node:24-bookworm-slim AS installer
WORKDIR /app
COPY --from=pruner /app/out/json .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json
COPY --from=pruner /app/turbo.json ./turbo.json
RUN npm ci

FROM node:24-bookworm-slim AS builder
WORKDIR /app
COPY --from=installer /app/ .
COPY --from=pruner /app/out/full .
RUN npm run build

FROM node:24-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/web/.next/standalone/ .
COPY --from=builder /app/apps/web/.next/static/ .next/static/
COPY --from=builder /app/apps/web/public/ public/
CMD ["node", "apps/web/server.js"]


# # -------- BUILD --------
# FROM node:24-bookworm-slim AS build
# WORKDIR /app
# COPY package*.json ./
# RUN npm ci
# COPY . .
# RUN npm run build

# # -------- PRODUCTION--------
# FROM node:24-bookworm-slim AS production
# WORKDIR /app
# ENV NODE_ENV=production
# COPY --from=build /app/.next/standalone/ ./
# COPY --from=build /app/.next/static/ ./.next/static/
# COPY --from=build /app/public ./public
# EXPOSE 3000
# CMD ["node", "server.js"]

