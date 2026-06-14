# Lootopia

Plateforme SaaS B2B2C de chasses au trésor géolocalisées en réalité augmentée. Les partenaires créent des parcours, les joueurs les rejoignent via QR code, des indices déclenchés par GPS les guident, et la capture AR débloque des récompenses.

Le projet est un monorepo [Turborepo](https://turborepo.dev/).

## Contenu du monorepo

### Apps

| App | Framework | Port | Rôle |
|-----|-----------|------|------|
| `apps/api` | NestJS 11 | 8000 | Backend REST |
| `apps/web` | Next.js 16 | 3000 | Portail web (partenaires / admin) |
| `apps/pwa` | Next.js 16 | 3001 | PWA mobile pour les joueurs |
| `apps/db` | PostgreSQL 18 + PostGIS | 5432 | Base de données géospatiale |

### Packages

- `@repo/types` : types TypeScript / DTO partagés
- `@repo/ui` : bibliothèque de composants React partagée
- `@repo/eslint-config` : configurations ESLint
- `@repo/typescript-config` : presets `tsconfig.json`

## 🚀 Démarrage rapide — tout en Docker

> **Tu découvres le projet ?** C'est la voie recommandée. Seul **Docker** (Desktop ou Engine + Compose v2) est requis — pas besoin d'installer Node, Postgres ni MinIO sur ta machine.

L'ensemble de la stack (API, web, PWA, base de données, MinIO, Mailpit, pgAdmin) est orchestré par `compose.yml` à la racine. La base est **créée et seedée automatiquement** par le conteneur API à son démarrage ; le bucket d'assets MinIO est créé par le service d'init.

**1. Cloner puis configurer les variables d'environnement.** Un seul fichier à remplir : le `.env` racine (consommé par `compose.yml`). Toutes les valeurs sont à `changeMe`, chaque variable a un exemple en commentaire.

```sh
cp .env.example .env
# puis éditer .env : renseigner les changeMe (au minimum JWT_SECRET, sinon l'API plante au boot)
```

> Les `.env` des apps (`apps/*/.env`) ne sont **pas** lus en Docker : `compose.yml` injecte lui-même la config de chaque service (`environment` + `build.args`). Le seul fichier à remplir est le `.env` racine.

**2. Lancer toute la stack** (le `--profile init` crée le bucket MinIO public — indispensable pour les uploads d'assets) :

```sh
docker compose --profile init up --build
```

**3. Accéder aux apps** (certificat auto-signé → accepter l'avertissement au 1er accès) :

| App | URL |
|-----|-----|
| Portail web (partenaires / admin) | <https://localhost:3000> |
| PWA joueurs | <https://localhost:3001> |

C'est tout : l'API (interne), Postgres, MinIO, Mailpit et pgAdmin tournent aussi. Voir [Services annexes](#services-annexes-docker) pour leurs URLs.

### Variante pratique : `make setup`

Le `Makefile` enveloppe la procédure ci-dessus et **auto-détecte l'IP LAN** (`LAN_IP`) pour permettre l'accès depuis un **smartphone** sur le même réseau (test caméra / géoloc AR) — voir la note `LAN_IP` plus bas. Nécessite `make` + Node installés (l'étape de reset relance Prisma côté hôte).

```sh
make setup     # build + démarrage (avec bucket) + reset/seed
make stop      # arrêt + suppression des volumes
make help      # liste des cibles (reset-db, reset-bucket, seed…)
```

### Note `LAN_IP` (accès mobile)

Les reverse proxies Caddy (`proxy-web`/`proxy-pwa`) servent `https://localhost:3000/3001` **sans configuration**. Pour ouvrir l'app depuis un **téléphone** via l'IP LAN de ta machine (nécessaire pour tester caméra/GPS sur mobile), il faut fournir `LAN_IP` :

```sh
# macOS
LAN_IP=$(ipconfig getifaddr en0) docker compose --profile init up --build
# …ou simplement `make setup`, qui le détecte tout seul.
```

L'app est alors aussi joignable sur `https://<IP_LAN>:3000` / `:3001`.

## Démarrage en local (`npm run dev`)

Alternative pour le développement des apps : elles tournent directement sous Node.js ; seule l'infrastructure (Postgres, MinIO, Mailpit) tourne en Docker.

1. **Définir les variables d'environnement dédiées dans chaque app**, à partir de leur `.env.example` respectif :

   ```sh
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   cp apps/pwa/.env.example apps/pwa/.env
   ```

   Chaque variable est à `changeMe` par défaut ; un commentaire en face de chacune explique son rôle et donne un exemple de valeur concrète (souvent différente entre local et Docker — ex. `http://localhost:8000` vs `http://api:8000`).

2. Lancer les services d'infrastructure :

   ```sh
   docker compose up db minio mailpit
   ```

3. Installer les dépendances et lancer toutes les apps en parallèle :

   ```sh
   npm install
   npm run dev
   ```

**Cibler une app spécifique :**

```sh
npx turbo run dev --filter=api
npx turbo run dev --filter=web
npx turbo run dev --filter=pwa
```

### Autres commandes

```sh
npm run build        # Build de toutes les apps
npm run test         # Tous les tests
npm run lint         # Lint de tous les packages
npm run check-types  # Vérification TypeScript
npm run format       # Formatage Prettier
```

## Pourquoi des réécritures d'URL (rewrites) dans `next.config.js` ?

Les fichiers `apps/pwa/next.config.js` et `apps/web/next.config.js` définissent des rewrites Next.js (`/api/*` → API, `/assets/*` → MinIO). Raison : **les hôtes à requêter diffèrent selon l'environnement d'exécution**.

- **En local (Node.js direct)** : le navigateur et le serveur Next tournent sur la même machine ; l'API est joignable sur `http://localhost:8000` et MinIO sur `http://localhost:9000`.
- **En conteneur (Docker Compose)** : le serveur Next doit joindre les autres services via le DNS interne du réseau Docker (`http://api:8000`, `http://minio:9000`) — des hôtes que le navigateur de l'utilisateur ne peut pas résoudre.
- **Sur smartphone (cas de la PWA notamment)** : le téléphone accède à l'app via l'IP LAN de la machine de dev ou un tunnel HTTPS (ex. ngrok) ; `localhost` désignerait alors le téléphone lui-même, et un appel direct en HTTP vers l'API depuis une page servie en HTTPS serait bloqué (*mixed content*).

Plutôt que de faire varier les URLs côté client selon chaque cas, le client requête des chemins relatifs **même origine** (`/api/*`, `/assets/*`). Le serveur Next, qui connaît son environnement, proxyfie ces requêtes vers la bonne cible via les variables `API_URL` et `MINIO_INTERNAL_URL` (côté serveur uniquement, donc ajustables sans rebuild). Bénéfices :

- une seule URL côté client, valable quel que soit l'hôte d'accès (localhost, IP LAN, ngrok, prod) ;
- pas de problème CORS (même origine) ;
- pas de *mixed content* quand le front est servi en HTTPS alors que l'API/MinIO sont en HTTP ;
- les hôtes internes Docker (`api`, `minio`) restent confinés côté serveur.

## Variables d'environnement

Trois niveaux de fichiers `.env` :

1. **Racine `.env`** — consommé par `compose.yml` (credentials Postgres, pgAdmin, MinIO, `JWT_SECRET`).
2. **`apps/api/.env`** — config NestJS (port, `DATABASE_URL`, JWT, S3, SMTP).
3. **`apps/web/.env` et `apps/pwa/.env`** — config Next.js. ⚠️ Les variables `NEXT_PUBLIC_*` sont inlinées dans le bundle **au build** : en Docker, elles doivent être passées via `build.args`, pas seulement via `environment`.

Voir les `.env.example` correspondants : chaque variable y est documentée avec un commentaire et un exemple de valeur.

## Services annexes (Docker)

| Service | URL | Rôle |
|---------|-----|------|
| pgAdmin | http://localhost:5050 | Administration Postgres |
| MinIO (console) | http://localhost:9001 | Stockage objet S3-compatible (assets) |
| Mailpit | http://localhost:8025 | Boîte mail de dev (SMTP local) |
