# Stage 1 — pruner
# Analyse le monorepo Turborepo et extrait uniquement les fichiers nécessaires
# à l'app "web" (package.json, lockfile, sources). Cela évite de copier
# l'intégralité du monorepo dans les stages suivants.
FROM node:24-bookworm-slim AS pruner
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune web --docker

# Stage 2 — installer
# Installe les dépendances npm en mode CI (reproductible, sans mise à jour
# du lockfile) à partir des manifestes extraits par le stage pruner.
# Séparer l'installation des dépendances de la compilation permet de mettre
# en cache cette couche tant que les dépendances ne changent pas.
FROM node:24-bookworm-slim AS installer
WORKDIR /app
COPY --from=pruner /app/out/json .
COPY --from=pruner /app/turbo.json ./turbo.json
RUN npm ci

# Stage 3 — builder
# Compile l'application Next.js en mode production (output: standalone).
# Repart des node_modules du stage installer et des sources extraites par pruner.
# Les modèles Prisma générés sont copiés manuellement car turbo prune ne les
# inclut pas dans out/full (apps/api n'est pas une dépendance déclarée de web),
# alors que @repo/types les importe via un chemin relatif.
FROM node:24-bookworm-slim AS builder
WORKDIR /app
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
COPY --from=installer /app/ .
COPY --from=pruner /app/out/full .
RUN npm run build

# Stage 4 — runner
# Image finale de production : ne contient que le bundle Next.js standalone,
# les assets statiques et les fichiers publics. Le mode standalone génère un
# server.js autonome qui embarque uniquement les node_modules nécessaires,
# ce qui réduit considérablement la taille de l'image.
FROM node:24-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/web/.next/standalone/ .
COPY --from=builder /app/apps/web/.next/static/ apps/web/.next/static/
COPY --from=builder /app/apps/web/public/ apps/web/public/

EXPOSE 3000

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

