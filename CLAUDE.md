# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Lootopia is a B2B2C SaaS platform for AR geo-located treasure hunts. Partners create journeys, players join via QR codes, GPS-triggered clues guide them, and AR capture unlocks rewards. The codebase is a Turborepo monorepo.

## Commands

All commands run from the repo root unless noted.

```bash
# Development (all apps in parallel)
npm run dev

# Build all apps
npm run build

# Run all tests
npm run test

# Lint all packages
npm run lint

# Type checking
npm run check-types

# Format
npm run format
```

**Filtering to a specific app:**
```bash
npx turbo run dev --filter=api
npx turbo run dev --filter=web
npx turbo run dev --filter=pwa
```

**API-specific (from `apps/api/`):**
```bash
npm run test:watch       # Jest watch mode
npm run test:cov         # Coverage report
npm run test:e2e         # End-to-end tests
```

**Database (Prisma, from `apps/api/`):**
```bash
npx prisma migrate dev   # Apply migrations
npx prisma generate      # Regenerate client (outputs to src/generated/prisma/)
npx prisma db seed       # Run seed.ts
```

## Architecture

### Apps

| App | Framework | Port | Purpose |
|-----|-----------|------|---------|
| `apps/api` | NestJS 11 | 3000 | REST backend |
| `apps/web` | Next.js 16 | 3000 | Web portal (admin/marketing) |
| `apps/pwa` | Next.js 16 | 3001 | Mobile PWA for players |
| `apps/db` | PostgreSQL 18 + PostGIS | 5432 | Geospatial database |

### Packages

| Package | Description |
|---------|-------------|
| `@repo/types` | Shared TypeScript types/DTOs |
| `@repo/ui` | Shared React component library |
| `@repo/eslint-config` | ESLint configurations |
| `@repo/typescript-config` | Shared tsconfig presets |

### API Structure (`apps/api/src/`)

- Entry: `main.ts` → `AppModule`
- Prisma client generated at `src/generated/prisma/`
- Database schema: `prisma/schema.prisma` — current models: `User`, `Role`
- Config managed via `@nestjs/config` (reads `.env`)

### Data Model Summary

Core domain entities (from `AR_TreasureHunt_Merise.md`): `Partner`, `Course`, `Step`, `GeoTriggerZone`, `Hint`, `QRAccess`, `Player`, `SessionCourse`, `StepProgression`, `ARObject`, `Reward`. Business rules include linear step progression, geofence with hysteresis, idempotent rewards, and anti-replay tokens.

## Key Tech Stack

- **Backend**: NestJS, Prisma ORM, PostgreSQL + PostGIS, Zod validation
- **Frontend**: Next.js 16, React 19, TypeScript 5
- **Monorepo**: Turborepo 2.8
- **Testing**: Jest 30, Supertest

## Environment Variables

Three layers of `.env` files:

1. **Root `.env`** — consommé par `compose.yml` :
   ```
   POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB
   PGADMIN_DEFAULT_EMAIL, PGADMIN_DEFAULT_PASSWORD
   MINIO_ROOT_USER, MINIO_ROOT_PASSWORD, MINIO_BUCKET
   ```

2. **`apps/api/.env`** — config NestJS :
   ```
   PORT=8000
   DATABASE_URL=postgresql://...
   JWT_SECRET=...
   S3_ENDPOINT, S3_PUBLIC_URL, S3_BUCKET, S3_ACCESS_KEY, S3_SECRET_KEY, S3_REGION
   ```

3. **`apps/web/.env` et `apps/pwa/.env`** — config Next.js (variables `NEXT_PUBLIC_*` inlinées au build) :
   ```
   NEXT_PUBLIC_API_URL, API_URL
   NEXT_PUBLIC_ASSETS_BASE_URL, MINIO_INTERNAL_URL, S3_BUCKET
   ```

Voir les `.env.example` correspondants pour les valeurs par défaut documentées.

## Docker

Multi-stage Dockerfiles exist for `api`, `web`, and `db`. The `db` image uses `postgres:18-alpine` with PostGIS for geospatial support.

## PWA — Utilitaires Safe Area (Tailwind)

Définis dans `apps/pwa/app/globals.css`. À utiliser à la place des valeurs arbitraires `calc(...)`.

| Classe | Valeur CSS | Usage |
|--------|-----------|-------|
| `pt-safe` | `padding-top: env(safe-area-inset-top)` | Contenu collé au bord supérieur |
| `pb-safe` | `padding-bottom: env(safe-area-inset-bottom)` | Contenu collé au bord inférieur |
| `px-safe` | `padding-left/right: env(safe-area-inset-*)` | Contenu collé aux bords latéraux |
| `pt-topbar` | `padding-top: calc(50px + safe-area-inset-top)` | Offset sous la TopBar fixée |
| `top-safe-4` | `top: calc(1rem + safe-area-inset-top)` | Éléments `absolute/fixed` décalés du bord supérieur (ex: bouton retour sur hero) |
| `pb-safe-3` | `padding-bottom: calc(0.75rem + safe-area-inset-bottom)` | Éléments `fixed bottom-0` (ex: barre d'action en bas) |

**Règle** : ne jamais écrire `pb-[calc(...env(safe-area-inset-bottom)...)]` en inline — ajouter une `@utility` dans `globals.css` à la place.

## PWA — Conventions frontend

- Toujours utiliser `next/image` (`Image`) plutôt que `<img>` — optimisation automatique, lazy loading, prévention du CLS.
- Toujours utiliser `next/link` (`Link`) plutôt que `<a>` pour la navigation interne.
- Pour `Image` avec URL externe (ex: assets MinIO), s'assurer que le domaine est déclaré dans `next.config.js` (`remotePatterns`). En développement, `NEXT_PUBLIC_ASSETS_BASE_URL` pointe vers MinIO — ajouter le host correspondant si Next.js bloque l'image.

## Git & Commits

- Use Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, etc.), in English
- **Never add Claude as co-author** — no `Co-Authored-By: Claude` trailer in any commit message
- Never auto-commit without explicit user confirmation
