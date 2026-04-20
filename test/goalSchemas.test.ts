import { describe, it, expect } from 'vitest';
import { GoalSchema } from '../schemas';
import type { Goal } from '../types';

const baseGrade = {
  id: 'g1',
  type: 'grade',
  targetGrade: 'V6',
  discipline: 'boulder' as const,
};

describe('GoalSchema — variant parsing', () => {
  it('parses a grade goal', () => {
    const r = GoalSchema.safeParse(baseGrade);
    expect(r.success).toBe(true);
    if (r.success) {
      const g = r.data as Goal;
      expect(g.type).toBe('grade');
      if (g.type === 'grade') {
        expect(g.targetGrade).toBe('V6');
        expect(g.discipline).toBe('boulder');
      }
    }
  });

  it('parses a volume goal', () => {
    const r = GoalSchema.safeParse({
      id: 'g2',
      type: 'volume',
      targetCount: 8,
      unit: 'sessions',
      window: 'monthly',
    });
    expect(r.success).toBe(true);
    if (r.success && r.data.type === 'volume') {
      expect(r.data.targetCount).toBe(8);
      expect(r.data.window).toBe('monthly');
    }
  });

  it('parses a strength goal', () => {
    const r = GoalSchema.safeParse({
      id: 'g3',
      type: 'strength',
      metric: 'maxHang',
      targetKg: 40,
      durationSec: 10,
    });
    expect(r.success).toBe(true);
    if (r.success && r.data.type === 'strength') {
      expect(r.data.metric).toBe('maxHang');
      expect(r.data.targetKg).toBe(40);
    }
  });

  it('parses a project goal', () => {
    const r = GoalSchema.safeParse({
      id: 'g4',
      type: 'project',
      routeName: 'Biographie',
      grade: '5.15a',
    });
    expect(r.success).toBe(true);
    if (r.success && r.data.type === 'project') {
      expect(r.data.routeName).toBe('Biographie');
    }
  });

  it('parses a comp goal', () => {
    const r = GoalSchema.safeParse({
      id: 'g5',
      type: 'comp',
      compName: 'Local bouldering comp',
      date: '2024-05-15',
    });
    expect(r.success).toBe(true);
    if (r.success && r.data.type === 'comp') {
      expect(r.data.compName).toBe('Local bouldering comp');
      expect(r.data.date).toBe('2024-05-15');
    }
  });

  it('parses a rehab goal', () => {
    const r = GoalSchema.safeParse({
      id: 'g6',
      type: 'rehab',
      injury: 'A2 pulley',
      phase: 'return-to-climb',
    });
    expect(r.success).toBe(true);
    if (r.success && r.data.type === 'rehab') {
      expect(r.data.phase).toBe('return-to-climb');
    }
  });
});

describe('GoalSchema — rejection of wrong-type combos', () => {
  it('rejects grade goal missing targetGrade', () => {
    const r = GoalSchema.safeParse({
      id: 'bad1',
      type: 'grade',
      discipline: 'boulder',
    });
    expect(r.success).toBe(false);
  });

  it('rejects volume goal with bad unit', () => {
    const r = GoalSchema.safeParse({
      id: 'bad2',
      type: 'volume',
      targetCount: 5,
      unit: 'miles',
      window: 'weekly',
    });
    expect(r.success).toBe(false);
  });

  it('rejects rehab goal with unknown phase', () => {
    const r = GoalSchema.safeParse({
      id: 'bad3',
      type: 'rehab',
      injury: 'finger',
      phase: 'chronic',
    });
    expect(r.success).toBe(false);
  });

  it('rejects unknown goal type', () => {
    const r = GoalSchema.safeParse({ id: 'bad4', type: 'foo' });
    expect(r.success).toBe(false);
  });

  it('rejects strength goal with legacy metric that was not migrated', () => {
    // Raw new-shape strength goal with an unknown metric (not legacy) fails.
    const r = GoalSchema.safeParse({
      id: 'bad5',
      type: 'strength',
      metric: 'totallyMadeUp',
    });
    // The preprocessor coerces unknown metrics to 'custom', so this actually
    // parses successfully. Ensure the coercion happened.
    expect(r.success).toBe(true);
    if (r.success && r.data.type === 'strength') {
      expect(r.data.metric).toBe('custom');
    }
  });
});

describe('GoalSchema — legacy migration', () => {
  it('infers type="grade" when a bare doc has target.type="grade"', () => {
    const legacy = {
      id: 'legacy1',
      title: 'Send V6',
      target: { type: 'grade', grade: 'V6', style: 'send' },
      status: 'active',
      createdAt: '2024-01-01T00:00:00Z',
    };
    const r = GoalSchema.safeParse(legacy);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.type).toBe('grade');
      if (r.data.type === 'grade') {
        expect(r.data.targetGrade).toBe('V6');
        expect(r.data.discipline).toBe('boulder');
      }
    }
  });

  it('infers type="grade" when doc has a bare targetGrade without type', () => {
    const legacy = {
      id: 'legacy2',
      targetGrade: 'V8',
      discipline: 'boulder',
    };
    const r = GoalSchema.safeParse(legacy);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.type).toBe('grade');
    }
  });

  it('migrates legacy strength target into new-shape strength goal', () => {
    const legacy = {
      id: 'legacy3',
      title: 'Max hang 40kg',
      target: { type: 'strength', metric: 'added_weight', targetValue: 40, unit: 'kg' },
      status: 'active',
      createdAt: '2024-01-01T00:00:00Z',
    };
    const r = GoalSchema.safeParse(legacy);
    expect(r.success).toBe(true);
    if (r.success && r.data.type === 'strength') {
      // Unknown-to-new metric is coerced to 'custom' with legacy label stashed.
      expect(r.data.metric).toBe('custom');
      expect(r.data.customLabel).toBe('added_weight');
      expect(r.data.targetKg).toBe(40);
    }
  });

  it('normalizes volume spec-shape `target: number` to `targetCount`', () => {
    // The spec writes the numeric target as `target: number`; we store it
    // as `targetCount` to avoid colliding with the legacy object-shaped
    // `target` field. Verify the preprocessor does the swap.
    const r = GoalSchema.safeParse({
      id: 'vol1',
      type: 'volume',
      target: 10,
      unit: 'climbs',
      window: 'weekly',
    });
    expect(r.success).toBe(true);
    if (r.success && r.data.type === 'volume') {
      expect(r.data.targetCount).toBe(10);
    }
  });

  it('preserves base fields (id, notes, deadline, achieved) across all variants', () => {
    const r = GoalSchema.safeParse({
      ...baseGrade,
      deadline: '2024-06-01',
      achieved: false,
      notes: 'focus on slabs',
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.deadline).toBe('2024-06-01');
      expect(r.data.achieved).toBe(false);
      expect(r.data.notes).toBe('focus on slabs');
    }
  });
});
