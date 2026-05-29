# Stage 1 — pruner
# Analyse le monorepo Turborepo et extrait uniquement les fichiers nécessaires
# à l'app "pwa" (package.json, lockfile, sources). Cela évite de copier
# l'intégralité du monorepo dans les stages suivants.
FROM node:24-bookworm-slim AS pruner
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune pwa --docker

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
FROM node:24-bookworm-slim AS builder
WORKDIR /app
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ARG API_URL
ENV API_URL=$API_URL
# Vars utilisées par next.config.js (rewrite /assets/*) et par le helper assetUrl().
# Doivent être présentes au BUILD car Next.js gèle les rewrites dans .next/required-server-files.json
# au moment de `next build` ; les changer en runtime ne sert à rien en mode standalone.
ARG NEXT_PUBLIC_ASSETS_BASE_URL
ENV NEXT_PUBLIC_ASSETS_BASE_URL=$NEXT_PUBLIC_ASSETS_BASE_URL
ARG MINIO_INTERNAL_URL
ENV MINIO_INTERNAL_URL=$MINIO_INTERNAL_URL
ARG S3_BUCKET
ENV S3_BUCKET=$S3_BUCKET
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
COPY --from=builder /app/apps/pwa/.next/standalone/ .
COPY --from=builder /app/apps/pwa/.next/static/ apps/pwa/.next/static/
COPY --from=builder /app/apps/pwa/public/ apps/pwa/public/

EXPOSE 3001

CMD ["node", "apps/pwa/server.js"]
