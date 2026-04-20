import { WorkoutType } from '../types';

export interface ReadinessInput {
  sleep: number;   // hours 3-10
  skin: number;    // 1-5
  energy: number;  // 1-5
  stress: number;  // 1-5 (higher = worse)
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/**
 * Compute a 1–10 readiness score from four subjective inputs.
 *
 * Normalisation:
 *   sleep  → (clamp(sleep, 3, 10) - 3) / 7       (0 = 3h, 1 = 10h)
 *   energy → (clamp(energy, 1, 5) - 1) / 4       (0 = 1,  1 = 5)
 *   skin   → (clamp(skin,   1, 5) - 1) / 4       (0 = 1,  1 = 5)
 *   stress → 1 - (clamp(stress, 1, 5) - 1) / 4   (inverted: 5 = worst)
 *
 * Weighted average (sleep 35%, energy 30%, skin 20%, stress 20% → 105%):
 *   w = (0.35·sleep + 0.30·energy + 0.20·skin + 0.20·stress) / 1.05
 *
 * Mapped to a 1–10 integer: score = round(1 + 9·w)
 */
export function computeReadinessScore(r: ReadinessInput): number {
  const sleepN  = (clamp(r.sleep,  3, 10) - 3) / 7;
  const energyN = (clamp(r.energy, 1, 5)  - 1) / 4;
  const skinN   = (clamp(r.skin,   1, 5)  - 1) / 4;
  const stressN = 1 - (clamp(r.stress, 1, 5) - 1) / 4;

  const weighted = (0.35 * sleepN + 0.30 * energyN + 0.20 * skinN + 0.20 * stressN) / 1.05;
  const score = Math.round(1 + 9 * weighted);
  return clamp(score, 1, 10);
}

export type ReadinessBand = 'green' | 'amber' | 'red';

/** 8–10 green, 5–7 amber, <5 red. */
export function readinessBand(score: number): ReadinessBand {
  if (score >= 8) return 'green';
  if (score >= 5) return 'amber';
  return 'red';
}

/**
 * True when readiness is low (<5) AND the workout is max-intensity:
 *  - WorkoutType.POWER / LIMIT-style bouldering,
 *  - hangboard max-hang style,
 *  - or name matches /max|limit|power/i.
 */
export function shouldSuggestAlternative(
  score: number,
  workoutType: WorkoutType | undefined,
  workoutName?: string
): boolean {
  if (score >= 5) return false;
  const name = (workoutName || '').toLowerCase();
  const nameIsIntense = /max|limit|power/i.test(name);

  if (nameIsIntense) return true;
  if (workoutType === WorkoutType.HANGBOARD && /max|hang/i.test(name)) return true;
  if (workoutType === WorkoutType.BOULDER && /limit|project/i.test(name)) return true;
  // Any explicitly power-tagged workout type (future-proof; enum has no POWER today)
  // so we only fall back to the name heuristic above.
  return false;
}
