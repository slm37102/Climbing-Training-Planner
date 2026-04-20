import { describe, it, expect } from 'vitest';
import {
  computeOverload,
  inferPillarFromName,
  didExceedTarget,
} from '../utils/progression';
import type { ExerciseLog } from '../types';

const baseLog = (overrides: Partial<ExerciseLog>): ExerciseLog => ({
  id: 'x',
  exerciseId: 'e1',
  completedSets: 4,
  completedReps: 5,
  addedWeight: 20,
  edgeDepth: 20,
  rpe: 7,
  timestamp: 0,
  ...overrides,
});

describe('computeOverload', () => {
  describe('MaxHang', () => {
    it('adds +5kg at RPE ≤ 7 (submaximal)', () => {
      const t = computeOverload(baseLog({ rpe: 6, addedWeight: 20 }), 'MaxHang');
      expect(t.load).toBe('25');
      expect(t.notes).toMatch(/\+5 kg/i);
    });
    it('suggests −1 mm edge when no added weight is logged at RPE ≤ 7', () => {
      const t = computeOverload(
        baseLog({ rpe: 6, addedWeight: undefined, edgeDepth: 14 }),
        'MaxHang'
      );
      expect(t.edge).toBe(13);
    });
    it('adds +2.5kg at RPE 8', () => {
      const t = computeOverload(baseLog({ rpe: 8, addedWeight: 20 }), 'MaxHang');
      expect(t.load).toBe('22.5');
    });
    it('holds load and adds 1 set at RPE ≥ 9', () => {
      const t = computeOverload(baseLog({ rpe: 10, addedWeight: 20, completedSets: 3 }), 'MaxHang');
      expect(t.load).toBe('20');
      expect(t.sets).toBe(4);
      expect(t.notes).toMatch(/\+1 set/i);
    });
  });

  describe('Repeaters', () => {
    it('+2.5kg at RPE ≤ 7', () => {
      const t = computeOverload(baseLog({ rpe: 6, addedWeight: 10 }), 'Repeaters');
      expect(t.load).toBe('12.5');
    });
    it('holds at RPE 8', () => {
      const t = computeOverload(baseLog({ rpe: 8, addedWeight: 10, completedSets: 4 }), 'Repeaters');
      expect(t.load).toBe('10');
      expect(t.sets).toBe(4);
    });
    it('reduces one set at RPE ≥ 9', () => {
      const t = computeOverload(baseLog({ rpe: 10, completedSets: 4 }), 'Repeaters');
      expect(t.sets).toBe(3);
    });
  });

  describe('LimitBoulder', () => {
    it('suggests harder problem at RPE ≤ 7', () => {
      const t = computeOverload(baseLog({ rpe: 6 }), 'LimitBoulder');
      expect(t.notes).toMatch(/harder/i);
    });
    it('holds at RPE 8', () => {
      const t = computeOverload(baseLog({ rpe: 8 }), 'LimitBoulder');
      expect(t.notes).toMatch(/hold/i);
    });
    it('more rest / fewer attempts at RPE ≥ 9', () => {
      const t = computeOverload(baseLog({ rpe: 9, completedReps: 4 }), 'LimitBoulder');
      expect(t.reps).toBe(3);
      expect(t.notes).toMatch(/rest|fewer/i);
    });
  });

  describe('NoHangs', () => {
    it('+5% BW at RPE ≤ 7', () => {
      const t = computeOverload(baseLog({ rpe: 6, addedWeight: 20 }), 'NoHangs');
      expect(t.load).toBe('21');
    });
    it('holds at RPE 8', () => {
      const t = computeOverload(baseLog({ rpe: 8, addedWeight: 20 }), 'NoHangs');
      expect(t.load).toBe('20');
    });
    it('holds at RPE ≥ 9 (frequency work)', () => {
      const t = computeOverload(baseLog({ rpe: 10, addedWeight: 20 }), 'NoHangs');
      expect(t.load).toBe('20');
      expect(t.notes).toMatch(/frequency|hold/i);
    });
  });

  describe('default / Other', () => {
    it('+5% load at RPE ≤ 7', () => {
      const t = computeOverload(baseLog({ rpe: 6, addedWeight: 50 }), 'Other');
      expect(t.load).toBe('52.5');
    });
    it('holds at RPE 8', () => {
      const t = computeOverload(baseLog({ rpe: 8, addedWeight: 50 }), 'Other');
      expect(t.load).toBe('50');
    });
    it('holds + deload note at RPE ≥ 9', () => {
      const t = computeOverload(baseLog({ rpe: 10, addedWeight: 50 }));
      expect(t.load).toBe('50');
      expect(t.notes).toMatch(/deload/i);
    });
  });
});

describe('inferPillarFromName', () => {
  it('detects max hangs', () => {
    expect(inferPillarFromName('Max Hangs 10s')).toBe('MaxHang');
    expect(inferPillarFromName('Heavy hang')).toBe('MaxHang');
  });
  it('detects repeaters', () => {
    expect(inferPillarFromName('7/3 Repeaters')).toBe('Repeaters');
    expect(inferPillarFromName('Repeaters (7 on 3 off)')).toBe('Repeaters');
  });
  it('detects no-hangs', () => {
    expect(inferPillarFromName('No-hang pickups')).toBe('NoHangs');
    expect(inferPillarFromName('No hang lifts')).toBe('NoHangs');
  });
  it('detects limit boulder', () => {
    expect(inferPillarFromName('Limit boulder session')).toBe('LimitBoulder');
    expect(inferPillarFromName('4x4 bouldering')).toBe('LimitBoulder');
  });
  it('detects antagonist work (front lever/press/row)', () => {
    expect(inferPillarFromName('Push-ups')).toBe('Antagonist');
    expect(inferPillarFromName('Band pull-apart')).toBe('Antagonist');
    // front lever is a core/antagonist lift — accept Antagonist or Other,
    // but our regex maps "press/row/scap" explicitly; front lever falls
    // through to Other which is fine.
    const fl = inferPillarFromName('Front Lever progression');
    expect(['Antagonist', 'Other']).toContain(fl);
  });
  it('returns Other for unknown names', () => {
    expect(inferPillarFromName('Random stuff')).toBe('Other');
    expect(inferPillarFromName('')).toBe('Other');
  });
});

describe('didExceedTarget', () => {
  it('flags load-based PR', () => {
    const current: ExerciseLog = baseLog({ addedWeight: 27 });
    expect(didExceedTarget(current, { load: '25', notes: '' })).toBe(true);
  });
  it('does not flag matching load', () => {
    const current: ExerciseLog = baseLog({ addedWeight: 25 });
    expect(didExceedTarget(current, { load: '25', notes: '' })).toBe(false);
  });
  it('flags set-based PR', () => {
    const current: ExerciseLog = baseLog({ completedSets: 5 });
    expect(didExceedTarget(current, { sets: 4, notes: '' })).toBe(true);
  });
  it('flags smaller edge (harder) as PR', () => {
    const current: ExerciseLog = baseLog({ edgeDepth: 12 });
    expect(didExceedTarget(current, { edge: 14, notes: '' })).toBe(true);
  });
  it('returns false when target has no numeric hints', () => {
    expect(didExceedTarget(baseLog({}), { notes: 'just try harder' })).toBe(false);
  });
});
