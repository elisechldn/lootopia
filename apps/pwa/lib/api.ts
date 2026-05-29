// Résolution de l'URL de l'API selon le contexte d'exécution.
// - Côté serveur (SSR, server actions, route handlers) : process.env.API_URL
//   - Docker : http://api:8000 (réseau interne Docker)
//   - Local  : http://localhost:8000 (fallback)
// - Côté client (navigateur) : /api, proxyfié par le rewrite de next.config.js
//   vers ${API_URL}. Permet d'éviter CORS et mixed content (ex: PWA servie
//   en HTTPS via ngrok sur smartphone).
export const API_URL = typeof window === 'undefined' ? (process.env.API_URL ?? 'http://localhost:8000') : (process.env.NEXT_PUBLIC_API_URL ?? '/api');
