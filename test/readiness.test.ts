import { describe, it, expect } from 'vitest';
import {
  computeReadinessScore,
  readinessBand,
  shouldSuggestAlternative,
} from '../utils/readiness';
import { WorkoutType } from '../types';

describe('computeReadinessScore', () => {
  it('is within 1..10 for extreme inputs', () => {
    const worst = computeReadinessScore({ sleep: 3, skin: 1, energy: 1, stress: 5 });
    const best  = computeReadinessScore({ sleep: 10, skin: 5, energy: 5, stress: 1 });
    expect(worst).toBe(1);
    expect(best).toBe(10);
    for (let s = 3; s <= 10; s++) {
      const v = computeReadinessScore({ sleep: s, skin: 3, energy: 3, stress: 3 });
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(10);
    }
  });

  it('clamps out-of-range inputs', () => {
    const low  = computeReadinessScore({ sleep: -5, skin: -1, energy: -1, stress: 99 });
    const high = computeReadinessScore({ sleep: 99, skin: 99, energy: 99, stress: -5 });
    expect(low).toBe(1);
    expect(high).toBe(10);
  });

  it('is monotonically non-decreasing in sleep', () => {
    const base = { skin: 3, energy: 3, stress: 3 };
    let prev = -Infinity;
    for (let s = 3; s <= 10; s++) {
      const v = computeReadinessScore({ ...base, sleep: s });
      expect(v).toBeGreaterThanOrEqual(prev);
      prev = v;
    }
  });

  it('is monotonically non-decreasing in energy', () => {
    const base = { sleep: 7, skin: 3, stress: 3 };
    let prev = -Infinity;
    for (let e = 1; e <= 5; e++) {
      const v = computeReadinessScore({ ...base, energy: e });
      expect(v).toBeGreaterThanOrEqual(prev);
      prev = v;
    }
  });

  it('is monotonically non-decreasing in skin', () => {
    const base = { sleep: 7, energy: 3, stress: 3 };
    let prev = -Infinity;
    for (let sk = 1; sk <= 5; sk++) {
      const v = computeReadinessScore({ ...base, skin: sk });
      expect(v).toBeGreaterThanOrEqual(prev);
      prev = v;
    }
  });

  it('is inverted in stress (higher stress ⇒ lower score)', () => {
    const base = { sleep: 7, skin: 3, energy: 3 };
    const low  = computeReadinessScore({ ...base, stress: 1 });
    const high = computeReadinessScore({ ...base, stress: 5 });
    expect(high).toBeLessThan(low);
    let prev = Infinity;
    for (let st = 1; st <= 5; st++) {
      const v = computeReadinessScore({ ...base, stress: st });
      expect(v).toBeLessThanOrEqual(prev);
      prev = v;
    }
  });
});

describe('readinessBand', () => {
  it('maps 8–10 to green', () => {
    expect(readinessBand(8)).toBe('green');
    expect(readinessBand(9)).toBe('green');
    expect(readinessBand(10)).toBe('green');
  });
  it('maps 5–7 to amber', () => {
    expect(readinessBand(5)).toBe('amber');
    expect(readinessBand(6)).toBe('amber');
    expect(readinessBand(7)).toBe('amber');
  });
  it('maps <5 to red', () => {
    expect(readinessBand(4)).toBe('red');
    expect(readinessBand(1)).toBe('red');
  });
});

describe('shouldSuggestAlternative', () => {
  it('suggests alternative only when score < 5', () => {
    expect(shouldSuggestAlternative(5, WorkoutType.BOULDER, 'Limit Bouldering')).toBe(false);
    expect(shouldSuggestAlternative(4, WorkoutType.BOULDER, 'Limit Bouldering')).toBe(true);
  });

  it('flags max-hang hangboard sessions at low readiness', () => {
    expect(shouldSuggestAlternative(3, WorkoutType.HANGBOARD, 'Max Hangs 10s')).toBe(true);
  });

  it('does not flag repeaters/endurance hangboard sessions', () => {
    expect(shouldSuggestAlternative(3, WorkoutType.HANGBOARD, 'Repeaters 7/3')).toBe(false);
  });

  it('flags workouts whose name contains power/max/limit', () => {
    expect(shouldSuggestAlternative(2, WorkoutType.OTHER, 'Power Endurance')).toBe(true);
    expect(shouldSuggestAlternative(2, WorkoutType.BOULDER, 'Max boulder')).toBe(true);
  });

  it('does not flag low-intensity sessions even at low readiness', () => {
    expect(shouldSuggestAlternative(2, WorkoutType.CONDITIONING, 'ARC 30 min')).toBe(false);
    expect(shouldSuggestAlternative(2, WorkoutType.OTHER, 'No-Hangs 3x5')).toBe(false);
  });
});
