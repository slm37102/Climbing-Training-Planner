import { describe, it, expect } from 'vitest';
import { HANGBOARD_PROTOCOLS, protocolToWorkoutInput } from '../data/hangboardProtocols';

const EXPECTED_IDS = [
  'maxhangs-lopez',
  'minedge-lopez',
  'repeaters-7-3',
  'horst-10s',
  'density-hang',
  'no-hangs-abrahamsson'
];

describe('HANGBOARD_PROTOCOLS seed catalog', () => {
  it('contains all 6 seeded protocols', () => {
    expect(HANGBOARD_PROTOCOLS).toHaveLength(6);
    const ids = HANGBOARD_PROTOCOLS.map(p => p.id).sort();
    expect(ids).toEqual([...EXPECTED_IDS].sort());
  });

  it('each protocol has valid edge, work/rest, reps, sets', () => {
    for (const p of HANGBOARD_PROTOCOLS) {
      expect(p.edgeRecommendation.mm.length).toBeGreaterThan(0);
      expect(p.edgeRecommendation.mm).toContain(p.edgeRecommendation.prefer);
      expect(p.edgeRecommendation.mm.every(n => n > 0)).toBe(true);
      expect(p.work).toBeGreaterThan(0);
      expect(p.rest).toBeGreaterThanOrEqual(0);
      expect(p.reps).toBeGreaterThan(0);
      expect(p.sets).toBeGreaterThan(0);
      expect(p.restBetweenSets).toBeGreaterThanOrEqual(0);
      expect(p.frequencyPerWeek).toBeGreaterThan(0);
    }
  });

  it('each protocol has a non-empty source title and author', () => {
    for (const p of HANGBOARD_PROTOCOLS) {
      expect(p.source.title.trim().length).toBeGreaterThan(0);
      expect(p.source.author.trim().length).toBeGreaterThan(0);
    }
  });

  it('each protocol has one of the three allowed pillars', () => {
    const allowed = new Set(['MaxStrength', 'Endurance', 'Frequency']);
    for (const p of HANGBOARD_PROTOCOLS) {
      expect(allowed.has(p.pillar)).toBe(true);
    }
  });

  it('each protocol has one of the allowed load prescriptions', () => {
    const allowed = new Set(['addedWeight', 'minEdge', 'bodyweight']);
    for (const p of HANGBOARD_PROTOCOLS) {
      expect(allowed.has(p.loadPrescription)).toBe(true);
    }
  });
});

describe('protocolToWorkoutInput', () => {
  it('builds a TimerConfig matching the protocol numbers', () => {
    const p = HANGBOARD_PROTOCOLS.find(x => x.id === 'repeaters-7-3')!;
    const out = protocolToWorkoutInput(p);
    expect(out.timerConfig).toEqual({
      workSeconds: 7,
      restSeconds: 3,
      reps: 6,
      sets: 6,
      restBetweenSetsSeconds: 120
    });
    expect(out.name).toBe(p.name);
    expect(out.steps.length).toBeGreaterThanOrEqual(3);
    expect(out.description).toContain(p.source.title);
    expect(out.durationMinutes).toBeGreaterThan(0);
  });

  it('includes the preferred edge in the setup step', () => {
    const p = HANGBOARD_PROTOCOLS.find(x => x.id === 'maxhangs-lopez')!;
    const out = protocolToWorkoutInput(p);
    const setupStep = out.steps.find(s => /edge/i.test(s));
    expect(setupStep).toBeDefined();
    expect(setupStep).toContain(`${p.edgeRecommendation.prefer}mm`);
  });
});
