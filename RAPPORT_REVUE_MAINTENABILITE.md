# Analyse de maintenabilité — Lootopia (monorepo Turborepo)

> Revue de code transversale — pratiques de code & maintenabilité.
> Objectif : déterminer si une étape de refactorisation est nécessaire avant de poursuivre le développement.

## Verdict

**Une refactorisation ciblée est recommandée avant de poursuivre, mais elle n'est pas bloquante pour le développement de nouvelles features.** Un point fait exception et doit être traité en urgence absolue (niveau bloquant/sécurité) : la fuite de données sensibles via `GET /users/:id`.

Niveau global : **recommandé, avec une alerte critique isolée**. L'architecture de fond (NestJS en couches, Prisma, séparation par domaine) est saine et ne nécessite pas de réécriture. En revanche, plusieurs zones — logs de debug en prod, duplication des proxys Next.js, absence de tests front, et un défaut d'autorisation — doivent être assainies avant que la dette ne s'accumule davantage, car le projet grossit (533 lignes pour `hunts.service.ts`, 526 pour `HuntForm.tsx`, 495 pour `participations.service.ts`).

## Points forts

- Architecture API cohérente : Controller → Service → Prisma, DTOs validés via `class-validator` + `ValidationPipe` global (`whitelist`, `forbidNonWhitelisted`, `transform`), `TransformInterceptor` uniformisant les réponses.
- Bonne maîtrise de PostGIS (requêtes `$queryRaw` avec `ST_DWithin`/`ST_Distance` pour géofences et proximité) et gestion des transactions Prisma avec verrou optimiste (`P2025` → `ConflictException`) pour l'idempotence des validations d'étapes.
- Style défensif réel par endroits : `requireEnv()`, anti-énumération sur `forgotPassword`, nettoyage best-effort des fichiers S3 orphelins (`.catch(() => {})`), aucun secret en dur, fichiers générés/`dist`/`coverage` correctement ignorés par git.
- Bonne séparation Server Components / Client Components dans la PWA (`'use server'` / `'use client'` cohérents), usage de `next/link` correct pour la navigation interne.

---

## Critique (bloquant)

### 1. Fuite de données sensibles via `GET /users/:id` non protégé
- **Fichiers** : `apps/api/src/users/users.controller.ts:76-79` (route sans `@UseGuards`), `apps/api/src/users/users.service.ts:62-70` (`findOne` sans `omit`)
- **Problème** : `findOne(id)` exécute `this.prisma.user.findUnique({ where: { id } })` sans `omit`/`select`, renvoyant la ligne brute incluant `passwordHash` (bcrypt), `resetToken`, `resetTokenExpiry`, `emailVerificationToken`, `emailVerificationExpiry` (cf. `apps/api/src/orm/prisma/schemas/user.prisma:5-15`). La route `@Get(':id')` ne porte aucun guard, donc n'importe quel appelant non authentifié peut récupérer ces champs pour n'importe quel utilisateur. À comparer avec `findMe` (ligne 98-104) qui fait correctement `omit: { passwordHash: true }`.
- **Impact** : exposition du hash de mot de passe et des tokens de reset/vérification d'email actifs — un attaquant peut détourner un compte (réinitialiser le mot de passe via le `resetToken` exfiltré) ou bruteforcer le hash hors-ligne. C'est un défaut de contrat (Liskov/cohérence) entre `findOne` et `findMe` qui aurait dû partager la même politique de projection.
- **Correction** :
```ts
// users.service.ts — aligner findOne sur findMe
async findOne(id: number) {
  const user = await this.prisma.user.findUnique({
    where: { id },
    omit: { passwordHash: true, resetToken: true, resetTokenExpiry: true,
             emailVerificationToken: true, emailVerificationExpiry: true },
  });
  if (!user) throw new NotFoundException(`User #${id} not found`);
  return user;
}
```
```ts
// users.controller.ts — protéger la route (ou la restreindre à un usage interne)
@Get(':id')
@UseGuards(AuthGuard('jwt'))
findOne(@Param('id') id: string) { return this.usersService.findOne(+id); }
```

---

## Avertissement (à corriger)

### 2. Logs de production contenant des propos déplacés et un commentaire évoquant une fuite de mot de passe
- **Fichiers** :
  - `apps/api/src/auth/auth.service.ts:64` (`"...un qui a oublie sont mdp :)"`), `:69-70` (`// logInfo('warn', \`leak de mot de passe: ${dto.password}\`...) a ne jamais active / sauf si on veux la mettre a l'envers SDV :)`), `:132` (`"raté mon coco"`), `:139` (`"encore raté"`)
  - `apps/api/src/hunts/hunts.service.ts:116` (`"tous les utilisateurs (soit pas relou)"`), `:176` (idem), `:252` (`"encore un crétin qui ne met pas de titre"`), `:258` (`"mais il fait quoi lui sans refUser"`)
- **Problème** : ces chaînes sont écrites dans le fichier de log de production (`logs/app.log` via `winston`, cf. `apps/api/src/loggeur.ts:5-15`). Le commentaire ligne 69-70 documente littéralement comment activer un log qui logguerait les mots de passe en clair, en plaisantant sur le fait de "la mettre à l'envers" pour l'école (SDV).
- **Impact** : risque de réputation et de conformité (RGPD/sécurité) si ces logs sont consultés en production, exportés ou audités ; le commentaire constitue une trace écrite d'une intention de logger des mots de passe, ce qui est un signal d'alarme en revue de sécurité même s'il est commenté. Cela nuit aussi à la lisibilité professionnelle du code pour toute personne qui le reprend.
- **Correction** : remplacer par des messages neutres et factuels, et supprimer entièrement le commentaire ligne 69-70 :
```ts
logInfo('error', `Tentative d'inscription avec un email déjà utilisé: ${dto.email}`, 'AuthService');
// ...
logInfo('error', `Échec d'authentification — email inconnu: ${email}`, 'AuthService');
logInfo('error', `Échec d'authentification — mot de passe invalide pour: ${email}`, 'AuthService');
```

### 3. `console.log` de debug oubliés massivement côté PWA (et un en SSR qui logge la config)
- **Fichiers** (échantillon représentatif, 57 occurrences au total hors `loggeur.ts`) :
  - `apps/pwa/app/hunts/[id]/game/map/page.tsx:53,61,63,66,69,77,78,81,84` — dont **4 `console.log` à l'intérieur d'un `useMemo`** (lignes 77, 78, 81, 84), ce qui est un anti-pattern React (le `useMemo` doit être une fonction pure ; logguer dedans s'exécute à chaque rendu/recalcul, y compris en double sous Strict Mode)
  - `apps/pwa/components/ar/ARCamera.tsx:90,92,142,143,154,155,157,191,223,242,254` et `apps/pwa/components/ar/ARScene.tsx:32,127,134`
  - `apps/pwa/hooks/useARScene.ts:60,68,71,74,77,80,85,91`
  - `apps/pwa/components/game/hints/HintBubbles.tsx:28`, `apps/pwa/components/hunt/PlayButton.tsx:25-26`, `apps/pwa/app/reset-password/page.tsx:91` (`"cpicpi"`)
  - `apps/pwa/lib/assets.ts:2-3` — exécuté **au chargement du module**, donc à chaque import (SSR compris), affichant la config d'environnement (`NEXT_PUBLIC_ASSETS_BASE_URL`) dans les logs serveur
  - `apps/web/components/partner/HuntForm.tsx:116-117`, `StepsTab.tsx:47`, `StepItem.tsx:43`, `apps/web/lib/auth.ts:18`, `apps/web/app/(partner)/dashboard/hunts/[id]/edit/page.tsx:15`
- **Impact** : pollution de la console en production, fuite potentielle de données (coordonnées GPS, payloads de chasses, config) côté client comme serveur, dégradation de perf marginale (sérialisation d'objets volumineux à chaque rendu), et signal de code non finalisé.
- **Correction** : supprimer ces lignes ou les remplacer par un logger conditionné par l'environnement (`if (process.env.NODE_ENV !== 'production')`), et sortir tout effet de bord d'un `useMemo`/`useEffect` de calcul pur :
```ts
// map/page.tsx — useMemo doit rester pur
const currentStep = useMemo<StepWithCoords | null>(() => {
  if (!hunt || !participation) return null;
  const active = participation.progresses.find((p) => p.statut === 'IN_PROGRESS');
  if (!active) return null;
  return (hunt.steps.find((s) => s.id === active.refStep) as StepWithCoords) ?? null;
}, [hunt, participation]);
```
```ts
// lib/assets.ts — retirer les console.log de niveau module
const ASSETS_BASE = process.env.NEXT_PUBLIC_ASSETS_BASE_URL ?? "/assets";
export function assetUrl(value: string | null | undefined): string | null { /* ... */ }
```

### 4. Duplication systématique des routes proxy `apps/web/app/api/*` (11 fichiers, ~90% de code identique)
- **Fichiers** : les 11 fichiers sous `apps/web/app/api/**/route.ts` (`hunts/route.ts`, `hunts/[id]/route.ts`, `hunts/[id]/steps/route.ts`, `clues/[clueId]/route.ts`, `ar-items/route.ts`, `ar-items/[id]/route.ts`, `users/[id]/route.ts`, `steps/[stepId]/clues/route.ts`, `steps/[stepId]/marker/route.ts`, `avatar/route.ts`, `files/route.ts`)
- **Problème** : chaque handler répète mot pour mot : récupération du cookie `auth_token`, vérification `if (!token) return NextResponse.json({ message: 'Non authentifié' }, { status: 401 })`, `fetch` vers `${API_URL}/...` avec `Authorization: Bearer ${token}`, puis reconstruction de la `NextResponse` avec `apiRes.headers.get('content-type') ?? 'application/json'`. Confirmé par exemple dans `apps/web/app/api/hunts/[id]/route.ts:6-27` (PUT/DELETE) et `apps/web/app/api/hunts/route.ts:6-23` (POST) — code quasi identique.
- **Impact** : violation DRY flagrante — toute évolution (ex. ajout d'un header, gestion d'un nouveau code d'erreur, changement du nom du cookie) doit être répliquée dans 11 fichiers, avec un risque d'incohérence (ex. `users/[id]/route.ts` PATCH vs `hunts/[id]/route.ts` PUT/DELETE — chaque copie a sa propre chance de diverger).
- **Correction** : extraire un helper `proxyToApi(request, { path, method, requireAuth })` dans `apps/web/lib/`, par exemple :
```ts
// apps/web/lib/apiProxy.ts
export async function proxyAuthenticated(
  request: Request,
  path: string,
  method: string,
): Promise<NextResponse> {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });
  const apiRes = await fetch(`${API_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: method === 'GET' || method === 'DELETE' ? undefined : await request.text(),
  });
  const body = await apiRes.text();
  return new NextResponse(body, {
    status: apiRes.status,
    headers: { 'Content-Type': apiRes.headers.get('content-type') ?? 'application/json' },
  });
}
// route.ts devient alors un one-liner par verbe
export const PUT = (req: Request, { params }: Ctx) =>
  params.then(({ id }) => proxyAuthenticated(req, `/hunts/${id}`, 'PUT'));
```

### 5. Triple duplication du décodage JWT non vérifié + incohérence d'auth dans `apps/web`
- **Fichiers** : `apps/web/lib/auth.ts:5-15` (`getSession`), `apps/web/app/(partner)/layout.tsx:8-30` (`getSessionWithProfile`), `apps/web/app/(partner)/dashboard/profile/page.tsx:5-13` (`getSession` redéfini localement, signature de retour différente — `any` implicite vs type explicite)
- **Problème** : trois implémentations quasi identiques de "lire le cookie `auth_token`, `split('.')`, `atob`, `JSON.parse`" avec gestion d'erreur légèrement différente à chaque fois (l'une vérifie `parts.length < 2`, l'autre non ; l'une type le retour, l'autre `any` implicite). De plus, `profile/page.tsx:16` appelle `getUser` sans `Authorization` header et via `process.env.NEXT_PUBLIC_API_URL` (au lieu de la constante `API_URL` server-side utilisée partout ailleurs), ce qui — combiné au problème **#1** — fonctionne aujourd'hui seulement parce que la route `GET /users/:id` n'est pas protégée.
- **Impact** : la logique d'extraction de session est un point d'entrée sécurité critique ; sa triplication augmente le risque qu'un correctif (ex. passage à une vérification de signature, gestion d'expiration) soit appliqué dans une copie et oublié dans les deux autres. Le commentaire `// Décode sans vérifier (la vérif se fait côté API)` (ligne 9) est une dette assumée mais fragile : si un appel front utilise ce payload pour une décision d'affichage sensible sans repasser par l'API, rien ne garantit l'intégrité du token.
- **Correction** : centraliser dans `apps/web/lib/auth.ts` une seule fonction `getSession()` réutilisée partout, et faire passer `getUser` par le même header `Authorization` :
```ts
// supprimer les redéfinitions locales dans layout.tsx et profile/page.tsx
import { getSession } from '@/lib/auth';
```

### 6. Logique d'autorisation par "remontée de relation" dupliquée entre services
- **Fichiers** : `apps/api/src/clues/clues.service.ts:341-353` (`checkStepOwnership`), `:355-367` (`checkClueOwnership`), `:277-303` (`getProgressWithOwnership`) ; `apps/api/src/steps/steps.service.ts:90-99` ; `apps/api/src/participations/participations.service.ts:223-225, 251-258, 401-408`
- **Problème** : le motif "charger l'entité avec sa relation jusqu'au `Hunt.refUser`, comparer à `userId`, lever `ForbiddenException`" est réécrit indépendamment dans au moins 4 services (`clues`, `steps`, `participations`, et indirectement `hunts.controller.ts:23-28` avec `assertOwnership`). Chaque copie fait une requête Prisma différente pour arriver au même test.
- **Impact** : violation du principe DRY et dispersion d'une règle métier transverse ("seul le partenaire propriétaire de la chasse peut gérer ses étapes/indices/voir ses participations") dans cinq endroits — toute évolution de la règle (ex. ajout d'un rôle "co-éditeur") nécessite cinq modifications synchronisées, avec un risque réel d'oubli.
- **Correction** : extraire un service ou des helpers partagés (`HuntOwnershipService.assertOwnsStep(stepId, userId)`, `assertOwnsClue`, etc.) injectés via constructeur, ou un `CaslAbility`/Guard NestJS dédié à l'autorisation par ressource — cohérent avec le principe d'inversion de dépendance (dépendre d'une abstraction d'autorisation plutôt que de réimplémenter la requête à chaque fois).

### 7. Absence totale d'infrastructure de tests pour `apps/web` et `apps/pwa`
- **Fichiers** : aucun fichier `*.spec.ts(x)`/`*.test.ts(x)` sous `apps/web` ou `apps/pwa` ; pas de script `test` dans `apps/web/package.json` ni `apps/pwa/package.json` ; aucun `jest.config.*`
- **Problème** : tout le code métier front (calcul du score live `livePoints` dans `apps/pwa/app/hunts/[id]/game/map/page.tsx:97-107`, vérification de géofence côté client `haversineDistance` à la ligne 110-119, gestion des indices dans `HintBubbles.tsx`, formulaires `HuntForm.tsx`) n'est couvert par aucun test automatisé.
- **Impact** : régressions silencieuses sur des calculs sensibles (score, distance, état de jeu) qui ne seront détectées qu'en recette manuelle ou en production. Le commit récent `bfa7ddd fix(pwa): compute live participation score from progress data` montre que ce type de logique est sujette à bugs et changements fréquents — exactement le genre de code qui justifie des tests unitaires.
- **Correction** : a minima, configurer Jest (ou Vitest) + React Testing Library pour `apps/pwa`/`apps/web`, et écrire des tests sur les fonctions pures critiques en premier (`haversineDistance`, `livePoints`, `unwrap`), avant de couvrir les composants.

### 8. Tests API existants très partiels sur les chemins critiques
- **Fichiers** : `apps/api/src/users/users.service.spec.ts:15` et `users.controller.spec.ts:17` ne contiennent qu'un `it('should be defined', ...)` ; `apps/api/src/participations/participations.service.spec.ts` ne couvre que `findOne` (3 tests) ; aucun fichier `.spec.ts` pour `hunts.service.ts`, `clues.service.ts`, `auth.service.ts`, `ar-item.service.ts`
- **Problème** : les fonctions les plus sensibles du domaine — `validateStep` (géofence PostGIS + calcul de points avec pénalités + transaction optimiste, `participations.service.ts:229-381`), `requestClue`/`revealClue` (idempotence, séquentialité, transition d'étape, `clues.service.ts:183-273`), `startHunt` (création de participation + premier `Progress`), `leaderboard`, et toute la validation de budget de pénalité dans `hunts.service.ts:upsertSteps` — n'ont **aucun test unitaire**.
- **Impact** : ce sont précisément les zones identifiées comme critiques dans le périmètre demandé (participations, clues/points, géofence, rewards) ; une régression sur le calcul `pointsEarned = Math.max(0, step.points - totalPenalty)` (ligne 332) ou sur la condition de progression `s.orderNumber === step.orderNumber + 1` (ligne 343) ne serait détectée qu'en production.
- **Correction** : prioriser l'écriture de tests sur `validateStep` (cas : hors zone, étape non courante, pénalités cumulées, dernière étape → `COMPLETED`, conflit `P2025`), `revealClue` (séquentialité, idempotence, dernier indice → `SKIPPED`), et `upsertSteps` (validation des budgets de pénalité).

### 9. `HuntForm.tsx` cumule trop de responsabilités (526 lignes)
- **Fichier** : `apps/web/components/partner/HuntForm.tsx`
- **Problème** : un seul composant gère l'état du formulaire de métadonnées, la gestion des tags, l'upload de l'image de couverture, l'orchestration de l'upload des modèles 3D AR (`/api/ar-items`, lignes 142-155), la persistance des steps (`/api/hunts/${huntId}/steps`, lignes 169-173), **et** l'upload des fichiers marker par étape (lignes 175 et suivantes). C'est au moins 5 raisons de changer dans une seule fonction (`handleSave`, elle-même longue de ~110 lignes avec plusieurs niveaux d'imbrication try/catch).
- **Impact** : viole le principe de responsabilité unique (S de SOLID) ; rend les tests unitaires quasi impossibles (il faudrait mocker 4 endpoints différents pour tester la sauvegarde des métadonnées) ; complexité cyclomatique de `handleSave` largement > 10 (multiples `if`/`try`/boucles `Promise.all`/`map` imbriqués).
- **Correction** : extraire chaque flux d'upload dans un hook dédié (`useHuntCoverUpload`, `useArItemUpload`, `useMarkerUpload`) et une fonction d'orchestration `saveHunt(payload, steps)` testable indépendamment du JSX, suivant le modèle "logique dans hooks/services, JSX dans composants".

---

## Suggestion (optionnel)

### 10. Code commenté mort (47 lignes) dans `steps.service.ts`
- **Fichier** : `apps/api/src/steps/steps.service.ts:28-75`, précédé du commentaire `// NON UTILISE ACTUELLEMENT — ancienne version générant le .patt côté serveur`
- **Problème/Correction** : code mort explicitement documenté comme inutilisé — à supprimer (git en conserve l'historique). De même pour les blocs commentés dans `apps/web/components/partner/HuntForm.tsx:58-60,108-109` (champs `country`/`city`/`difficulty` jamais branchés) et `apps/pwa/proxy.ts:14-16` (détection desktop désactivée).

### 11. Réenveloppement ad-hoc de la réponse `{ data }` (15 occurrences)
- **Fichiers** : `apps/pwa/lib/actions/participation.actions.ts:11-13` (`unwrap`), `apps/pwa/services/hunt.service.ts:51-52`, `apps/web/app/(partner)/dashboard/participants/[userId]/page.tsx`, et au moins 12 autres call sites avec `json.data ?? json` / `body?.data ?? body`
- **Problème/Correction** : le `TransformInterceptor` de l'API enveloppe systématiquement les réponses dans `{ data, meta? }` ; côté front, ce déballage est réimplémenté localement à chaque fetch au lieu d'être centralisé dans un client HTTP partagé (`apps/pwa/lib/api.ts` exporte seulement `API_URL`, pas de wrapper `apiFetch`). Mutualiser dans une fonction `apiFetch<T>(path, init)` qui fait le `fetch` + `unwrap` + gestion d'erreur uniforme réduirait la duplication des 19+40 appels `fetch` recensés et harmoniserait la gestion d'erreurs (actuellement hétérogène : certains lèvent, d'autres retournent `[]`/`null` silencieusement, ex. `getNearbyHunts` ligne 49 vs `getAllHunts` ligne 29).

### 12. `<img>` brut au lieu de `next/image` (8 occurrences, contraire au CLAUDE.md)
- **Fichiers** : `apps/pwa/app/profile/page.tsx:103,180`, `apps/pwa/components/hunt/HuntHero.tsx:16`, `apps/web/components/ui/file-upload.tsx:1080`, `apps/web/components/partner/HuntForm.tsx:325`, `ProfileForm.tsx:130`, `PartnerSidebar.tsx:115`, `MarkerFileUpload.tsx:103,137`
- **Correction** : remplacer par `<Image>` de `next/image` avec `remotePatterns` déjà déclaré pour MinIO (cf. CLAUDE.md) — gain en CLS/lazy-loading et conformité aux conventions du projet.

### 13. Valeurs `calc(...env(safe-area-inset-bottom)...)` inline (contraire à la règle CLAUDE.md)
- **Fichiers** : `apps/pwa/app/hunts/[id]/page.tsx:49` (`style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}`), `apps/pwa/app/hunts/[id]/game/map/page.tsx:219` (`pb-[calc(5rem+env(safe-area-inset-bottom,1rem))]`)
- **Correction** : la règle CLAUDE.md est explicite — ajouter une `@utility` dédiée dans `apps/pwa/app/globals.css` (ex. `pb-safe-5` à `calc(1.5rem + env(safe-area-inset-bottom))`) plutôt que ces valeurs arbitraires inline, pour rester cohérent avec `pb-safe-3` déjà défini.

---

## Plan de refacto priorisé

| Priorité | Action | Effort estimé |
|---|---|---|
| 1 (urgent, sécurité) | Corriger `findOne`/route `GET /users/:id` (point #1) — `omit` + guard | 1h |
| 2 | Nettoyer les logs inappropriés dans `auth.service.ts`/`hunts.service.ts` (point #2) | 1-2h |
| 3 | Supprimer les `console.log` de debug PWA/web (point #3), notamment ceux dans `useMemo` | 2-3h |
| 4 | Extraire un helper `proxyAuthenticated()` pour les 11 routes proxy (point #4) | 0,5-1 jour |
| 5 | Centraliser `getSession()` côté web et harmoniser `getUser` (point #5) | 2-4h |
| 6 | Mettre en place Jest/RTL pour `apps/pwa`/`apps/web` + premiers tests sur fonctions pures critiques (point #7) | 1 jour (setup) + continu |
| 7 | Écrire les tests manquants sur `validateStep`/`revealClue`/`upsertSteps` côté API (point #8) | 1-2 jours |
| 8 | Extraire la logique d'ownership dans un service/guard partagé (point #6) | 1 jour |
| 9 | Découper `HuntForm.tsx` en hooks dédiés (point #9) | 1-2 jours |
| 10 (cosmétique) | `<img>` → `next/image`, safe-area inline → `@utility`, suppression code mort (points #10-13) | 0,5 jour |

**Recommandation d'ordonnancement** : traiter #1 immédiatement (faille de sécurité active), puis #2-#3 (rapides, fort impact sur le professionnalisme du code), avant d'attaquer la mise en place des tests front (#6) qui conditionnera la sécurité de tout refactoring ultérieur (#9, #4).

---

## Fichiers clés mentionnés

- `apps/api/src/users/users.controller.ts`
- `apps/api/src/users/users.service.ts`
- `apps/api/src/auth/auth.service.ts`
- `apps/api/src/hunts/hunts.service.ts`
- `apps/api/src/participations/participations.service.ts`
- `apps/api/src/clues/clues.service.ts`
- `apps/api/src/steps/steps.service.ts`
- `apps/web/lib/auth.ts`
- `apps/web/app/(partner)/layout.tsx`
- `apps/web/app/(partner)/dashboard/profile/page.tsx`
- `apps/web/app/api/hunts/[id]/route.ts` (et les 10 autres `route.ts` sous `apps/web/app/api/`)
- `apps/web/components/partner/HuntForm.tsx`
- `apps/pwa/app/hunts/[id]/game/map/page.tsx`
- `apps/pwa/components/game/hints/HintBubbles.tsx`
- `apps/pwa/lib/assets.ts`
- `apps/pwa/lib/actions/participation.actions.ts`
- `apps/pwa/services/hunt.service.ts`
- `apps/api/src/participations/participations.service.spec.ts`
