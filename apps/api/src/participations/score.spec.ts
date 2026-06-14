import {
  round2,
  realTimeMinutes,
  stepTimeBonus,
  sumTimeBonus,
  type ScoredProgress,
} from './score';

const MIN = 60_000;
const at = (minutes: number) => new Date(minutes * MIN);

describe('round2', () => {
  it('arrondit à 2 décimales', () => {
    expect(round2(303.0303)).toBe(303.03);
    expect(round2(50)).toBe(50);
  });
});

describe('realTimeMinutes', () => {
  it('calcule la durée en minutes', () => {
    expect(realTimeMinutes(at(0), at(60))).toBe(60);
  });

  it('clamp à 1 minute minimum (anti division par zéro)', () => {
    expect(realTimeMinutes(at(0), new Date(30_000))).toBe(1); // 30 s
    expect(realTimeMinutes(at(0), at(0))).toBe(1);
  });
});

describe('stepTimeBonus', () => {
  it('cas 1 : plus rapide que prévu (120 / 60) → 200', () => {
    expect(stepTimeBonus(120, 100, at(0), at(60))).toBe(200);
  });

  it('cas 2 : dans la durée estimée (120 / 120) → 100', () => {
    expect(stepTimeBonus(120, 100, at(0), at(120))).toBe(100);
  });

  it('cas 3 : plus lent que prévu (120 / 240) → 50', () => {
    expect(stepTimeBonus(120, 100, at(0), at(240))).toBe(50);
  });

  it('aucun bonus si l’étape ne rapporte aucun point (anti-abus indices)', () => {
    expect(stepTimeBonus(120, 0, at(0), at(60))).toBe(0);
  });

  it('reste fini quand le temps réel est < 1 minute', () => {
    const bonus = stepTimeBonus(120, 100, at(0), new Date(1_000)); // 1 s
    expect(Number.isFinite(bonus)).toBe(true);
    expect(bonus).toBe(12000); // 100 * 120 / 1
  });
});

describe('sumTimeBonus', () => {
  const progress = (
    points: number,
    estimatedDuration: number,
    minutes: number,
  ): ScoredProgress => ({
    totalPoints: points,
    startedAt: at(0),
    completedAt: at(minutes),
    step: { estimatedDuration },
  });

  it('somme les bonus des étapes et arrondit à 2 décimales', () => {
    // 100*100/33 = 303.0303… → 303.03
    expect(sumTimeBonus([progress(50, 100, 33)])).toBe(303.03);
  });

  it('exclut les étapes à 0 point du calcul', () => {
    // étape 1 : 200 ; étape 2 : 0 point → 0
    expect(sumTimeBonus([progress(100, 120, 60), progress(0, 120, 30)])).toBe(
      200,
    );
  });
});
