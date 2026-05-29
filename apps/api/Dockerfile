# Stage 1 — pruner
# Analyse le monorepo Turborepo et extrait uniquement les fichiers nécessaires
# à l'app "api" (package.json, lockfile, sources).
FROM node:24-bookworm-slim AS pruner
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune api --docker

# Stage 2 — installer
# Installe les dépendances npm en mode CI (reproductible, sans mise à jour
# du lockfile). Prisma est inclus dans les devDependencies et sera installé
# par npm ci — pas besoin de l'installer globalement.
FROM node:24-bookworm-slim AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json
COPY --from=pruner /app/turbo.json ./turbo.json
RUN npm ci

# Stage 3 — builder
# Compile le code TypeScript et génère le client Prisma.
# prisma generate s'exécute ici car il a accès aux sources complètes
# et aux node_modules installés.
FROM node:24-bookworm-slim AS builder
WORKDIR /app
COPY --from=installer /app/ .
COPY --from=pruner /app/out/full/ .
RUN cd apps/api && npx prisma generate
RUN npm run build

# Stage 4 — runner
# Image finale de production : build compilé et node_modules uniquement.
FROM node:24-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/ .
RUN apt-get update -y && \
    apt-get install -y openssl

EXPOSE 8000

CMD ["node", "apps/api/dist/src/main"]