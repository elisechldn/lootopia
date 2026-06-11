export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Variable d'environnement requise manquante : ${name}. ` +
        `Définis-la dans apps/api/.env ou via l'environnement du conteneur.`,
    );
  }
  return value;
}
