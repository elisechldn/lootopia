/**
 * Calcul du bonus de temps, par étape.
 *
 * Règle : récompenser la rapidité sur chaque étape sans encourager l'abus des
 * indices. Une étape résolue à 0 point (toutes les pénalités appliquées, ou
 * solution révélée) ne donne aucun bonus de temps.
 *
 *   tempsRéelÉtape (min) = (completedAt − startedAt) / 60000, clampé à ≥ 1
 *   bonusÉtape           = points > 0 ? 100 × estimatedDuration / tempsRéel : 0
 *   scoreFinal           = Σ points + Σ bonusÉtape
 */

/** Arrondi à 2 décimales. */
export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Temps réel d'une étape en minutes, clampé à 1 minute minimum
 * (évite la division par zéro / un bonus infini sur les étapes très rapides).
 */
export function realTimeMinutes(start: Date, end: Date): number {
  return Math.max(1, (end.getTime() - start.getTime()) / 60000);
}

/**
 * Bonus de temps d'une étape. Vaut 0 si l'étape ne rapporte aucun point.
 */
export function stepTimeBonus(
  estimatedDuration: number,
  points: number,
  start: Date,
  end: Date,
): number {
  if (points <= 0) return 0;
  return (100 * estimatedDuration) / realTimeMinutes(start, end);
}

export interface ScoredProgress {
  totalPoints: number;
  startedAt: Date;
  completedAt: Date;
  step: { estimatedDuration: number };
}

/**
 * Somme des bonus de temps de toutes les étapes complétées, arrondie à 2 décimales.
 */
export function sumTimeBonus(progresses: ScoredProgress[]): number {
  const total = progresses.reduce(
    (sum, p) =>
      sum +
      stepTimeBonus(
        p.step.estimatedDuration,
        p.totalPoints,
        p.startedAt,
        p.completedAt,
      ),
    0,
  );
  return round2(total);
}
