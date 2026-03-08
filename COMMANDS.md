# HOWTO - Commandes du projet Lootopia

Ce document centralise les commandes utiles pour :
- installer le projet ;
- lancer le stack en local avec Docker/Compose ;
- ajouter des dependances dans ce monorepo npm workspaces.

## 1) Installation du projet

### Prerequis
- Node.js `>=18` (voir `package.json` racine).
- npm `11.x` recommande (`packageManager: npm@11.8.0`).
- Docker + Docker Compose plugin (`docker compose`).

### Installation initiale
Depuis la racine du repo :

```bash
npm install
```

### Commandes globales (racine)
Depuis la racine :

```bash
npm run dev
npm run build
npm run test
npm run lint
npm run check-types
npm run format
```

Ces scripts declenchent Turborepo sur tous les workspaces (`apps/*`, `packages/*`).

### Lancer un script sur un workspace cible
Depuis la racine :

```bash
npm run dev -w api
npm run build -w web
npm run check-types -w docs
npm run build -w @repo/types
```

## 2) Deploiement local avec Docker / Docker Compose

Le `compose.yml` expose les services suivants :
- `db` (Postgres + PostGIS) : `localhost:5432`
- `api` (NestJS) : `localhost:8000`
- `web` (Next.js) : `localhost:3000`
- `pgadmin` : `localhost:5050`

### Variables d'environnement minimales
Dans un fichier `.env` a la racine (utilise par Compose), definir :

```dotenv
POSTGRES_USER=lootopia
POSTGRES_PASSWORD=lootopia
POSTGRES_DB=lootopia
```

Optionnel (sinon valeurs par defaut dans `compose.yml`) :

```dotenv
PGADMIN_DEFAULT_EMAIL=lootopia@lootopia.com
PGADMIN_DEFAULT_PASSWORD=lootopia
```

Pour Prisma/Nest (API), `DATABASE_URL` doit etre au format PostgreSQL (et non `http://...`) :

```dotenv
DATABASE_URL="postgresql://lootopia:lootopia@localhost:5432/lootopia"
```

### Build et demarrage
Depuis la racine :

```bash
docker compose build
docker compose up -d
```

Ou en une commande :

```bash
docker compose up -d --build
```

### Commandes utiles en local

```bash
docker compose ps
docker compose logs -f
docker compose logs -f api
docker compose logs -f db
docker compose restart api
docker compose stop
docker compose down
```

### Reset complet (base comprise)
Attention : cette commande supprime aussi le volume de donnees Postgres.

```bash
docker compose down -v
docker compose up -d --build
```

### Rebuild sans cache

```bash
docker compose build --no-cache
docker compose up -d --force-recreate
```

### Commandes Docker (sans Compose)
Depuis la racine du repo :

```bash
docker build -t lootopia-api -f apps/api/Dockerfile .
docker build -t lootopia-web -f apps/web/Dockerfile .
docker build -t lootopia-db -f apps/db/Dockerfile .
```

Execution d'une image manuellement (exemple API) :

```bash
docker run --rm -p 8000:8000 --name lootopia_api lootopia-api
```

## 3) Installer de nouvelles dependances

### Regle generale (monorepo npm workspaces)
Toujours lancer les installations depuis la racine.

### Ajouter une dependance dans un workspace

```bash
npm install -w api <package>
npm install -w web <package>
npm install -w docs <package>
npm install -w @repo/types <package>
```

### Ajouter une dependance de dev dans un workspace

```bash
npm install -D -w api <package>
npm install -D -w web <package>
```

### Ajouter un outil pour la racine uniquement

```bash
npm install -D -W <package>
```

`-W` cible le workspace racine.

### Exemple Prisma (API Nest)

```bash
npm install -w api @prisma/client
npm install -D -w api prisma
```

Puis (selon besoin) :

```bash
npm exec -w api prisma generate
npm exec -w api prisma migrate dev --name init
```

## 4) Pieges frequents

- `docker compose down` n'efface pas les donnees de la DB ; utiliser `docker compose down -v` pour repartir de zero.
- Prisma lit `DATABASE_URL` (`apps/api/prisma.config.ts`). Les variables `DB_HOST`, `DB_PORT`, etc. ne remplacent pas automatiquement `DATABASE_URL`.
- Dans ce repo, `apps/pwa/package.json` porte le nom de workspace `docs` ; utiliser `-w docs` dans les commandes npm.
- Pour eviter les incoherences de lockfile/workspaces, ne pas faire `npm install` depuis un sous-dossier d'app.
