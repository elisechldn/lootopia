# Audit de sécurité — Lootopia

## Verdict

**Niveau de risque global : ÉLEVÉ.** Le socle technique est globalement sain (Prisma paramétré partout, validation Zod/class-validator présente sur la majorité des DTOs métier, idempotence et transactions correctement gérées sur les flux de jeu, cookies `httpOnly`/`sameSite`, anti-énumération sur `forgotPassword`, validation MIME + magic bytes sur les uploads). **Mais plusieurs failles de contrôle d'accès critiques et directement exploitables sont présentes en l'état**, et doivent être corrigées avant tout déploiement en production : la fuite de `passwordHash`/tokens via `GET /users/:id` (déjà identifiée en maintenabilité, confirmée ici comme **prise de contrôle de compte exploitable**), un **IDOR confirmé et exploité par le frontend lui-même** sur `GET /participations/player/:userId` qui expose les emails et statistiques de n'importe quel joueur à n'importe quel partenaire connecté, un **endpoint `/stats/all` totalement public** exposant des statistiques globales de la plateforme, et un **contournement de la mécanique payante des indices** via `GET /steps/:stepId/clues`. À cela s'ajoutent l'absence totale de `helmet`/`rate limiting` (bruteforce login/reset possible sans aucune limite), un CORS qui reflète n'importe quelle origine avec `credentials: true`, et 4 CVE HIGH sur les dépendances (`axios` < 1.16, `next` 16.1.5, `@ar-js-org/ar.js`). À traiter en urgence absolue : findings #1, #2, #3, #4.

---

## Tableau de synthèse

| # | Titre | Catégorie (OWASP) | Sévérité | Fichier(s) clé(s) |
|---|---|---|---|---|
| 1 | `GET /users/:id` fuite `passwordHash`/tokens, sans guard | A01 Broken Access Control / A02 Cryptographic Failures | Critique | `apps/api/src/users/users.controller.ts:76-79`, `users.service.ts:62-70` |
| 2 | IDOR sur `GET /participations/player/:userId` — PII exposées entre comptes | A01 Broken Access Control (BOLA) | Critique | `apps/api/src/participations/participations.controller.ts:40-43`, `participations.service.ts:178-202` |
| 3 | `GET /users` et `POST /users` sans guard — dump d'utilisateurs et création arbitraire | A01 Broken Access Control | Critique | `apps/api/src/users/users.controller.ts:63-74` |
| 4 | `GET /stats/all` totalement public — exposition de métriques internes | A01 Broken Access Control / A05 Security Misconfiguration | Élevé | `apps/api/src/stats/stats.controller.ts:1-9` |
| 5 | Contournement de la mécanique d'indices payants via `GET /steps/:stepId/clues` | A01 Broken Access Control / Logique métier | Élevé | `apps/api/src/clues/clues.controller.ts:39-42`, `clues.service.ts:73-78` |
| 6 | CORS reflète n'importe quelle origine (`origin: true`) + `credentials: true` | A05 Security Misconfiguration | Élevé | `apps/api/src/main.ts:18-23` |
| 7 | Absence totale de rate limiting (login, register, forgot/reset password, validation d'étape) | A07 Identification & Authentication Failures | Élevé | `apps/api/src/auth/auth.controller.ts`, `apps/api/src/main.ts` |
| 8 | `GET /hunts/stats`, `/hunts/analytics` — IDOR via `userId` en query param | A01 Broken Access Control (BOLA) | Élevé | `apps/api/src/hunts/hunts.controller.ts:36-59` |
| 9 | CVE HIGH sur dépendances : `axios` (SSRF, prototype pollution), `next` 16.1.5, `@ar-js-org/ar.js` | A06 Vulnerable & Outdated Components | Élevé | `package.json` (racine + `apps/pwa`) |
| 10 | `DELETE /ar-items/:id` sans vérification d'ownership — suppression d'assets d'un autre partenaire | A01 Broken Access Control (IDOR) | Élevé | `apps/api/src/ar-item/ar-item.controller.ts:49-53`, `ar-item.service.ts:103-110` |
| 11 | `CreateUserDto`/`UpdateUserDto` sans aucun décorateur de validation | A03 Injection / A04 Insecure Design | Moyen | `packages/types/src/users/dto/create-user.dto.ts`, `update-user.dto.ts` |
| 12 | DTOs d'authentification non typés en classes — `class-validator` inopérant sur `/auth/*` | A04 Insecure Design / A07 Auth Failures | Moyen | `apps/api/src/auth/auth.controller.ts:9-50` |
| 13 | Logs inappropriés / commentaire évoquant le logging de mots de passe en clair | A09 Security Logging & Monitoring Failures | Moyen | `apps/api/src/auth/auth.service.ts:64,69-70,132,139`, `hunts.service.ts:116,176,252,258` |
| 14 | Absence de `helmet`/headers de sécurité HTTP (CSP, HSTS, X-Frame-Options…) | A05 Security Misconfiguration | Moyen | `apps/api/src/main.ts` |
| 15 | Pas d'expiration courte / pas de refresh / pas de révocation du JWT (7 jours fixes) | A07 Identification & Authentication Failures | Moyen | `apps/api/src/auth/auth.module.ts:15` |
| 16 | Conteneurs Docker exécutés en `root` (api/web/pwa/db) | A05 Security Misconfiguration / CWE-250 | Moyen | `apps/api/Dockerfile`, `apps/web/Dockerfile`, `apps/pwa/Dockerfile`, `apps/db/Dockerfile` |
| 17 | `console.log` exposant les identifiants/coordonnées GPS et la config en environnement serveur | A09 Logging Failures / Information Exposure | Moyen | `apps/pwa/lib/assets.ts:2-3`, `apps/pwa/app/hunts/[id]/game/map/page.tsx:53-91`, `apps/web/lib/auth.ts:18` |
| 18 | `ValidateStepDto.latitude/longitude` optionnels — appel API direct sans coordonnées | A04 Insecure Design (à vérifier) | Faible | `apps/api/src/participations/dto/validate-step.dto.ts:1-15` |
| 19 | JWT — algorithme non restreint explicitement (`algorithms: ['HS256']` absent) | A02 Cryptographic Failures (hardening) | Faible | `apps/api/src/auth/jwt.strategy.ts:9-13` |
| 20 | Pas de `@MaxLength` sur les champs texte utilisateur (`message`, `title`, `email`…) | A04 Insecure Design | Faible | `apps/api/src/clues/dto/create-clue.dto.ts`, `apps/api/src/hunts/dto/create-hunt.dto.ts` |
| 21 | Range wildcard `"@nestjs/mapped-types": "*"` en dépendance externe | A06 Vulnerable Components (hygiène) | Info | `apps/api/package.json:32` |
| 22 | `NEXT_PUBLIC_AR_FAKE_GPS=true` dans `.env` — variable de debug non utilisée | A05 Security Misconfiguration (hygiène) | Info | `apps/pwa/.env:1` |

---

## Findings détaillés

### CRITIQUE

#### 1. `GET /users/:id` expose `passwordHash`, `resetToken` et tous les tokens sensibles, sans authentification

**Fichiers** : `apps/api/src/users/users.controller.ts:76-79`, `apps/api/src/users/users.service.ts:62-70`, schéma `apps/api/src/orm/prisma/schemas/user.prisma:5-15`

**Description/Preuve** :
```ts
// users.controller.ts:76-79 — AUCUN @UseGuards
@Get(':id')
findOne(@Param('id') id: string) {
  return this.usersService.findOne(+id);
}
```
```ts
// users.service.ts:62-70 — AUCUN omit/select
async findOne(id: number) {
  const user = await this.prisma.user.findUnique({ where: { id } });
  // renvoie passwordHash, resetToken, resetTokenExpiry,
  // emailVerificationToken, emailVerificationExpiry en clair
  return user;
}
```
Comparer avec `findMe` (`users.service.ts:98-104`) qui fait `omit: { passwordHash: true }` — la politique de projection diverge entre les deux méthodes qui servent le même modèle.

**Impact** : N'importe quel attaquant non authentifié peut itérer `GET /users/1`, `/users/2`, … et récupérer pour chaque compte :
- `passwordHash` (bcrypt) → bruteforce/cracking hors-ligne (rainbow tables, hashcat)
- `resetToken` + `resetTokenExpiry` actifs → **prise de contrôle directe de compte** en appelant `POST /auth/reset-password` avec le token exfiltré, sans jamais recevoir l'email
- `emailVerificationToken` → activation forcée de comptes tiers
- `email`, `username`, `country`, `lastConnection` → PII exploitable pour phishing ciblé

C'est la chaîne d'exploitation la plus grave du projet : énumération non authentifiée → exfiltration de `resetToken` → reset de mot de passe → compromission complète d'un compte partenaire ou joueur (accès aux chasses, récompenses, données de localisation).

**Correction** :
```ts
// users.service.ts
async findOne(id: number) {
  const user = await this.prisma.user.findUnique({
    where: { id },
    omit: {
      passwordHash: true,
      resetToken: true,
      resetTokenExpiry: true,
      emailVerificationToken: true,
      emailVerificationExpiry: true,
    },
  });
  if (!user) throw new NotFoundException(`User #${id} not found`);
  return user;
}
```
```ts
// users.controller.ts
@Get(':id')
@UseGuards(AuthGuard('jwt'))
findOne(@Param('id') id: string) {
  return this.usersService.findOne(+id);
}
```
Envisager même de supprimer cette route publique au profit de `GET /users/me` uniquement (un utilisateur n'a normalement pas besoin de consulter le profil complet d'un tiers — exposer `id → profil` reste un vecteur d'énumération même `omit`é).

**Vérification** : `curl -i http://localhost:8000/users/1` doit retourner `401`; avec un token valide, la réponse ne doit contenir ni `passwordHash` ni `*Token*`.

**Référence** : CWE-200 (Information Exposure), CWE-522 (Insufficiently Protected Credentials), OWASP A01:2021 + A02:2021.

---

#### 2. IDOR sur `GET /participations/player/:userId` — PII de joueurs exposées à n'importe quel utilisateur authentifié, et exploité par le frontend lui-même

**Fichiers** : `apps/api/src/participations/participations.controller.ts:40-43`, `participations.service.ts:178-202`, exploité côté front dans `apps/web/app/(partner)/dashboard/participants/[userId]/page.tsx:8-19`

**Description/Preuve** :
```ts
// participations.controller.ts:40-43 — derrière @UseGuards(AuthGuard('jwt')) au niveau classe,
// MAIS aucune vérification que userId == req.user.sub OU que userId a participé
// à une chasse du partenaire connecté
@Get('player/:userId')
findByPlayer(@Param('userId') userId: string) {
  return this.participationsService.findByPlayer(Number(userId));
}
```
```ts
// participations.service.ts:178-202 — renvoie email/nom/prénom du joueur cible
async findByPlayer(userId: number) {
  return this.prisma.participation.findMany({
    where: { refUser: userId },
    include: {
      user: { select: { id: true, firstname: true, lastname: true, email: true } },
      ...
```
Et le frontend appelle directement cette route avec un `userId` issu de l'URL, sans aucun contrôle d'appartenance :
```ts
// apps/web/app/(partner)/dashboard/participants/[userId]/page.tsx:8-19
const res = await fetch(`${process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL}/participations/player/${userId}`, ...)
```

**Impact** : Tout utilisateur authentifié — y compris un compte `PLAYER` qui parvient à accéder au portail `(partner)` (rien dans `(partner)/layout.tsx` ne vérifie `session.role === 'PARTNER'`, voir finding #8 Élevé du rapport de maintenabilité et confirmation ci-dessous) — peut faire défiler `userId` de manière séquentielle et obtenir, pour CHAQUE joueur de la plateforme : email, prénom, nom, historique complet de participations, scores, indices utilisés. C'est une fuite massive de PII (RGPD) exploitable en quelques requêtes scriptées (`for i in 1..N: GET /participations/player/$i`).

**Correction** — vérifier l'ownership au niveau service (le partenaire ne doit voir que les joueurs ayant participé à SES chasses) :
```ts
// participations.service.ts
async findByPlayer(userId: number, requesterId: number, requesterRole: string) {
  if (requesterRole !== 'ADMIN') {
    const hasAccess = await this.prisma.participation.findFirst({
      where: { refUser: userId, hunt: { refUser: requesterId } },
      select: { id: true },
    });
    if (!hasAccess) throw new ForbiddenException();
  }
  return this.prisma.participation.findMany({ where: { refUser: userId }, ... });
}
```
```ts
// participations.controller.ts
@Get('player/:userId')
findByPlayer(
  @Request() req: { user: { sub: number; role: string } },
  @Param('userId', ParseIntPipe) userId: number,
) {
  return this.participationsService.findByPlayer(userId, req.user.sub, req.user.role);
}
```
Compléter par un contrôle de rôle explicite côté `(partner)/layout.tsx` (`if (session.role !== 'PARTNER' && session.role !== 'ADMIN') redirect('/login')`).

**Vérification** : se connecter en tant que partenaire A, appeler `/participations/player/<id-d-un-joueur-jamais-inscrit-a-ses-chasses>` → doit renvoyer `403`.

**Référence** : CWE-639 (Authorization Bypass Through User-Controlled Key / IDOR), OWASP A01:2021 (BOLA).

---

#### 3. `GET /users` (liste paginée) et `POST /users` accessibles sans authentification

**Fichiers** : `apps/api/src/users/users.controller.ts:63-74`

**Description/Preuve** :
```ts
@Post()
create(@Body() createUserDto: CreateUserDto) {
  return this.usersService.create(createUserDto);
}

@Get()
findAll(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
  return this.usersService.findAll(...);
}
```
Aucun `@UseGuards`. `findAll` (`users.service.ts:52-60`) effectue `this.prisma.user.findMany({ skip, take: pageSize })` **sans `omit`** — chaque page renvoie la liste brute incluant `passwordHash` et tous les tokens pour TOUS les utilisateurs.

**Impact** :
- `GET /users?pageSize=1000` → dump complet de la base utilisateurs (hash bcrypt + tokens de reset actifs + PII) en une requête, sans authentification. C'est l'aggravation directe du finding #1 : au lieu d'énumérer un par un, l'attaquant récupère tout en une fois.
- `POST /users` permet de créer un compte arbitraire en contournant `/auth/register` (pas d'email de vérification envoyé, `emailVerified` non initialisé dans `create` → potentiel utilisateur "fantôme" non vérifié mais exploitable selon la logique de `login`).

**Correction** :
```ts
@Get()
@UseGuards(AuthGuard('jwt'), RolesGuard) // + décorateur @Roles('ADMIN')
findAll(...) {
  return this.usersService.findAll(..., { omit: { passwordHash: true, resetToken: true, ... } });
}

// Supprimer purement et simplement POST /users (la création passe par /auth/register),
// ou le restreindre à @Roles('ADMIN').
```
Et dans `users.service.ts`, appliquer le même `omit` que `findMe` à `findAll`.

**Vérification** : `curl http://localhost:8000/users` doit renvoyer `401` ; avec un token `PLAYER`, `403`.

**Référence** : CWE-306 (Missing Authentication for Critical Function), OWASP A01:2021.

---

### ÉLEVÉ

#### 4. `GET /stats/all` — endpoint d'agrégation totalement public exposant des métriques internes de la plateforme

**Fichiers** : `apps/api/src/stats/stats.controller.ts:1-9` (déclaré directement dans `controllers: [StatsController]` de `app.module.ts:30`, sans guard)

**Description/Preuve** :
```ts
@Controller('stats')
export class StatsController {
    constructor(private readonly prisma: PrismaService) {}
    @Get('all')
    public async getStats(@Query() query: {  }) {
        console.log('Received stats request with query:', query);
        // groupBy hunt.status, participation.status, user.role, user.country,
        // newUsersCount (30 derniers jours), recentParticipations avec username + huntTitle ...
```
Aucun `@UseGuards` ; aucune borne de pagination ; expose `usersByCountry`, `usersByRole`, `newUsersCount`, et un flux d'activité récente nominatif (`username`, `huntTitle`, `points`, `date`).

**Impact** : Un concurrent ou un attaquant peut interroger `GET /stats/all` sans s'authentifier et obtenir : nombre total d'utilisateurs, répartition par pays/rôle, croissance (30 derniers jours), chasses les plus populaires, scores moyens, et un flux d'activité quasi temps-réel avec pseudos. C'est une fuite d'informations métier sensibles (business intelligence) qui devrait être réservée aux administrateurs/partenaires authentifiés. Combiné avec le `console.log` de la query (ligne 10), cela pollue aussi les logs serveur.

**Correction** :
```ts
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
@Controller('stats')
export class StatsController { ... }
```
Retirer le `console.log` ligne 10 (remplacer par `logInfo` si un suivi est nécessaire, sans la query brute).

**Vérification** : `curl http://localhost:8000/stats/all` → `401` sans token ; `403` avec un token non-`ADMIN`.

**Référence** : CWE-200, CWE-306, OWASP A01:2021 + A05:2021 (Security Misconfiguration).

---

#### 5. Contournement de la mécanique d'indices payants via accès direct à `GET /steps/:stepId/clues`

**Fichiers** : `apps/api/src/clues/clues.controller.ts:39-42`, `apps/api/src/clues/clues.service.ts:73-78`

**Description/Preuve** :
```ts
// clues.controller.ts — protégé par le guard de classe (authentifié), mais SANS vérification
// que l'appelant est le partenaire propriétaire OU qu'il a "payé" l'indice via revealClue
@Get('steps/:stepId/clues')
findByStep(@Param('stepId') stepId: string) {
  return this.cluesService.findByStep(Number(stepId));
}

// clues.service.ts:73-78
async findByStep(stepId: number) {
  return this.prisma.clue.findMany({
    where: { refStep: stepId },
    orderBy: { orderNumber: 'asc' },
  }); // renvoie `message` en clair pour TOUS les indices de l'étape
}
```
À comparer avec le flux joueur prévu et correctement implémenté : `getPlayerClues`/`revealClue` (`clues.service.ts:145-273`) qui imposent idempotence, séquentialité (`clue.orderNumber !== revealedCount + 1`) et n'exposent `message` qu'après "révélation" (avec pénalité de points appliquée).

**Impact** : N'importe quel joueur authentifié peut appeler `GET /steps/<id>/clues` (l'`id` de l'étape est visible dans la réponse de `GET /hunts/:id`, accessible publiquement) et récupérer **tous les messages d'indices d'une étape d'un coup, sans payer la moindre pénalité de points**. Cela casse intégralement l'équilibrage du jeu (un joueur peut systématiquement obtenir le dernier indice — généralement le plus parlant — gratuitement) et constitue un avantage compétitif déloyal sur le leaderboard.

**Correction** — restreindre cette route au CRUD partenaire (vérifier l'ownership comme `create`/`update`/`remove` le font déjà via `checkStepOwnership`), et exposer une route dédiée joueur qui ne renvoie QUE les indices déjà révélés (déjà existante : `getPlayerClues`) :
```ts
@Get('steps/:stepId/clues')
findByStep(
  @Request() req: { user: { sub: number; role: string } },
  @Param('stepId') stepId: string,
) {
  // Réutiliser checkStepOwnership pour s'assurer que seul le partenaire propriétaire
  // (ou un ADMIN) accède à la liste complète avec les messages
  return this.cluesService.findByStepForOwner(Number(stepId), req.user.sub, req.user.role);
}
```

**Vérification** : avec un compte `PLAYER` n'ayant pas révélé l'indice n°2, appeler `GET /steps/<id>/clues` ne doit jamais renvoyer le `message` de cet indice (uniquement via `GET /progress/:progressId/clues` après révélation payante).

**Référence** : CWE-840 (Business Logic Errors), OWASP A01:2021 / A04:2021 (Insecure Design).

---

#### 6. CORS configuré pour refléter n'importe quelle origine, combiné à `credentials: true`

**Fichiers** : `apps/api/src/main.ts:18-23`

**Description/Preuve** :
```ts
app.enableCors({
  origin: true,              // ← reflète Access-Control-Allow-Origin sur l'Origin de la requête
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
});
logInfo('info', 'CORS enabled for all origins');  // ← le log lui-même documente le problème
```
Avec `@nestjs/cors` (Express `cors` sous le capot), `origin: true` fait que **chaque requête reçoit `Access-Control-Allow-Origin: <origin envoyée>`** plus `Access-Control-Allow-Credentials: true`.

**Impact** : Si l'authentification de l'API se fait via cookie cross-site (ce qui n'est PAS le cas actuellement — le frontend transmet le JWT via header `Authorization: Bearer`, le cookie `auth_token` étant `httpOnly` côté Next.js et non envoyé directement à l'API), ce réglage serait directement exploitable pour du vol de session cross-origin. **Dans l'état actuel, l'exploitabilité directe est limitée** car (a) le navigateur n'envoie pas le cookie `httpOnly` Next.js vers `localhost:8000`, et (b) le header `Authorization` n'est jamais transmis automatiquement cross-site par le navigateur. Cependant :
- Cela reste une **mauvaise pratique de configuration en production** — n'importe quel site tiers peut faire des requêtes `fetch(..., {credentials: 'include'})` vers l'API et lire la réponse si jamais un cookie de session est introduit plus tard, ou si un attaquant arrive à faire exécuter du JS dans le contexte d'un domaine de confiance.
- Combiné à un futur ajout de cookies cross-site ou à une régression sur le mode d'auth, le risque de CSRF/vol de session devient immédiat.

**Correction** — restreindre explicitement aux origines connues via variables d'environnement :
```ts
const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:3000,http://localhost:3001').split(',');
app.enableCors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
});
```

**Vérification** : `curl -i -H "Origin: https://evil.example" http://localhost:8000/hunts` → l'en-tête `Access-Control-Allow-Origin` ne doit PAS refléter `https://evil.example`.

**Référence** : CWE-942 (Permissive Cross-domain Policy), OWASP A05:2021.

---

#### 7. Absence totale de rate limiting sur les endpoints sensibles (login, register, forgot/reset-password, validation d'étape)

**Fichiers** : `apps/api/src/main.ts` (aucun `ThrottlerModule`), `apps/api/src/auth/auth.controller.ts:8-50`, `apps/api/package.json` (pas de `@nestjs/throttler`/`express-rate-limit`)

**Description/Preuve** : recherche exhaustive (`grep -rn "ThrottlerGuard\|@Throttle\|@nestjs/throttler\|rate-limit"`) ne renvoie aucun résultat dans `apps/api/src`. Aucun package de rate limiting n'est présent dans `apps/api/package.json`.

**Impact** :
- `POST /auth/login` : bruteforce de mot de passe sans aucune limite (les seuls freins sont `bcrypt.compare` ~100ms et la latence réseau) — un attaquant scripté peut tester des milliers de combinaisons par minute par compte ciblé.
- `POST /auth/forgot-password` : permet de spammer des emails de réinitialisation vers une victime (déni de service ciblé / harcèlement), et de sonder l'existence de comptes en mesurant des différences de timing malgré la réponse anti-énumération.
- `POST /auth/register` : permet de créer en masse des comptes (spam, saturation de la table `users`, abus de l'envoi d'emails via `MailService`).
- `POST /participations/:id/steps/:stepId/validate` : sans limite, un script peut spammer cet endpoint pour forcer la condition de course du verrou optimiste ou simplement saturer la base.

**Correction** :
```bash
npm install @nestjs/throttler --workspace=apps/api
```
```ts
// app.module.ts
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 20 }]),
    // ...
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
```
```ts
// auth.controller.ts — limite plus stricte sur login/forgot-password
@Throttle({ default: { limit: 5, ttl: 60000 } })
@Post('login')
login(...) { ... }
```

**Vérification** : envoyer 30 requêtes `POST /auth/login` en 1 minute depuis la même IP → doit retourner `429 Too Many Requests` au-delà du seuil.

**Référence** : CWE-307 (Improper Restriction of Excessive Authentication Attempts), OWASP A07:2021.

---

#### 8. IDOR sur `GET /hunts/stats` et `GET /hunts/analytics` via `userId` en query param non vérifié

**Fichiers** : `apps/api/src/hunts/hunts.controller.ts:36-59`

**Description/Preuve** :
```ts
@Get('stats')
stats(@Query('userId') userId?: string) {
  const id = userId ? Number(userId) : null;
  return this.huntsService.stats(id);  // si id === null → stats GLOBALES toutes plateformes
}

@Get('analytics')
analytics(@Query('userId') userId?: string) {
  const id = userId ? Number(userId) : null;
  return this.huntsService.analytics(id); // expose détails par chasse, y compris d'autres partenaires
}
```
Aucun `@UseGuards`, aucune comparaison `userId === req.user.sub`. `analytics(null)` (`hunts.service.ts:182-205`) renvoie le détail (`avgDurationMinutes`, `totalClueUsages`, `completedCount`…) de **toutes les chasses de tous les partenaires**.

**Impact** : Un attaquant non authentifié peut appeler `GET /hunts/analytics` (sans `userId`) et obtenir les statistiques détaillées de chasses appartenant à n'importe quel partenaire concurrent (taux de complétion, durée moyenne, usage d'indices) — fuite de données métier B2B sensibles. Un partenaire malveillant peut aussi passer `userId=<id-d-un-concurrent>` pour consulter SES statistiques.

**Correction** :
```ts
@Get('stats')
@UseGuards(AuthGuard('jwt'))
stats(@Request() req: { user: { sub: number; role: string } }) {
  const id = req.user.role === 'ADMIN' ? null : req.user.sub;
  return this.huntsService.stats(id);
}
// idem pour analytics — dériver `userId` du JWT, jamais du query param
```

**Vérification** : `curl http://localhost:8000/hunts/analytics` (sans token) → `401` ; avec un token partenaire A et `?userId=<B>`, la réponse doit être identique à celle sans paramètre (= scoped sur A).

**Référence** : CWE-639 (IDOR), OWASP A01:2021 (BOLA).

---

#### 9. CVE HIGH sur dépendances directes : `axios`, `next`, `@ar-js-org/ar.js`

**Fichiers** : racine `package.json` (résolution via workspace), `apps/pwa/package.json:9` (`@ar-js-org/ar.js": "3.4.8"`), `apps/web/package.json` et `apps/pwa/package.json` (`"next": "16.1.5"`)

Voir section **Dépendances** ci-dessous pour le détail complet (CVE, scores CVSS, correctifs disponibles).

**Impact résumé** :
- `axios` 1.x < 1.16 — chaîne de CVE incluant **SSRF via bypass `NO_PROXY`** (CVSS 8.6), **MITM via prototype pollution sur `config.proxy`** (CVSS 8.7), vol d'identifiants/hijacking de requêtes — exploitable si l'application fait des requêtes sortantes contrôlées en partie par un attaquant (le module AR.js embarque `axios` en dépendance transitive côté PWA, surface d'attaque réduite mais non nulle si des URLs externes sont chargées par AR.js).
- `next` 16.1.5 — **8 CVE corrigées en 16.2.5/16.2.6/16.1.7**, dont SSRF via WebSocket upgrades (CVSS 8.6), bypass de Middleware/Proxy par injection de paramètre de route dynamique (CVSS 8.1), et XSS via CSP nonces / `beforeInteractive` scripts (CVSS 6.1).
- `@ar-js-org/ar.js` 3.4.8 — marqué `high` (via `aframe`/`artoolkit5-js`/`axios`), correctif majeur disponible en 3.4.5 *(note : le correctif suggéré par `npm audit` pointe vers une version antérieure au numéro déjà installé — ceci suggère un audit basé sur un graphe de dépendances complexe ; à vérifier manuellement avec `npm ls @ar-js-org/ar.js`)*.

**Correction prioritaire** :
```bash
npm install next@16.2.7 --workspace=apps/web --workspace=apps/pwa
npm install axios@latest   # forcer la résolution transitive si possible via "overrides"
```
Ajouter dans le `package.json` racine :
```json
"overrides": {
  "axios": "^1.16.0"
}
```

**Vérification** : relancer `npm audit --json | jq '.metadata.vulnerabilities'` → `high` doit passer à 0 (ou être justifié/documenté si le correctif casse une fonctionnalité AR).

**Référence** : CWE-1104 (Use of Unmaintained Third Party Components), OWASP A06:2021.

---

#### 10. `DELETE /ar-items/:id` et `GET /ar-items/:id/usage` sans vérification d'ownership — IDOR

**Fichiers** : `apps/api/src/ar-item/ar-item.controller.ts:44-53`, `apps/api/src/ar-item/ar-item.service.ts:103-110`

**Description/Preuve** :
```ts
// ar-item.controller.ts — guard de classe présent (authentifié) mais aucun contrôle d'ownership
@Get(':id/usage')
getUsage(@Param('id') id: string) {
  return this.arItemService.getUsage(id);
}

@Delete(':id')
@HttpCode(204)
remove(@Param('id') id: string) {
  return this.arItemService.remove(id);  // ← ne reçoit ni userId ni role
}
```
```ts
// ar-item.service.ts:103-110
async remove(id: string) {
  const usage = await this.getUsage(id);
  if (usage.stepsCount > 0) { throw new ConflictException(...); }
  const arItem = await this.prisma.arItem.findUniqueOrThrow({ where: { id } });
  await this.prisma.arItem.delete({ where: { id } });
  await this.storage.deleteObject(arItem.filepath).catch(() => {});
}
```
À comparer avec `findByPartner` (lignes 60-76) qui, lui, scope correctement par `h."ref_user" = ${userId}`.

**Impact** : Tout utilisateur authentifié — y compris un `PLAYER` — connaissant ou devinant l'`id` (UUID, mais potentiellement visible dans les réponses de `GET /hunts/:id` via `arItem.id`) d'un modèle 3D AR appartenant à **un autre partenaire**, peut le supprimer définitivement (`DELETE /ar-items/<uuid-d-un-tiers>`) si celui-ci n'est rattaché à aucune étape (`stepsCount === 0`, ce qui est le cas avant publication d'une chasse). C'est une suppression de ressource métier appartenant à un tiers (perte de modèle 3D uploadé, coût de stockage S3 et de re-upload pour la victime).

**Correction** :
```ts
async remove(id: string, userId: number, role: string) {
  const arItem = await this.prisma.arItem.findUniqueOrThrow({ where: { id } });
  if (role !== 'ADMIN') {
    const owns = await this.prisma.$queryRaw<[{ count: bigint }]>(Prisma.sql`
      SELECT COUNT(*) as count FROM "steps" s
      INNER JOIN "hunts" h ON s."ref_hunt" = h.id
      WHERE s."ref_ar_item" = ${id} AND h."ref_user" = ${userId}
    `);
    // Ou plus simple : tracer le refUser au moment de l'upload (ajouter une colonne refUser sur ArItem)
  }
  ...
}
```
Idéalement, ajouter une colonne `refUser` sur le modèle `ArItem` au moment de l'upload (`ar-item.service.ts:upload`) pour simplifier la vérification d'ownership (actuellement déduite indirectement via les `steps`/`hunts`, ce qui échoue pour un AR Item fraîchement uploadé et non encore associé à une étape).

**Vérification** : se connecter en tant que partenaire B, tenter `DELETE /ar-items/<uuid-appartenant-à-A>` → doit retourner `403`.

**Référence** : CWE-639 (IDOR), OWASP A01:2021.

---

### MOYEN

#### 11. `CreateUserDto`/`UpdateUserDto` dépourvus de tout décorateur `class-validator`

**Fichiers** : `packages/types/src/users/dto/create-user.dto.ts`, `packages/types/src/users/dto/update-user.dto.ts`

**Description/Preuve** :
```ts
// create-user.dto.ts — AUCUN décorateur class-validator
export class CreateUserDto {
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  profilePicture?: string;
  country: string;
}
```
Comparer avec `CreateClueDto`/`CreateHuntDto`/`StartHuntDto` qui sont, eux, correctement décorés (`@IsString`, `@IsEmail`, `@MinLength`…). Le `ValidationPipe` global (`whitelist: true, transform: true`) **filtre les propriétés non déclarées** mais **n'impose aucune contrainte de format/longueur** en l'absence de décorateurs — un `password: ""`, un `email: "pas-un-email"`, ou un `username` de 5000 caractères passeraient la validation.

**Impact** : `POST /users` (qui, combiné au finding #3, est accessible sans authentification) et `PATCH /users/:id` acceptent des mots de passe vides ou triviaux (`"a"`), des emails malformés, des noms d'utilisateur surdimensionnés (déni de service applicatif via stockage de chaînes énormes). Cela contourne toute politique de robustesse de mot de passe attendue pour une plateforme manipulant des PII et des tokens d'accès.

**Correction** :
```ts
import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsString() @IsNotEmpty() @MaxLength(50) username: string;
  @IsString() @IsNotEmpty() @MaxLength(80) firstname: string;
  @IsString() @IsNotEmpty() @MaxLength(80) lastname: string;
  @IsEmail() email: string;
  @IsString() @MinLength(8) @MaxLength(72) password: string; // 72 = limite bcrypt
  @IsOptional() @IsString() profilePicture?: string;
  @IsString() @IsNotEmpty() country: string;
}
```

**Vérification** : `POST /users` avec `{ "password": "a", "email": "x" }` → doit retourner `400 Bad Request` listant les contraintes violées.

**Référence** : CWE-20 (Improper Input Validation), OWASP A04:2021 (Insecure Design).

---

#### 12. DTOs d'authentification sous forme de types inline — `class-validator` totalement inopérant sur `/auth/*`

**Fichiers** : `apps/api/src/auth/auth.controller.ts:9-50`

**Description/Preuve** :
```ts
@Post('register')
register(@Body() body: { firstname: string; lastname: string; ...; password: string; role?: string }) { ... }

@Post('login')
login(@Body() body: { email: string; password: string }) { ... }
```
Le `ValidationPipe` de NestJS ne peut effectuer de validation `class-validator` (`@IsEmail`, `@MinLength`…) **que sur des paramètres dont le type au runtime est une classe** (les métadonnées de décorateurs sont attachées au prototype de la classe). Un littéral de type `{ email: string }` est compilé en `Object` — **aucune règle de validation ne s'applique**, même si `whitelist`/`transform` sont activés globalement. Cela signifie que **les routes les plus critiques de toute l'application (`register`, `login`, `forgot-password`, `reset-password`, `verify-email`) ne bénéficient d'AUCUNE validation de schéma** : pas de vérification de format email, pas de longueur minimale de mot de passe, pas de validation de la présence des champs.

**Impact** :
- `POST /auth/register` avec `email: 12345` ou `password: ""` passe la validation HTTP et atteint directement `bcrypt.hash("", 10)` puis `prisma.user.create` — risque de plantage Prisma non maîtrisé (erreur 500 avec stack trace potentielle, cf. finding lié à la gestion d'erreurs) ou de création de comptes avec des données invalides.
- Aucune limite de taille sur `email`/`password`/`username` envoyés → DoS applicatif léger par body surdimensionné.
- Le flag `role?: string` (déjà discuté en finding #21bis ci-dessous concernant `register`) transite sans aucune validation de type/enum.

**Correction** — créer de vrais DTOs décorés et les utiliser dans le contrôleur :
```ts
// auth/dto/register.dto.ts
export class RegisterDto {
  @IsString() @IsNotEmpty() @MaxLength(80) firstname: string;
  @IsString() @IsNotEmpty() @MaxLength(80) lastname: string;
  @IsString() @IsNotEmpty() @MaxLength(50) username: string;
  @IsEmail() email: string;
  @IsString() @MinLength(8) @MaxLength(72) password: string;
  @IsString() @IsNotEmpty() country: string;
  @IsOptional() @IsIn(['PLAYER', 'PARTNER']) role?: string;
}
// auth/dto/login.dto.ts
export class LoginDto {
  @IsEmail() email: string;
  @IsString() @IsNotEmpty() password: string;
}
```
```ts
@Post('register')
register(@Body() dto: RegisterDto) { return this.authService.register(dto); }

@Post('login')
@HttpCode(200)
login(@Body() dto: LoginDto) { return this.authService.login(dto.email, dto.password); }
```

**Vérification** : `POST /auth/login` avec `{ "email": 123, "password": [] }` doit désormais retourner `400 Bad Request` (au lieu d'atteindre `prisma.user.findUnique({ where: { email: 123 } })`).

**Référence** : CWE-20, OWASP A04:2021 / A07:2021.

---

#### 13. Logs de production contenant des propos déplacés et un commentaire documentant comment logger des mots de passe en clair

**Fichiers** : `apps/api/src/auth/auth.service.ts:64` (`"...un qui a oublie sont mdp :)"`), `:69-70` (`// logInfo('warn', \`leak de mot de passe: ${dto.password}\`...)`), `:132`, `:139` ; `apps/api/src/hunts/hunts.service.ts:116, 176, 252, 258`

**Description/Preuve** : voir le rapport de maintenabilité (finding #2) — confirmé en lecture directe. Le point le plus grave du point de vue sécurité est la ligne 69-70 :
```ts
// logInfo('warn', `leak de mot de passe: ${dto.password}`, 'AuthService'); a ne jamais active
// sauf si on veux la mettre a l'envers SDV :)
```
Cette ligne, bien que commentée, **constitue une trace écrite et committée d'une fonction prête à logger des mots de passe en clair dans `logs/app.log`** — un fichier persistant sur disque, potentiellement sauvegardé, exporté, ou consulté par un tiers (mainteneur, outil d'analyse de logs, pipeline CI).

**Impact** : Risque de conformité RGPD/sécurité majeur si cette ligne est activée par erreur (un copier-coller, un commit accidentel) — chaque tentative de connexion/inscription écrirait le mot de passe en clair dans un fichier de log persistant. Même commentée, elle constitue un signal d'alarme fort en revue de sécurité externe (audit, due diligence) et nuit à la crédibilité professionnelle du code. Les autres logs (`raté mon coco`, `encore raté`, `crétin`) sont inappropriés pour un contexte professionnel et indiquent un manque de rigueur sur la frontière dev/prod.

**Correction** :
```ts
// Supprimer ENTIÈREMENT les lignes 69-70 (pas de commentaire, pas de code mort)
const hash = await bcrypt.hash(dto.password, 10);

// Remplacer les messages par des formulations neutres et factuelles :
logInfo('error', `Tentative d'inscription avec un email déjà utilisé: ${dto.email}`, 'AuthService');
logInfo('error', `Échec d'authentification — email inconnu: ${email}`, 'AuthService');
logInfo('error', `Échec d'authentification — mot de passe invalide pour: ${email}`, 'AuthService');
```

**Vérification** : `grep -ri "mdp\|leak\|raté\|crétin\|relou" apps/api/src -r` doit ne renvoyer aucun résultat après correction. Ajouter une règle de lint/CI (`grep` bloquant en pre-commit) pour empêcher la régression.

**Référence** : CWE-532 (Insertion of Sensitive Information into Log File), OWASP A09:2021.

---

#### 14. Absence de `helmet` / headers de sécurité HTTP sur l'API NestJS

**Fichiers** : `apps/api/src/main.ts` (aucune configuration `helmet`)

**Description/Preuve** : `grep -rn "helmet"` ne renvoie aucun résultat dans `apps/api/src` ni dans `apps/api/package.json`. L'API démarre sans aucun middleware de headers de sécurité — pas de `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`, `Referrer-Policy`.

**Impact** : Exposition accrue au clickjacking (absence de `X-Frame-Options`/`frame-ancestors`), au MIME-sniffing (`X-Content-Type-Options: nosniff` absent), et absence de `HSTS` qui force le HTTPS. Dans un contexte où l'API sert potentiellement des réponses JSON consommées par des navigateurs (web/pwa) et où des assets sont proxyfiés, ces headers constituent une couche de défense en profondeur standard et peu coûteuse à mettre en place.

**Correction** :
```bash
npm install helmet --workspace=apps/api
```
```ts
// main.ts
import helmet from 'helmet';
app.use(helmet());
```

**Vérification** : `curl -I http://localhost:8000/hunts` doit afficher `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN` (ou équivalent CSP `frame-ancestors`), etc.

**Référence** : CWE-1021 (Improper Restriction of Rendered UI Layers), OWASP A05:2021.

---

#### 15. JWT à durée de vie fixe de 7 jours, sans refresh token ni mécanisme de révocation

**Fichiers** : `apps/api/src/auth/auth.module.ts:15` (`signOptions: { expiresIn: '7d' }`), absence totale de `refresh`/`revoke`/`blacklist` dans le code (`grep -ri "refresh"` négatif)

**Description/Preuve** :
```ts
JwtModule.register({
  secret: requireEnv('JWT_SECRET'),
  signOptions: { expiresIn: '7d' },
}),
```
Aucun mécanisme de rafraîchissement (refresh token), de liste de révocation, ni de rotation de session. Le `logoutAction` côté front (`apps/web/lib/actions/auth.actions.ts:97-100`, `apps/pwa/lib/actions/auth.actions.ts:73-75`) se contente de `cookies().delete('auth_token')` — **le JWT lui-même reste valide côté serveur jusqu'à expiration**.

**Impact** : En cas de vol de token (XSS, log accidentel, MITM sur connexion non chiffrée en environnement de test), l'attaquant dispose d'un accès valide pendant **jusqu'à 7 jours**, sans aucun moyen pour la plateforme de révoquer ce token avant son expiration naturelle (pas de "déconnexion forcée de tous les appareils", pas de réponse à un changement de mot de passe — d'ailleurs `resetPassword` ne révoque pas les sessions existantes : un attaquant ayant volé l'ancien token continue d'accéder au compte même après que la victime a changé son mot de passe).

**Correction** — réduire la durée de vie de l'access token et introduire un refresh token côté serveur (avec table de révocation/rotation), ou a minima invalider les tokens émis avant un changement de mot de passe (stocker un `tokenVersion`/`passwordChangedAt` sur `User` et le vérifier dans `JwtStrategy.validate`) :
```ts
// jwt.strategy.ts
async validate(payload: { sub: number; role: string; iat: number }) {
  const user = await this.prisma.user.findUnique({ where: { id: payload.sub }, select: { passwordChangedAt: true } });
  if (user?.passwordChangedAt && payload.iat * 1000 < user.passwordChangedAt.getTime()) {
    throw new UnauthorizedException('Session expirée — veuillez vous reconnecter');
  }
  return { sub: payload.sub, role: payload.role };
}
```

**Vérification** : changer le mot de passe d'un compte, puis réutiliser l'ancien token JWT sur une route protégée → doit retourner `401`.

**Référence** : CWE-613 (Insufficient Session Expiration), CWE-384 (Session Fixation — apparenté), OWASP A07:2021.

---

#### 16. Conteneurs Docker exécutés en `root` (api, web, pwa, db)

**Fichiers** : `apps/api/Dockerfile`, `apps/web/Dockerfile`, `apps/pwa/Dockerfile`, `apps/db/Dockerfile`

**Description/Preuve** : aucun des 4 Dockerfiles ne contient de directive `USER`. Les images de base (`node:24-bookworm-slim`, `postgres:18-alpine`) démarrent par défaut avec l'utilisateur `root` tant qu'aucun `USER` n'est explicitement défini (contrairement à certaines images Alpine qui prévoient un utilisateur `node` prêt à l'emploi — encore faut-il l'activer via `USER node`).

**Impact** : En cas de compromission applicative (RCE via une dépendance vulnérable, désérialisation, etc.), le processus compromis dispose des **privilèges root dans le conteneur**, ce qui facilite l'évasion de conteneur (container breakout) si le runtime Docker est mal configuré, et l'écriture/modification de fichiers système dans l'image. C'est une violation du principe de moindre privilège, listée explicitement dans la checklist d'audit fournie ("Dockerfile : pas d'exécution en `root`").

**Correction** (exemple pour `apps/api/Dockerfile`, stage `runner`) :
```dockerfile
FROM node:24-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN groupadd --gid 1001 nodejs && useradd --uid 1001 --gid nodejs --shell /bin/bash --create-home nodeapp
COPY --from=builder --chown=nodeapp:nodejs /app/ .
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
USER nodeapp
EXPOSE 8000
CMD ["node", "apps/api/dist/src/main"]
```
Appliquer le même schéma à `web`/`pwa` (les images `runner` Next.js standalone sont particulièrement adaptées à un `USER nextjs` non privilégié, pattern documenté officiellement par Vercel).

**Vérification** : `docker run --rm <image> id` doit afficher `uid=1001(nodeapp) gid=1001(nodejs)`, jamais `uid=0(root)`.

**Référence** : CWE-250 (Execution with Unnecessary Privileges), OWASP Docker Top 10 / CIS Docker Benchmark 4.1.

---

#### 17. `console.log` en environnement serveur exposant la configuration et les coordonnées GPS des joueurs

**Fichiers** : `apps/pwa/lib/assets.ts:2-3`, `apps/pwa/app/hunts/[id]/game/map/page.tsx:53,61,63,66,69,77,78,81,84,93`, `apps/web/lib/auth.ts:18`

**Description/Preuve** :
```ts
// apps/pwa/lib/assets.ts:2-3 — exécuté au chargement du MODULE (donc côté serveur en SSR)
const ASSETS_BASE = process.env.NEXT_PUBLIC_ASSETS_BASE_URL ?? "/assets";
console.log("process.env.NEXT_PUBLIC_ASSETS_BASE_URL => ", process.env.NEXT_PUBLIC_ASSETS_BASE_URL)
console.log("ASSETS_BASE => ", ASSETS_BASE)
```
```ts
// apps/pwa/app/hunts/[id]/game/map/page.tsx:69 — DANS le callback watchPosition
(pos) => {
  console.log("POSITION -> ", pos.coords);   // latitude/longitude/accuracy en clair
  setUserCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude })
},
```

**Impact** : Bien que ces `console.log` s'exécutent côté navigateur du joueur (donc visibles uniquement par lui-même via les DevTools dans le cas de `map/page.tsx`), `lib/assets.ts:2-3` s'exécute **au chargement du module — y compris côté serveur en SSR/Docker** — et écrit la configuration d'environnement dans les logs serveur (`stdout`/Docker logs), accessibles aux opérateurs d'infrastructure et potentiellement agrégés dans des outils de monitoring tiers. Sur `map/page.tsx`, les coordonnées GPS précises du joueur transitent par la console — un risque amplifié si un *browser extension* malveillant ou un script de monitoring tiers capture la console (cas réel de fuite de données de géolocalisation, donnée particulièrement sensible au sens RGPD — article 9 si croisée avec d'autres attributs).

**Correction** : supprimer ces lignes (déjà recommandé dans le rapport de maintenabilité, finding #3) ; pour `lib/assets.ts`, ne garder qu'un export pur :
```ts
const ASSETS_BASE = process.env.NEXT_PUBLIC_ASSETS_BASE_URL ?? "/assets";
export function assetUrl(value: string | null | undefined): string | null { ... }
```

**Vérification** : `docker compose logs pwa | grep -i "ASSETS_BASE\|POSITION"` doit ne renvoyer aucune ligne après correction.

**Référence** : CWE-532 (Information Exposure Through Log Files), CWE-359 (Exposure of Private Geolocation Data), RGPD art. 5/9.

---

### FAIBLE

#### 18. `ValidateStepDto.latitude`/`longitude` optionnels — comportement non vérifié si absents sur une étape géolocalisée *(à vérifier — finding partiellement spéculatif)*

**Fichiers** : `apps/api/src/participations/dto/validate-step.dto.ts:1-15`, `apps/api/src/participations/participations.service.ts:296-320`

**Description/Preuve** :
```ts
export class ValidateStepDto {
  @IsOptional() @IsNumber() @Min(-90) @Max(90) latitude?: number;
  @IsOptional() @IsNumber() @Min(-180) @Max(180) longitude?: number;
}
```
```ts
if (geoResult?.hasLocation) {
  const [result] = await this.prisma.$queryRaw<Array<{ isInZone: boolean }>>(
    Prisma.sql`SELECT ST_DWithin("location", ST_MakePoint(${dto.longitude}, ${dto.latitude})::geography, ${step.radius}) ...`
  );
  if (!result?.isInZone) { throw new BadRequestException(...); }
}
```
**Le code Prisma/SQL gère correctement** un appel sans coordonnées (`dto.longitude`/`dto.latitude` valant `undefined`) : `ST_MakePoint(NULL, NULL)` produit un point géographique invalide, et `ST_DWithin(location, NULL, radius)` renvoie `NULL`/`false`, donc `result?.isInZone` est falsy → l'exception `BadRequestException("Vous n'êtes pas dans la zone de déclenchement")` est levée. **Le comportement observé par lecture du code est donc sûr** (fail-closed) : un appel direct à l'API sans coordonnées sur une étape géolocalisée échoue par défaut plutôt que de valider l'étape.

**Ce qui reste à vérifier (non confirmé par test d'exécution réelle)** : le comportement exact de `ST_MakePoint` avec des paramètres `NULL` côté PostgreSQL/PostGIS (le pilote Prisma sérialise `undefined` en `NULL` SQL). Sur la base de la sémantique standard de PostGIS, `ST_MakePoint(NULL, NULL)` retourne `NULL`, et toute opération `ST_DWithin(_, NULL, _)` retourne `NULL` — donc `isInZone` est `null`/falsy, le test `!result?.isInZone` est vrai, et l'exception est levée. **Le système semble donc fail-closed**, mais ceci mérite un test d'intégration explicite (cas non couvert par les specs existantes, cf. finding #8 du rapport de maintenabilité).

**Recommandation (hardening, indépendamment du verdict ci-dessus)** : rendre `latitude`/`longitude` **obligatoires** dès lors que l'étape est géolocalisée, en validant cette contrainte explicitement dans le service plutôt que de compter sur le comportement implicite de PostGIS face à des `NULL` :
```ts
if (geoResult?.hasLocation && (dto.latitude == null || dto.longitude == null)) {
  throw new BadRequestException('Coordonnées GPS requises pour valider cette étape');
}
```

**Vérification** : ajouter un test d'intégration `validateStep` avec `{}` (body vide) sur une étape `GPS` géolocalisée → doit lever `BadRequestException`, pas planter ni valider.

**Référence** : CWE-20 (Improper Input Validation) — classé "à vérifier"/faible car le code paraît fail-closed à la lecture, sans confirmation par exécution.

---

#### 19. Algorithme JWT non restreint explicitement dans `JwtStrategy`

**Fichiers** : `apps/api/src/auth/jwt.strategy.ts:9-13`

**Description/Preuve** :
```ts
super({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: requireEnv('JWT_SECRET'),
  // pas de `algorithms: ['HS256']`
});
```
**Analyse d'exploitabilité** : `passport-jwt`/`jsonwebtoken` avec un `secretOrKey` de type chaîne (clé symétrique) **restreint déjà la vérification aux algorithmes HMAC** par défaut côté librairie `jsonwebtoken` lorsqu'aucune option `algorithms` n'est fournie ET que la clé est une chaîne — la confusion classique RS256↔HS256 (qui exploite la réutilisation d'une clé publique RSA comme secret HMAC) **ne s'applique pas ici** car l'application n'utilise pas de paire de clés asymétriques. L'attaque `alg: none` est également bloquée par `jsonwebtoken` qui refuse cet algorithme par défaut. **Ce finding est donc principalement du hardening défensif** (rendre la configuration explicite et auto-documentée plutôt que de dépendre du comportement implicite d'une librairie tierce qui pourrait évoluer).

**Correction** (défense en profondeur) :
```ts
super({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: requireEnv('JWT_SECRET'),
  algorithms: ['HS256'],
});
```

**Vérification** : forger un token avec `alg: none` ou `alg: RS256` (signé avec une clé arbitraire) et vérifier qu'il est rejeté par `AuthGuard('jwt')` (`401`).

**Référence** : CWE-347 (Improper Verification of Cryptographic Signature), OWASP A02:2021 — classé faible/hardening car non exploitable dans la configuration actuelle.

---

#### 20. Absence de `@MaxLength` sur les champs texte saisis par l'utilisateur

**Fichiers** : `apps/api/src/clues/dto/create-clue.dto.ts` (`message: string`), `apps/api/src/hunts/dto/create-hunt.dto.ts` (`title`, `shortDescription`, `description`)

**Description/Preuve** : `@IsString() @IsNotEmpty() message: string;` sans `@MaxLength`. Idem pour `title`/`description` de `CreateHuntDto`.

**Impact** : Un partenaire (ou un attaquant ayant un compte) peut soumettre des champs de plusieurs mégaoctets de texte (`message`, `description`), ce qui (a) gonfle la base de données sans limite, (b) peut dégrader les performances de rendu côté frontend (PWA/web affichant ces champs), (c) constitue un vecteur de DoS applicatif léger (stockage, bande passante, rendu).

**Correction** :
```ts
@IsString() @IsNotEmpty() @MaxLength(500) message: string;
@IsString() @IsNotEmpty() @MaxLength(120) title: string;
@IsOptional() @IsString() @MaxLength(2000) description?: string;
```

**Vérification** : `POST /steps/:id/clues` avec `message` de 100 000 caractères → doit retourner `400`.

**Référence** : CWE-1284 (Improper Validation of Specified Quantity in Input), OWASP A04:2021.

---

### INFO

#### 21. Range wildcard `"@nestjs/mapped-types": "*"` en dépendance externe directe

**Fichiers** : `apps/api/package.json:32`

**Description** : `"@nestjs/mapped-types": "*"` accepte n'importe quelle version publiée, y compris une version majeure cassante ou (en théorie) une version malveillante en cas de compromission du registre npm/du mainteneur. Risque réel faible ici (package officiel NestJS, activement maintenu), mais c'est une entorse à la politique de pinning par ranges sémantiques (`^x.y.z`) appliquée partout ailleurs.

**Correction** : `"@nestjs/mapped-types": "^2.0.5"` (ou la version actuellement résolue, à vérifier via `npm ls @nestjs/mapped-types`).

**Référence** : CWE-1357 (Reliance on Insufficiently Trustworthy Component), OWASP A06:2021 (hygiène).

---

#### 22. `NEXT_PUBLIC_AR_FAKE_GPS=true` présent dans `apps/pwa/.env` sans usage dans le code

**Fichiers** : `apps/pwa/.env:1`

**Description/Preuve** : `grep -rn "FAKE_GPS\|fakeGps" apps/pwa` ne renvoie aucune occurrence dans le code source — la variable est définie mais jamais lue. C'est un résidu de configuration de développement (probablement destiné à simuler une position GPS pour tester l'AR sans se déplacer physiquement), qui ne pose pas de risque direct (le `.env` n'est pas commité) mais constitue un signal de configuration non finalisée et de confusion potentielle pour un futur mainteneur qui pourrait croire qu'un mécanisme de "GPS simulé" existe et influence le comportement serveur (alors qu'il n'en est rien — la validation reste serveur-side via PostGIS, cf. finding #18).

**Correction** : retirer la variable du `.env`/`.env.example` si la fonctionnalité n'est pas implémentée, ou l'implémenter et la documenter clairement comme outil de développement uniquement (avec un garde-fou `if (process.env.NODE_ENV !== 'production')`).

**Référence** : hygiène de configuration, pas de CWE applicable directement.

---

## Dépendances

### Résultat de `npm audit --json` (exécuté à la racine du monorepo)

```
"vulnerabilities": {
  "info": 0, "low": 0, "moderate": 11, "high": 4, "critical": 0, "total": 15
},
"dependencies": { "prod": 955, "dev": 541, "optional": 283, "total": 1768 }
```

**4 vulnérabilités HIGH** (aucune CRITICAL) :

| Package | Sévérité | Range affecté | Type | Correctif |
|---|---|---|---|---|
| `axios` (transitif via `@ar-js-org/artoolkit5-js`) | High | `1.0.0 - 1.15.2` | SSRF (CWE-918, CVSS jusqu'à 8.6/8.7), Prototype Pollution → vol d'identifiants/MITM (CWE-1321, CVSS 7-7.4), DoS (CWE-770/400) — **24 avisories au total** | mise à jour transitive via `@ar-js-org/ar.js@3.4.5` ou `overrides` npm vers `axios@^1.16.0` |
| `next` (direct, `apps/web` + `apps/pwa`) | High | `9.3.4-canary.0 - 16.3.0-canary.5` (installé : `16.1.5`) | SSRF via WebSocket upgrade (CVSS 8.6), Middleware/Proxy bypass via injection de paramètre dynamique (CVSS 8.1), DoS Server Components (CVSS 7.5 ×2), XSS via CSP nonces (CVSS 6.1) — **19 avisories** | `next@16.2.7` |
| `@ar-js-org/ar.js` (direct, `apps/pwa`) | High | `*` (installé `3.4.8`) | hérite de `axios`/`artoolkit5-js` | `@ar-js-org/ar.js@3.4.5` (note : version "fix" antérieure à l'installée — à examiner avec `npm ls`, possible faux positif de résolution de graphe ou installation hors plage déclarée) |
| `@ar-js-org/artoolkit5-js` (transitif) | High | `>=0.3.1` | via `axios` | suit `@ar-js-org/ar.js` |

**11 vulnérabilités MODERATE** notables :
- `postcss < 8.5.10` (transitif via `next`) : XSS via stringification CSS non échappée (CWE-79, CVSS 6.1) — corrigé par la mise à jour de `next`.
- `@nestjs-modules/mailer` (direct, `apps/api`) : range `1.4.0-1.11.2 || >=2.0.2` via `preview-email`/`uuid < 11.1.1` — correctif `@nestjs-modules/mailer@2.0.1`.
- `prisma`/`@prisma/dev`/`@hono/node-server` : vulnérabilité de contournement de middleware sur serveur de dev Prisma (`CWE-22`, CVSS 5.3) — n'affecte que l'outillage de développement (`prisma dev`), pas le runtime de production. Correctif : `prisma@6.19.3`.
- `aframe`, `got`, `nice-color-palettes`, `three-bmfont-text` : tous transitifs via `@ar-js-org/ar.js`, suivent sa mise à jour.

**Versions des frameworks majeurs** :
- NestJS : `^11.0.1` (à jour, branche stable)
- Next.js : `16.1.5` installé sur `web` et `pwa` (la dernière version stable corrigeant les CVE listées est `16.2.7`/`16.2.6`)
- React : `^19.2.0`
- Prisma : `^7.4.2` (déclaré), avec une résolution `@prisma/dev` problématique signalée par l'audit
- bcrypt : `^6.0.0`, cost factor 10 (acceptable)

**Recommandation** : prioriser la mise à jour de `next` (4 CVE HIGH avec CVSS ≥ 7.5, dont un SSRF à 8.6 directement exploitable sur une app exposée publiquement) et investiguer la résolution effective d'`axios`/`@ar-js-org/ar.js` via `npm ls axios` pour déterminer si un `overrides` npm peut forcer une version patchée sans casser l'AR.

---

## Points positifs sécurité

- **Requêtes PostGIS systématiquement paramétrées** : tous les `$queryRaw`/`$executeRaw` (`participations.service.ts:294,301-308`, `hunts.service.ts:97,143-153,282,333`, `ar-item.service.ts:69,90`) utilisent le tagged-template `Prisma.sql` avec interpolation, qui génère des requêtes préparées paramétrées — **aucune concaténation de chaînes brute, aucune injection SQL identifiée**.
- **Géofence validée côté serveur** : `participations.service.ts:296-320` revérifie systématiquement la position via `ST_DWithin` PostGIS, indépendamment du calcul `haversineDistance` côté client (qui n'est qu'indicatif pour l'UI, `apps/pwa/app/hunts/[id]/game/map/page.tsx:110-119`) — la logique anti-cheat de proximité géographique ne peut pas être contournée par manipulation du client.
- **Idempotence et transactions correctement gérées** : `requestClue`/`revealClue` (`clues.service.ts:200-261`, `participations.service.ts:441-456`) vérifient l'existence préalable d'un `clueUsage` avant création (contrainte unique `refProgress_refClue`), et `validateStep` utilise un verrou optimiste (`where: { id, statut: 'IN_PROGRESS' }` → `P2025` → `ConflictException`) empêchant la double validation/double attribution de récompense en cas de requêtes concurrentes.
- **Validation de fichiers robuste** : `files.service.ts:65-86` et `ar-item.service.ts:113-138` valident le type MIME ET la taille ET les "magic bytes" (signature binaire `glTF`) pour les modèles `.glb` — bien au-delà d'une simple vérification d'extension. Noms de fichiers générés via `randomUUID()` (pas de chemin contrôlé par l'utilisateur → pas de path traversal sur les clés S3).
- **Cookies de session correctement configurés** : `httpOnly: true`, `secure: process.env.NODE_ENV === 'production'`, `sameSite: 'lax'` dans `apps/web/lib/actions/auth.actions.ts:7-13` et `apps/pwa/lib/actions/auth.actions.ts:8-14` — protection effective contre le vol de token via XSS (le JS client ne peut pas lire `auth_token`) et contre le CSRF basique (`SameSite=Lax`).
- **Anti-énumération sur `forgotPassword`** : `auth.service.ts:182-187` retourne silencieusement (sans erreur ni email envoyé) si l'utilisateur n'existe pas, et le contrôleur renvoie un message générique identique dans tous les cas (`auth.controller.ts:40-43`).
- **JWT_SECRET sans fallback en dur** : `requireEnv('JWT_SECRET')` (`config/env.ts`) fait planter le démarrage de l'application si la variable est absente — empêche le déploiement accidentel avec un secret par défaut prévisible. Aucun secret hardcodé identifié dans le code source (recherche exhaustive sur `JWT_SECRET`/`secretOrKey`/`secret:`).
- **`.env` correctement exclus de git** : aucun fichier `.env` (hors `.env.example`) n'est tracké dans l'historique git (`git ls-files`/`git log --all -- "*.env"` négatifs) ; les `.env.example` ne contiennent que des valeurs factices documentées (`changeMe`, `dev-jwt-secret-replace-in-prod`).
- **DTOs métier correctement validés** : `CreateHuntDto`, `CreateClueDto`, `UpdateClueDto`, `StartHuntDto`, `ValidateStepDto` portent des décorateurs `class-validator` complets (`@IsString`, `@IsInt`, `@Min`/`@Max`, `@IsEnum`…), avec bornage explicite des coordonnées GPS (`@Min(-90) @Max(90)` / `@Min(-180) @Max(180)`) et des points/pénalités (`@Min(0)`).
- **Validation de budget de pénalité côté serveur** : `clues.service.ts:45-55` et `hunts.service.ts:367-392` empêchent qu'un partenaire configure une somme de pénalités d'indices supérieure aux points de l'étape — logique métier appliquée systématiquement côté serveur, jamais déléguée au client.
- **Ownership systématiquement vérifié sur les flux de jeu critiques** : `participations.service.ts:223-225,251-258` (`findOne`/`validateStep`/`requestClue`) et `clues.service.ts:300-302` comparent toujours `participation.refUser !== userId` ⇒ `ForbiddenException`, dérivant l'identité du `req.user.sub` (issu du JWT vérifié), jamais d'un paramètre de requête manipulable — conforme à la bonne pratique "deriver l'identité du token, jamais du body" (cf. commit `4518be8`).
- **`role` dérivé du JWT signé, pas du body**, dans les contrôleurs `clues`/`ar-item` (`req.user.role`) — le contrôle RBAC `if (role === 'ADMIN') return;` (`clues.service.ts:346,360`) s'appuie sur une donnée serveur-trusted.

---

## Plan de remédiation priorisé

| Priorité | Action | Sévérité | Effort estimé |
|---|---|---|---|
| 1 | Corriger `findOne`/`findAll` (`omit` complet) + ajouter `@UseGuards` sur `GET /users/:id`, `GET /users`, `POST /users` (findings #1, #3) | Critique | 2-3h |
| 2 | Ajouter une vérification d'ownership sur `GET /participations/player/:userId` (dériver depuis JWT + check appartenance) (finding #2) | Critique | 2-4h |
| 3 | Protéger `GET /stats/all` avec un guard + rôle `ADMIN` (finding #4) | Élevé | 1h |
| 4 | Restreindre/sécuriser `GET /steps/:stepId/clues` (vérification ownership partenaire, ne plus exposer `message` aux joueurs hors flux `revealClue`) (finding #5) | Élevé | 2-3h |
| 5 | Restreindre le CORS aux origines explicites via variable d'environnement (finding #6) | Élevé | 1h |
| 6 | Installer et configurer `@nestjs/throttler` globalement + limites renforcées sur `/auth/*` et `validateStep` (finding #7) | Élevé | 0,5 jour |
| 7 | Dériver `userId` du JWT (pas du query param) sur `GET /hunts/stats`/`analytics` + ajouter guard (finding #8) | Élevé | 1-2h |
| 8 | Mettre à jour `next` → `16.2.7`, investiguer `axios`/`@ar-js-org/ar.js` (overrides npm ou alternative) (finding #9) | Élevé | 0,5-1 jour |
| 9 | Ajouter vérification d'ownership sur `DELETE /ar-items/:id` (ajouter colonne `refUser` sur `ArItem`) (finding #10) | Élevé | 2-4h |
| 10 | Ajouter décorateurs `class-validator` complets sur `CreateUserDto`/`UpdateUserDto` (finding #11) | Moyen | 1-2h |
| 11 | Créer de vrais DTOs `class-validator` pour `/auth/register`, `/auth/login`, etc. et les utiliser dans le contrôleur (finding #12) | Moyen | 2-3h |
| 12 | Nettoyer les logs inappropriés et supprimer le commentaire ligne 69-70 de `auth.service.ts` (finding #13) | Moyen | 1-2h |
| 13 | Installer et activer `helmet()` dans `main.ts` (finding #14) | Moyen | 0,5h |
| 14 | Réduire la durée de vie du JWT + introduire `passwordChangedAt`/`tokenVersion` pour révocation (finding #15) | Moyen | 0,5-1 jour |
| 15 | Ajouter `USER` non-root dans les 4 Dockerfiles (finding #16) | Moyen | 2-4h |
| 16 | Supprimer les `console.log` serveur exposant config/GPS (finding #17, recoupe #3 du rapport de maintenabilité) | Moyen | 1-2h |
| 17 | Ajouter test d'intégration `validateStep` avec body vide sur étape géolocalisée pour confirmer le comportement fail-closed (finding #18) | Faible | 1-2h |
| 18 | Ajouter `algorithms: ['HS256']` explicite dans `JwtStrategy` (finding #19) | Faible | 15 min |
| 19 | Ajouter `@MaxLength` sur `message`/`title`/`description` dans les DTOs (finding #20) | Faible | 1h |
| 20 | Épingler `@nestjs/mapped-types` à une version sémantique ; nettoyer `NEXT_PUBLIC_AR_FAKE_GPS` (findings #21, #22) | Info | 0,5h |

**Recommandation d'ordonnancement** : traiter en urgence absolue la chaîne #1→#2→#3 (fuite de PII/credentials directement exploitable et non authentifiée), puis #4→#9 (contrôles d'accès et configuration réseau) avant tout déploiement public. Les actions #10→#16 peuvent suivre dans un sprint de durcissement, et #17→#20 relèvent de l'amélioration continue / hardening.

---

## Fichiers et chemins clés référencés dans cet audit

- `/Users/jeremysananikone/Projets/SUP DE VINCI/5 PROJET D'ETUDES/lootopia/apps/api/src/users/users.controller.ts`
- `/Users/jeremysananikone/Projets/SUP DE VINCI/5 PROJET D'ETUDES/lootopia/apps/api/src/users/users.service.ts`
- `/Users/jeremysananikone/Projets/SUP DE VINCI/5 PROJET D'ETUDES/lootopia/apps/api/src/auth/auth.service.ts`
- `/Users/jeremysananikone/Projets/SUP DE VINCI/5 PROJET D'ETUDES/lootopia/apps/api/src/auth/auth.controller.ts`
- `/Users/jeremysananikone/Projets/SUP DE VINCI/5 PROJET D'ETUDES/lootopia/apps/api/src/auth/auth.module.ts`
- `/Users/jeremysananikone/Projets/SUP DE VINCI/5 PROJET D'ETUDES/lootopia/apps/api/src/auth/jwt.strategy.ts`
- `/Users/jeremysananikone/Projets/SUP DE VINCI/5 PROJET D'ETUDES/lootopia/apps/api/src/main.ts`
- `/Users/jeremysananikone/Projets/SUP DE VINCI/5 PROJET D'ETUDES/lootopia/apps/api/src/stats/stats.controller.ts`
- `/Users/jeremysananikone/Projets/SUP DE VINCI/5 PROJET D'ETUDES/lootopia/apps/api/src/participations/participations.controller.ts`
- `/Users/jeremysananikone/Projets/SUP DE VINCI/5 PROJET D'ETUDES/lootopia/apps/api/src/participations/participations.service.ts`
- `/Users/jeremysananikone/Projets/SUP DE VINCI/5 PROJET D'ETUDES/lootopia/apps/api/src/hunts/hunts.controller.ts`
- `/Users/jeremysananikone/Projets/SUP DE VINCI/5 PROJET D'ETUDES/lootopia/apps/api/src/hunts/hunts.service.ts`
- `/Users/jeremysananikone/Projets/SUP DE VINCI/5 PROJET D'ETUDES/lootopia/apps/api/src/clues/clues.controller.ts`
- `/Users/jeremysananikone/Projets/SUP DE VINCI/5 PROJET D'ETUDES/lootopia/apps/api/src/clues/clues.service.ts`
- `/Users/jeremysananikone/Projets/SUP DE VINCI/5 PROJET D'ETUDES/lootopia/apps/api/src/ar-item/ar-item.controller.ts`
- `/Users/jeremysananikone/Projets/SUP DE VINCI/5 PROJET D'ETUDES/lootopia/apps/api/src/ar-item/ar-item.service.ts`
- `/Users/jeremysananikone/Projets/SUP DE VINCI/5 PROJET D'ETUDES/lootopia/apps/api/src/storage/files/files.service.ts`
- `/Users/jeremysananikone/Projets/SUP DE VINCI/5 PROJET D'ETUDES/lootopia/apps/api/src/storage/storage.service.ts`
- `/Users/jeremysananikone/Projets/SUP DE VINCI/5 PROJET D'ETUDES/lootopia/packages/types/src/users/dto/create-user.dto.ts`
- `/Users/jeremysananikone/Projets/SUP DE VINCI/5 PROJET D'ETUDES/lootopia/packages/types/src/users/dto/update-user.dto.ts`
- `/Users/jeremysananikone/Projets/SUP DE VINCI/5 PROJET D'ETUDES/lootopia/apps/api/src/orm/prisma/schemas/user.prisma`
- `/Users/jeremysananikone/Projets/SUP DE VINCI/5 PROJET D'ETUDES/lootopia/apps/web/lib/auth.ts`
- `/Users/jeremysananikone/Projets/SUP DE VINCI/5 PROJET D'ETUDES/lootopia/apps/web/lib/actions/auth.actions.ts`
- `/Users/jeremysananikone/Projets/SUP DE VINCI/5 PROJET D'ETUDES/lootopia/apps/web/app/(partner)/layout.tsx`
- `/Users/jeremysananikone/Projets/SUP DE VINCI/5 PROJET D'ETUDES/lootopia/apps/web/app/(partner)/dashboard/profile/page.tsx`
- `/Users/jeremysananikone/Projets/SUP DE VINCI/5 PROJET D'ETUDES/lootopia/apps/web/app/(partner)/dashboard/participants/[userId]/page.tsx`
- `/Users/jeremysananikone/Projets/SUP DE VINCI/5 PROJET D'ETUDES/lootopia/apps/pwa/lib/actions/auth.actions.ts`
- `/Users/jeremysananikone/Projets/SUP DE VINCI/5 PROJET D'ETUDES/lootopia/apps/pwa/lib/actions/participation.actions.ts`
- `/Users/jeremysananikone/Projets/SUP DE VINCI/5 PROJET D'ETUDES/lootopia/apps/pwa/lib/assets.ts`
- `/Users/jeremysananikone/Projets/SUP DE VINCI/5 PROJET D'ETUDES/lootopia/apps/pwa/app/hunts/[id]/game/map/page.tsx`
- `/Users/jeremysananikone/Projets/SUP DE VINCI/5 PROJET D'ETUDES/lootopia/compose.yml`
- `/Users/jeremysananikone/Projets/SUP DE VINCI/5 PROJET D'ETUDES/lootopia/apps/api/Dockerfile`, `apps/web/Dockerfile`, `apps/pwa/Dockerfile`, `apps/db/Dockerfile`
- `/Users/jeremysananikone/Projets/SUP DE VINCI/5 PROJET D'ETUDES/lootopia/apps/api/package.json`, `apps/web/package.json`, `apps/pwa/package.json`
agentId: ab51c1b46cc20a8df (use SendMessage with to: 'ab51c1b46cc20a8df' to continue this agent)
<usage>subagent_tokens: 164059
tool_uses: 87
duration_ms: 1225489</usage>
