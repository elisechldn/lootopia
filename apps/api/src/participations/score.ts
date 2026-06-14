/**
 * Calcul du bonus de temps, par étape.
 *
 * Règle : récompenser la rapidité sur chaque étape sans encourager l'abus des
 * indices. Une étape résolue à 0 point (toutes les pénalités appliquées, ou
 * solution révélée) ne donne aucun bonus de temps. Une étape terminée plus
 * lentement que prévu (coef ≤ 1) ne donne pas de bonus non plus.
 *
 * Le bonus est calculé à la validation de chaque étape et stocké sur
 * `Progress.timeBonus`. À la dernière étape, le score de la participation est
 * figé : `Participation.totalPoints = Σ progress.totalPoints + Σ progress.timeBonus`.
 *
 *   tempsRéelÉtape (min) = (completedAt − startedAt) / 60000
 *   coef                 = estimatedDuration / tempsRéel
 *   bonusÉtape           = points > 0 && coef > 1 ? coef × points : 0
 */

/** Arrondi à 2 décimales. */
export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Temps réel d'une étape en minutes (completedAt − startedAt). */
export function realTimeMinutes(start: Date, end: Date): number {
  return (end.getTime() - start.getTime()) / 60000;
}

/**
 * Bonus de temps d'une étape. Vaut 0 si l'étape ne rapporte aucun point, si elle
 * n'a pas été terminée plus vite que la durée estimée (coef ≤ 1), ou si le temps
 * réel est nul/négatif (garde anti division par zéro).
 */
export function stepTimeBonus(
  estimatedDuration: number,
  points: number,
  start: Date,
  end: Date,
): number {
  if (points <= 0) return 0;
  const real = realTimeMinutes(start, end);
  if (real <= 0) return 0; // start == end (ou décalage d'horloge) → pas de bonus
  const coef = estimatedDuration / real;
  return coef > 1 ? coef * points : 0; // coef ≤ 1 (aussi lent ou plus) → pas de bonus
}
