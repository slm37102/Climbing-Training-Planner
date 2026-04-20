import { TrainingPlan, TrainingPhase, PlanWeek, Workout, WorkoutType, ScheduledWorkout } from '../types';
import { generateId } from '../utils';

const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
export type DayKey = typeof DAY_KEYS[number];

export const PLAN_DAY_ORDER: readonly DayKey[] = DAY_KEYS;

// --- Helpers to keep plan definitions terse ----------------------------------
const rest = (notes?: string) => ({ workoutName: 'Rest', notes });
const wk = (
  weekNumber: number,
  phase: TrainingPhase,
  slots: PlanWeek['slots'],
  label?: string
): PlanWeek => ({ weekNumber, phase, label, slots });

// Common slot builders
const baseWeekSlots: PlanWeek['slots'] = {
  mon: { workoutName: 'ARC — 30 min' },
  tue: rest(),
  wed: { workoutName: 'Volume Bouldering' },
  thu: rest(),
  fri: { workoutName: 'Antagonist Circuit' },
  sat: { workoutName: 'Outdoor / Fun' },
  sun: rest('Full rest'),
};

const strengthWeekSlots: PlanWeek['slots'] = {
  mon: { workoutName: 'Hangboard — Max Hangs' },
  tue: rest(),
  wed: { workoutName: 'Limit Bouldering' },
  thu: rest(),
  fri: { workoutName: 'Hangboard — Max Hangs' },
  sat: { workoutName: 'Outdoor / Fun' },
  sun: { workoutName: 'Antagonist Circuit' },
};

const powerWeekSlots: PlanWeek['slots'] = {
  mon: { workoutName: 'Campus / Power Boulders' },
  tue: rest(),
  wed: { workoutName: 'Limit Bouldering' },
  thu: rest(),
  fri: { workoutName: 'Campus / Power Boulders' },
  sat: { workoutName: 'Outdoor / Fun' },
  sun: rest(),
};

const peWeekSlots: PlanWeek['slots'] = {
  mon: { workoutName: '4x4s' },
  tue: rest(),
  wed: { workoutName: 'Linked Circuits' },
  thu: rest(),
  fri: { workoutName: '4x4s' },
  sat: { workoutName: 'Outdoor / Fun' },
  sun: { workoutName: 'ARC — 30 min' },
};

const perfWeekSlots: PlanWeek['slots'] = {
  mon: { workoutName: 'Limit Bouldering', notes: 'Low volume, high quality' },
  tue: rest(),
  wed: { workoutName: 'Outdoor / Fun', notes: 'Performance attempts' },
  thu: rest(),
  fri: rest('Pre-send rest'),
  sat: { workoutName: 'Outdoor / Fun', notes: 'Project send day' },
  sun: { workoutName: 'Outdoor / Fun', notes: 'Backup send day' },
};

const deloadWeekSlots: PlanWeek['slots'] = {
  mon: { workoutName: 'ARC — 30 min' },
  tue: rest(),
  wed: { workoutName: 'Easy Traversing' },
  thu: rest(),
  fri: { workoutName: 'Antagonist Circuit', notes: 'Light' },
  sat: rest(),
  sun: rest(),
};

const taperWeekSlots: PlanWeek['slots'] = {
  mon: { workoutName: 'Limit Bouldering', notes: 'Short & sharp' },
  tue: rest(),
  wed: { workoutName: 'Campus / Power Boulders', notes: 'Primer, 30 min' },
  thu: rest(),
  fri: rest('Pre-comp/trip rest'),
  sat: { workoutName: 'Outdoor / Fun', notes: 'Send attempt / comp day' },
  sun: rest(),
};

// Repeats a slot template across N weeks, tagging the phase + label.
const repeatWeeks = (
  start: number,
  count: number,
  phase: TrainingPhase,
  slots: PlanWeek['slots'],
  labelPrefix: string
): PlanWeek[] =>
  Array.from({ length: count }, (_, i) =>
    wk(start + i, phase, slots, `${labelPrefix} wk ${i + 1}`)
  );

// --- Plan 1: Just Climb (2x/wk, 4 wks) --------------------------------------
const justClimbWeek = (n: number): PlanWeek =>
  wk(n, 'Base', {
    mon: rest(),
    tue: { workoutName: 'Outdoor / Fun', notes: 'Climb whatever you enjoy' },
    wed: rest(),
    thu: rest(),
    fri: { workoutName: 'Outdoor / Fun', notes: 'Gym or crag, have fun' },
    sat: rest(),
    sun: rest(),
  }, `Just Climb wk ${n}`);

const JUST_CLIMB: TrainingPlan = {
  id: 'plan-just-climb',
  name: 'Just Climb',
  description: 'Minimal structure. Climb twice a week, focus on volume and enjoyment. Good for returning climbers or very busy weeks.',
  personaTags: ['beginner', '2x-week', 'minimal-structure'],
  durationWeeks: 4,
  weeks: [1, 2, 3, 4].map(justClimbWeek),
};

// --- Plan 2: Intro Strength (3x/wk, 6 wks) ----------------------------------
const introStrengthWeek = (n: number): PlanWeek =>
  wk(n, n <= 2 ? 'Base' : 'Strength', {
    mon: { workoutName: 'Volume Bouldering', notes: 'Technique focus' },
    tue: rest(),
    wed: { workoutName: 'No-Hangs 3×5', notes: 'Submaximal loading' },
    thu: rest(),
    fri: { workoutName: 'Antagonist Circuit' },
    sat: { workoutName: 'Outdoor / Fun' },
    sun: rest(),
  }, `Intro Strength wk ${n}`);

const INTRO_STRENGTH: TrainingPlan = {
  id: 'plan-intro-strength',
  name: 'Intro Strength',
  description: 'A 3x/week introduction to structured finger and pulling strength. Uses no-hangs to build capacity safely for climbers under 1 year in.',
  personaTags: ['beginner', '3x-week', 'first-plan'],
  durationWeeks: 6,
  weeks: [1, 2, 3, 4, 5, 6].map(introStrengthWeek),
};

// --- Plan 3: Break V5 — RCTM 12 wk ------------------------------------------
const RCTM_12: TrainingPlan = {
  id: 'plan-rctm-break-v5',
  name: 'Break V5 — RCTM 12 wk',
  description: '12-week periodized plan (Rock Climber\'s Training Manual style): 4 wks Base, 4 wks Strength, 3 wks Power, 1 wk Performance + Deload. Designed to push from V4 to V5/V6.',
  personaTags: ['intermediate', 'plateau', '4x-week', 'periodized'],
  durationWeeks: 12,
  weeks: [
    ...repeatWeeks(1, 4, 'Base', baseWeekSlots, 'Base'),
    ...repeatWeeks(5, 4, 'Strength', strengthWeekSlots, 'Strength'),
    ...repeatWeeks(9, 3, 'Power', powerWeekSlots, 'Power'),
    wk(12, 'Performance', perfWeekSlots, 'Performance + Deload'),
  ],
};

// --- Plan 4: Send Your Project — 14 wk peaking ------------------------------
const PROJECT_14: TrainingPlan = {
  id: 'plan-project-peaking-14',
  name: 'Send Your Project — 14 wk peaking',
  description: 'Long peaking cycle: 6 wks Strength, 3 wks Power, 2 wks Power-Endurance, 2 wks Performance, 1 wk Taper. Built around a known outdoor project.',
  personaTags: ['advanced', 'project', 'peaking', '4x-week'],
  durationWeeks: 14,
  weeks: [
    ...repeatWeeks(1, 6, 'Strength', strengthWeekSlots, 'Strength'),
    ...repeatWeeks(7, 3, 'Power', powerWeekSlots, 'Power'),
    ...repeatWeeks(10, 2, 'PowerEndurance', peWeekSlots, 'PE'),
    ...repeatWeeks(12, 2, 'Performance', perfWeekSlots, 'Performance'),
    wk(14, 'Taper', taperWeekSlots, 'Taper'),
  ],
};

// --- Plan 5: Year-Round Undulating (8 wks) ----------------------------------
const undulatingHardWeek = (n: number): PlanWeek =>
  wk(n, 'Strength', {
    mon: { workoutName: 'Hangboard — Max Hangs', notes: 'Hard day' },
    tue: rest(),
    wed: { workoutName: 'Limit Bouldering', notes: 'Hard day' },
    thu: { workoutName: 'ARC — 30 min', notes: 'Easy day' },
    fri: { workoutName: 'Campus / Power Boulders', notes: 'Hard day' },
    sat: { workoutName: 'Outdoor / Fun', notes: 'Easy day' },
    sun: rest(),
  }, `Undulating hard wk ${n}`);

const undulatingEasyWeek = (n: number): PlanWeek =>
  wk(n, 'Base', {
    mon: { workoutName: 'Volume Bouldering', notes: 'Easy day' },
    tue: rest(),
    wed: { workoutName: 'ARC — 30 min', notes: 'Easy day' },
    thu: rest(),
    fri: { workoutName: 'Antagonist Circuit', notes: 'Easy day' },
    sat: { workoutName: 'Outdoor / Fun' },
    sun: rest(),
  }, `Undulating easy wk ${n}`);

const UNDULATING: TrainingPlan = {
  id: 'plan-year-round-undulating',
  name: 'Year-Round Undulating',
  description: '8 weeks of alternating hard/easy weeks with mixed intensities within each week. Good for maintaining year-round without formal peaks.',
  personaTags: ['intermediate', 'maintenance', 'year-round', '4x-week'],
  durationWeeks: 8,
  weeks: [1, 2, 3, 4, 5, 6, 7, 8].map((n) =>
    n % 2 === 1 ? undulatingHardWeek(n) : undulatingEasyWeek(n)
  ),
};

// --- Plan 6: Post-Injury Return Wk 1–8 --------------------------------------
// Conservative, no max hangs, emphasizes no-hangs and volume.
const rehabEarlyWeek = (n: number): PlanWeek =>
  wk(n, 'Rehab', {
    mon: { workoutName: 'No-Hangs 3×5', notes: 'Submaximal, pain-free only' },
    tue: { workoutName: 'Antagonist Circuit' },
    wed: rest(),
    thu: { workoutName: 'No-Hangs 3×5', notes: 'Submaximal, pain-free only' },
    fri: rest(),
    sat: { workoutName: 'Easy Traversing', notes: 'RPE 5 max, no crimps' },
    sun: rest(),
  }, `Return wk ${n}`);

const rehabMidWeek = (n: number): PlanWeek =>
  wk(n, 'Rehab', {
    mon: { workoutName: 'No-Hangs 3×5' },
    tue: { workoutName: 'Antagonist Circuit' },
    wed: rest(),
    thu: { workoutName: 'Volume Bouldering', notes: 'Easy grades, no tweaks' },
    fri: rest(),
    sat: { workoutName: 'ARC — 30 min' },
    sun: rest(),
  }, `Return wk ${n}`);

const rehabLateWeek = (n: number): PlanWeek =>
  wk(n, 'Base', {
    mon: { workoutName: 'No-Hangs 3×5' },
    tue: { workoutName: 'Antagonist Circuit' },
    wed: rest(),
    thu: { workoutName: 'Volume Bouldering', notes: 'Build volume gradually' },
    fri: rest(),
    sat: { workoutName: 'Outdoor / Fun', notes: 'Easy climbing only' },
    sun: { workoutName: 'ARC — 30 min' },
  }, `Return wk ${n}`);

const POST_INJURY: TrainingPlan = {
  id: 'plan-post-injury-return',
  name: 'Post-Injury Return Wk 1–8',
  description: '8-week conservative return-to-climbing plan. No-hangs primary, zero max hangs, antagonist focus. Consult a physio alongside.',
  personaTags: ['rehab', 'injury-return', 'conservative', 'no-max-hangs'],
  durationWeeks: 8,
  weeks: [
    rehabEarlyWeek(1),
    rehabEarlyWeek(2),
    rehabMidWeek(3),
    rehabMidWeek(4),
    rehabMidWeek(5),
    rehabLateWeek(6),
    rehabLateWeek(7),
    rehabLateWeek(8),
  ],
};

// --- Plan 7: Comp Prep 6 wk -------------------------------------------------
const compPrepWeek = (n: number, phase: TrainingPhase): PlanWeek =>
  wk(n, phase, {
    mon: { workoutName: 'Limit Bouldering', notes: 'Onsight simulation — 4 min per problem' },
    tue: { workoutName: 'Antagonist Circuit' },
    wed: { workoutName: '4x4s', notes: 'Simulated round' },
    thu: rest(),
    fri: { workoutName: 'Linked Circuits', notes: 'Power-endurance' },
    sat: { workoutName: 'Outdoor / Fun', notes: 'Flash mock round' },
    sun: rest(),
  }, `Comp prep wk ${n}`);

const COMP_PREP: TrainingPlan = {
  id: 'plan-comp-prep-6',
  name: 'Comp Prep 6 wk',
  description: '6-week comp prep. Simulated rounds, power-endurance heavy, onsight practice, tapering into comp day.',
  personaTags: ['competition', 'advanced', 'power-endurance', '5x-week'],
  durationWeeks: 6,
  weeks: [
    compPrepWeek(1, 'PowerEndurance'),
    compPrepWeek(2, 'PowerEndurance'),
    compPrepWeek(3, 'PowerEndurance'),
    compPrepWeek(4, 'PowerEndurance'),
    wk(5, 'Performance', {
      mon: { workoutName: 'Limit Bouldering', notes: 'Flash-grade problems only' },
      tue: rest(),
      wed: { workoutName: '4x4s', notes: 'Simulated final round' },
      thu: rest(),
      fri: { workoutName: 'Antagonist Circuit', notes: 'Light' },
      sat: { workoutName: 'Outdoor / Fun', notes: 'Mock comp' },
      sun: rest(),
    }, 'Comp sharpening'),
    wk(6, 'Taper', taperWeekSlots, 'Comp week taper'),
  ],
};

export const SEED_TRAINING_PLANS: TrainingPlan[] = [
  JUST_CLIMB,
  INTRO_STRENGTH,
  RCTM_12,
  PROJECT_14,
  UNDULATING,
  POST_INJURY,
  COMP_PREP,
];

// --- Keyword-based workout type guess ---------------------------------------
export const guessWorkoutType = (name: string): WorkoutType => {
  const n = name.toLowerCase();
  if (n.includes('rest')) return WorkoutType.REST;
  if (n.includes('hangboard') || n.includes('no-hang') || n.includes('no hang') || n.includes('max hang')) {
    return WorkoutType.HANGBOARD;
  }
  if (n.includes('antagonist') || n.includes('core') || n.includes('conditioning')) {
    return WorkoutType.CONDITIONING;
  }
  if (n.includes('campus') || n.includes('board')) return WorkoutType.BOARD;
  if (n.includes('boulder') || n.includes('4x4') || n.includes('circuit') || n.includes('limit')) {
    return WorkoutType.BOULDER;
  }
  if (n.includes('arc') || n.includes('travers') || n.includes('sport') || n.includes('route')) {
    return WorkoutType.SPORT;
  }
  if (n.includes('outdoor') || n.includes('fun')) return WorkoutType.OTHER;
  return WorkoutType.OTHER;
};

// --- Date helpers -----------------------------------------------------------
const DAY_TO_OFFSET: Record<DayKey, number> = {
  mon: 0, tue: 1, wed: 2, thu: 3, fri: 4, sat: 5, sun: 6,
};

const addDays = (dateStr: string, days: number): string => {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

/**
 * Pure helper: expand a plan into schedule entries relative to a Monday start date.
 * Each slot becomes an entry like { date, workoutName, notes, weekNumber, phase }.
 * The caller is responsible for mapping workoutName -> workoutId.
 */
export interface PlanScheduleEntry {
  date: string;
  workoutName: string;
  notes?: string;
  weekNumber: number;
  phase: TrainingPhase;
  dayKey: string;
}

export const planToScheduleEntries = (
  plan: TrainingPlan,
  startDateMonday: string
): PlanScheduleEntry[] => {
  const entries: PlanScheduleEntry[] = [];
  plan.weeks.forEach((week) => {
    const weekStart = addDays(startDateMonday, (week.weekNumber - 1) * 7);
    Object.entries(week.slots).forEach(([dayKey, slot]) => {
      const offset = DAY_TO_OFFSET[dayKey as DayKey];
      if (offset === undefined) return; // skip unknown keys
      if (!slot || !slot.workoutName) return;
      entries.push({
        date: addDays(weekStart, offset),
        workoutName: slot.workoutName,
        notes: slot.notes,
        weekNumber: week.weekNumber,
        phase: week.phase,
        dayKey,
      });
    });
  });
  return entries;
};

/**
 * Given a set of existing workouts and a plan, produce (a) any placeholder
 * workouts that need to be created and (b) schedule entries ready for insertion.
 * Placeholder workouts are minimal stubs — name, guessed type, 60 min duration.
 */
export interface PlanApplyResult {
  newWorkouts: Workout[];
  newScheduleEntries: ScheduledWorkout[];
}

export const buildPlanApplication = (
  plan: TrainingPlan,
  startDateMonday: string,
  existingWorkouts: Workout[],
  makeId: () => string = generateId
): PlanApplyResult => {
  const byName = new Map<string, Workout>();
  existingWorkouts.forEach((w) => byName.set(w.name.toLowerCase(), w));

  const newWorkouts: Workout[] = [];
  const newScheduleEntries: ScheduledWorkout[] = [];

  planToScheduleEntries(plan, startDateMonday).forEach((entry) => {
    const key = entry.workoutName.toLowerCase();
    let workout = byName.get(key);
    if (!workout) {
      workout = {
        id: makeId(),
        name: entry.workoutName,
        type: guessWorkoutType(entry.workoutName),
        description: `Auto-created from plan: ${plan.name}`,
        durationMinutes: guessWorkoutType(entry.workoutName) === WorkoutType.REST ? 0 : 60,
        steps: [],
      };
      byName.set(key, workout);
      newWorkouts.push(workout);
    }
    newScheduleEntries.push({
      id: makeId(),
      date: entry.date,
      workoutId: workout.id,
      completed: false,
    });
  });

  return { newWorkouts, newScheduleEntries };
};
