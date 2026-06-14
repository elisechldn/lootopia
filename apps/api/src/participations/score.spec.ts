import { round2, realTimeMinutes, stepTimeBonus } from './score';

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

  it('renvoie la durée brute, sans clamp', () => {
    expect(realTimeMinutes(at(0), new Date(30_000))).toBe(0.5); // 30 s
    expect(realTimeMinutes(at(0), at(0))).toBe(0);
  });
});

describe('stepTimeBonus', () => {
  it('cas 1 : plus rapide que prévu (coef 120/60 = 2 × 100 pts) → 200', () => {
    expect(stepTimeBonus(120, 100, at(0), at(60))).toBe(200);
  });

  it('cas 2 : exactement dans la durée estimée (coef 1) → 0', () => {
    expect(stepTimeBonus(120, 100, at(0), at(120))).toBe(0);
  });

  it('cas 3 : plus lent que prévu (coef 0.5) → 0', () => {
    expect(stepTimeBonus(120, 100, at(0), at(240))).toBe(0);
  });

  it('aucun bonus si l’étape ne rapporte aucun point (anti-abus indices)', () => {
    expect(stepTimeBonus(120, 0, at(0), at(60))).toBe(0);
  });

  it('bonus élevé mais fini sur une étape très rapide (< 1 minute)', () => {
    const bonus = stepTimeBonus(120, 100, at(0), new Date(1_000)); // 1 s = 1/60 min
    expect(Number.isFinite(bonus)).toBe(true);
    expect(bonus).toBe(720000); // coef 120 / (1/60) = 7200 × 100 pts
  });

  it('aucun bonus si le temps réel est nul (garde anti division par zéro)', () => {
    const bonus = stepTimeBonus(120, 100, at(0), at(0)); // start == end
    expect(Number.isFinite(bonus)).toBe(true);
    expect(bonus).toBe(0);
  });
});
