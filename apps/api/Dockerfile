# Stage 1 — pruner
# Analyse le monorepo Turborepo et extrait uniquement les fichiers nécessaires
# à l'app "api" (package.json, lockfile, sources). Cela évite de copier
# l'intégralité du monorepo dans les stages suivants.
FROM node:24-bookworm-slim AS pruner
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune api --docker && \
    npm install -g prisma && \
    npm install dotenv && \
    cd apps/api && \
    npx prisma generate

# Stage 2 — installer
# Installe les dépendances npm en mode CI (reproductible, sans mise à jour
# du lockfile) à partir des manifestes extraits par le stage pruner.
# Séparer l'installation des dépendances de la compilation permet de mettre
# en cache cette couche tant que les dépendances ne changent pas.
FROM node:24-bookworm-slim AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json
COPY --from=pruner /app/turbo.json ./turbo.json
RUN npm ci

# Stage 3 — builder
# Compile le code source TypeScript de l'API en JavaScript (dist/).
# Repart des node_modules installés par le stage installer et ajoute
# les sources complètes extraites par le stage pruner.
# @repo/types est buildé explicitement en premier pour garantir que
# packages/types/dist/ existe avant que turbo compile l'API.
FROM node:24-bookworm-slim AS builder
WORKDIR /app
COPY --from=installer /app/ .
COPY --from=pruner /app/out/full/ .
RUN npm run build

# Stage 4 — runner
# Image finale de production : ne contient que le build compilé et les
# node_modules. Les outils de dev (turbo, sources TS, etc.) sont absents,
# ce qui réduit la taille de l'image et la surface d'attaque.
FROM node:24-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/ .
RUN apt-get update -y && \
    apt-get install -y openssl

EXPOSE 8000

CMD ["node", "apps/api/dist/src/main"]