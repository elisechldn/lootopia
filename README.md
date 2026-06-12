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

## Démarrage

Le projet peut être lancé de deux manières : **tout en Docker** via `docker compose`, ou **en local** via `npm run dev` (avec les services d'infrastructure en Docker).

### Option 1 — Tout en Docker (`docker compose`)

L'ensemble de la stack (API, web, PWA, base de données, MinIO, Mailpit, pgAdmin) est orchestré par `compose.yml` à la racine.

1. Copier le fichier d'exemple et **définir les variables d'environnement** (elles sont toutes à `changeMe` par défaut — voir les exemples de valeurs en commentaire de chaque variable) :

   ```sh
   cp .env.example .env
   ```

2. Lancer la stack :

   ```sh
   docker compose up --build
   ```

Dans ce mode, les `.env` des apps ne sont pas utilisés : `compose.yml` injecte directement la configuration de chaque service (via `environment` et `build.args`).

### Option 2 — En local (`npm run dev`)

Les apps tournent directement sous Node.js ; seule l'infrastructure (Postgres, MinIO, Mailpit) tourne en Docker.

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
