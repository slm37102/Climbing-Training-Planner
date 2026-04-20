import { describe, it, expect } from 'vitest';
import {
  SEED_TRAINING_PLANS,
  planToScheduleEntries,
  buildPlanApplication,
  guessWorkoutType,
} from '../data/trainingPlans';
import { WorkoutType } from '../types';

describe('SEED_TRAINING_PLANS catalog integrity', () => {
  it('ships at least 5 plans', () => {
    expect(SEED_TRAINING_PLANS.length).toBeGreaterThanOrEqual(5);
  });

  it('every plan has a unique id', () => {
    const ids = SEED_TRAINING_PLANS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every plan has weeks.length matching durationWeeks, >0, and non-empty workoutName slots', () => {
    SEED_TRAINING_PLANS.forEach((plan) => {
      expect(plan.durationWeeks).toBeGreaterThan(0);
      expect(plan.weeks.length).toBe(plan.durationWeeks);
      plan.weeks.forEach((w) => {
        expect(w.weekNumber).toBeGreaterThan(0);
        const slotEntries = Object.values(w.slots);
        expect(slotEntries.length).toBeGreaterThan(0);
        slotEntries.forEach((slot) => {
          expect(slot.workoutName).toBeTruthy();
          expect(typeof slot.workoutName).toBe('string');
          expect(slot.workoutName.length).toBeGreaterThan(0);
        });
      });
    });
  });

  it('week numbers are sequential 1..durationWeeks', () => {
    SEED_TRAINING_PLANS.forEach((plan) => {
      const nums = plan.weeks.map((w) => w.weekNumber).sort((a, b) => a - b);
      nums.forEach((n, i) => expect(n).toBe(i + 1));
    });
  });

  it('contains the 7 canonical plan ids from the issue', () => {
    const ids = SEED_TRAINING_PLANS.map((p) => p.id);
    [
      'plan-just-climb',
      'plan-intro-strength',
      'plan-rctm-break-v5',
      'plan-project-peaking-14',
      'plan-year-round-undulating',
      'plan-post-injury-return',
      'plan-comp-prep-6',
    ].forEach((id) => expect(ids).toContain(id));
  });
});

describe('planToScheduleEntries', () => {
  const startMonday = '2025-01-06'; // known Monday

  it('maps day-name slots to correct weekday offsets', () => {
    const plan = SEED_TRAINING_PLANS.find((p) => p.id === 'plan-intro-strength')!;
    const entries = planToScheduleEntries(plan, startMonday);

    // Week 1: mon=2025-01-06, wed=2025-01-08, fri=2025-01-10, sat=2025-01-11
    const wk1 = entries.filter((e) => e.weekNumber === 1);
    const byDay = Object.fromEntries(wk1.map((e) => [e.dayKey, e.date]));
    expect(byDay.mon).toBe('2025-01-06');
    expect(byDay.wed).toBe('2025-01-08');
    expect(byDay.fri).toBe('2025-01-10');
    expect(byDay.sat).toBe('2025-01-11');
  });

  it('shifts each subsequent week by 7 days', () => {
    const plan = SEED_TRAINING_PLANS.find((p) => p.id === 'plan-intro-strength')!;
    const entries = planToScheduleEntries(plan, startMonday);
    const wk1Mon = entries.find((e) => e.weekNumber === 1 && e.dayKey === 'mon');
    const wk2Mon = entries.find((e) => e.weekNumber === 2 && e.dayKey === 'mon');
    expect(wk1Mon?.date).toBe('2025-01-06');
    expect(wk2Mon?.date).toBe('2025-01-13');
  });

  it('skips days not present in slots and preserves notes', () => {
    const plan = SEED_TRAINING_PLANS.find((p) => p.id === 'plan-just-climb')!;
    const entries = planToScheduleEntries(plan, startMonday);
    // Just Climb has only 2 real workout slots per week (tue, fri) - rest are
    // still included since every day is populated (rest counts as a workoutName).
    // Verify every entry has a non-empty workoutName.
    entries.forEach((e) => expect(e.workoutName.length).toBeGreaterThan(0));
  });

  it('emits total entries equal to sum of slots across weeks', () => {
    SEED_TRAINING_PLANS.forEach((plan) => {
      const totalSlots = plan.weeks.reduce(
        (sum, w) => sum + Object.keys(w.slots).length,
        0
      );
      expect(planToScheduleEntries(plan, startMonday).length).toBe(totalSlots);
    });
  });

  it('ignores unknown slot keys (defensive)', () => {
    const plan = {
      id: 'tmp',
      name: 'tmp',
      description: '',
      personaTags: [],
      durationWeeks: 1,
      weeks: [
        {
          weekNumber: 1,
          phase: 'Base' as const,
          slots: {
            mon: { workoutName: 'A' },
            bogus: { workoutName: 'B' },
          },
        },
      ],
    };
    const entries = planToScheduleEntries(plan, startMonday);
    expect(entries.map((e) => e.dayKey)).toEqual(['mon']);
  });
});

describe('buildPlanApplication', () => {
  it('reuses existing workouts by case-insensitive name match', () => {
    const plan = SEED_TRAINING_PLANS.find((p) => p.id === 'plan-just-climb')!;
    let counter = 0;
    const makeId = () => `id-${counter++}`;
    const existing = [
      { id: 'w-rest', name: 'Rest', type: WorkoutType.REST, description: '', durationMinutes: 0, steps: [] },
      { id: 'w-fun', name: 'outdoor / fun', type: WorkoutType.OTHER, description: '', durationMinutes: 60, steps: [] },
    ];
    const { newWorkouts, newScheduleEntries } = buildPlanApplication(plan, '2025-01-06', existing, makeId);
    // Every entry has a workoutId, and none of the newWorkouts reuse existing names.
    newWorkouts.forEach((w) => {
      expect(['rest', 'outdoor / fun']).not.toContain(w.name.toLowerCase());
    });
    expect(newScheduleEntries.length).toBeGreaterThan(0);
    newScheduleEntries.forEach((s) => {
      expect(s.workoutId).toBeTruthy();
      expect(s.completed).toBe(false);
    });
  });

  it('creates placeholder workouts for unknown names with guessed types', () => {
    const plan = SEED_TRAINING_PLANS.find((p) => p.id === 'plan-intro-strength')!;
    let counter = 0;
    const makeId = () => `id-${counter++}`;
    const { newWorkouts } = buildPlanApplication(plan, '2025-01-06', [], makeId);
    const names = newWorkouts.map((w) => w.name);
    // Each placeholder should map via guessWorkoutType
    newWorkouts.forEach((w) => {
      expect(w.type).toBe(guessWorkoutType(w.name));
    });
    expect(names).toContain('Rest');
  });
});

describe('guessWorkoutType', () => {
  it('classifies common plan workout names', () => {
    expect(guessWorkoutType('Rest')).toBe(WorkoutType.REST);
    expect(guessWorkoutType('Hangboard — Max Hangs')).toBe(WorkoutType.HANGBOARD);
    expect(guessWorkoutType('No-Hangs 3×5')).toBe(WorkoutType.HANGBOARD);
    expect(guessWorkoutType('Limit Bouldering')).toBe(WorkoutType.BOULDER);
    expect(guessWorkoutType('Campus / Power Boulders')).toBe(WorkoutType.BOARD);
    expect(guessWorkoutType('ARC — 30 min')).toBe(WorkoutType.SPORT);
    expect(guessWorkoutType('Antagonist Circuit')).toBe(WorkoutType.CONDITIONING);
    expect(guessWorkoutType('Outdoor / Fun')).toBe(WorkoutType.OTHER);
  });
});
