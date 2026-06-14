// Résolution de l'URL de l'API selon le contexte d'exécution.
// - Côté serveur (RSC, route handlers, server actions) : process.env.API_URL
//   - Docker : http://api:8000 (réseau interne Docker)
//   - Local  : http://localhost:8000 (fallback)
// - Côté client (navigateur) : NEXT_PUBLIC_API_URL, inliné au build.
//   Le portail web n'expose pas de rewrite /api : les appels client visent
//   directement l'API publique.
export const API_URL =
  typeof window === 'undefined'
    ? (process.env.API_URL ?? 'http://localhost:8000')
    : (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000');
