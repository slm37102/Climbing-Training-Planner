import { describe, it, expect } from 'vitest';
import { REHAB_PROTOCOLS } from '../data/rehabProtocols';

describe('REHAB_PROTOCOLS', () => {
  it('has exactly 3 protocols', () => {
    expect(REHAB_PROTOCOLS).toHaveLength(3);
  });

  it('covers all three phases exactly once', () => {
    const phases = REHAB_PROTOCOLS.map(p => p.phase).sort();
    expect(phases).toEqual(['acute', 'return-to-climb', 'sub-acute']);
  });

  it('every protocol has non-empty dos and donts', () => {
    for (const p of REHAB_PROTOCOLS) {
      expect(p.dos.length).toBeGreaterThan(0);
      expect(p.donts.length).toBeGreaterThan(0);
      expect(p.goals.length).toBeGreaterThan(0);
      expect(p.title.length).toBeGreaterThan(0);
      expect(p.durationGuideline.length).toBeGreaterThan(0);
      expect(p.climbingLoad.length).toBeGreaterThan(0);
    }
  });
});
