import { describe, it, expect } from 'vitest';
import { pickPlanForPersona, nextMondayISO } from '../utils/onboarding';
import { SEED_TRAINING_PLANS } from '../data/trainingPlans';
import type { OnboardingProfile } from '../types';

const plans = SEED_TRAINING_PLANS;

describe('pickPlanForPersona', () => {
  it('returns "Just Climb" for goal=fun regardless of frequency', () => {
    const p: OnboardingProfile = { primaryGoal: 'fun', frequencyPerWeek: 4 };
    expect(pickPlanForPersona(p, plans)?.name).toMatch(/just climb/i);
  });

  it('returns "Break V5 — RCTM 12 wk" for plateau + 3x/wk', () => {
    const p: OnboardingProfile = { primaryGoal: 'plateau', frequencyPerWeek: 3 };
    expect(pickPlanForPersona(p, plans)?.name).toMatch(/break v5/i);
  });

  it('returns "Break V5 — RCTM 12 wk" for plateau + 4x/wk', () => {
    const p: OnboardingProfile = { primaryGoal: 'plateau', frequencyPerWeek: 4 };
    expect(pickPlanForPersona(p, plans)?.name).toMatch(/break v5/i);
  });

  it('returns "Send Your Project" for project + 4x/wk', () => {
    const p: OnboardingProfile = { primaryGoal: 'project', frequencyPerWeek: 4 };
    expect(pickPlanForPersona(p, plans)?.name).toMatch(/send your project/i);
  });

  it('returns "Comp Prep 6 wk" for goal=compete', () => {
    const p: OnboardingProfile = { primaryGoal: 'compete', frequencyPerWeek: 5 };
    expect(pickPlanForPersona(p, plans)?.name).toMatch(/comp prep/i);
  });

  it('returns "Post-Injury Return" for goal=injury', () => {
    const p: OnboardingProfile = { primaryGoal: 'injury', frequencyPerWeek: 3 };
    expect(pickPlanForPersona(p, plans)?.name).toMatch(/post-injury return/i);
  });

  it('falls back to "Just Climb" when frequency is 2 and no matching goal', () => {
    const p: OnboardingProfile = { primaryGoal: 'plateau', frequencyPerWeek: 2 };
    expect(pickPlanForPersona(p, plans)?.name).toMatch(/just climb/i);
  });

  it('falls back to "Intro Strength" for unmatched combo with freq 3+', () => {
    // project but only 3x/wk — mapping demands 4, so should fall through
    const p: OnboardingProfile = { primaryGoal: 'project', frequencyPerWeek: 3 };
    expect(pickPlanForPersona(p, plans)?.name).toMatch(/intro strength/i);
  });

  it('falls back to "Intro Strength" for plateau + 5x/wk', () => {
    const p: OnboardingProfile = { primaryGoal: 'plateau', frequencyPerWeek: 5 };
    expect(pickPlanForPersona(p, plans)?.name).toMatch(/intro strength/i);
  });

  it('returns null when no plan list is provided', () => {
    const p: OnboardingProfile = { primaryGoal: 'fun', frequencyPerWeek: 3 };
    expect(pickPlanForPersona(p, [])).toBeNull();
  });
});

describe('nextMondayISO', () => {
  it('returns same date when from is Monday', () => {
    // 2025-01-06 is a Monday
    const monday = new Date(2025, 0, 6);
    expect(nextMondayISO(monday)).toBe('2025-01-06');
  });

  it('returns next Monday when from is Sunday', () => {
    // 2025-01-05 is a Sunday
    const sunday = new Date(2025, 0, 5);
    expect(nextMondayISO(sunday)).toBe('2025-01-06');
  });

  it('returns upcoming Monday when from is mid-week (Wednesday)', () => {
    // 2025-01-08 is a Wednesday -> next Mon 2025-01-13
    const wed = new Date(2025, 0, 8);
    expect(nextMondayISO(wed)).toBe('2025-01-13');
  });

  it('returns upcoming Monday when from is Saturday', () => {
    // 2025-01-11 is a Saturday -> next Mon 2025-01-13
    const sat = new Date(2025, 0, 11);
    expect(nextMondayISO(sat)).toBe('2025-01-13');
  });

  it('handles month rollover', () => {
    // 2025-01-30 Thu -> next Mon 2025-02-03
    const thu = new Date(2025, 0, 30);
    expect(nextMondayISO(thu)).toBe('2025-02-03');
  });
});
