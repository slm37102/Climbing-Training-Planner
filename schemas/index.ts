import { z } from 'zod';
import { WorkoutType } from '../types';

/**
 * Runtime validation schemas for documents read from Firestore.
 *
 * Philosophy:
 * - Schemas mirror the TypeScript types in `types.ts` exactly. When the two
 *   disagree, update the schema to match the type (the type is the source of
 *   truth for application code).
 * - `.passthrough()` preserves unknown fields so a future app version can
 *   still round-trip docs written by older clients.
 * - Validation is non-throwing at the call site (see `parseDocs` / safeParse)
 *   so one bad doc cannot break a whole listener.
 */

export const GradeSystemSchema = z.enum(['V', 'Font', 'YDS', 'French', 'UIAA']);

export const TimerConfigSchema = z.object({
  workSeconds: z.number(),
  restSeconds: z.number(),
  reps: z.number(),
  sets: z.number(),
  restBetweenSetsSeconds: z.number(),
});

export const WorkoutExerciseSchema = z.object({
  exerciseId: z.string(),
  sets: z.number().optional(),
  reps: z.number().optional(),
  durationSeconds: z.number().optional(),
  notes: z.string().optional(),
});

export const TrainingPhaseSchema = z.enum([
  'Base',
  'Strength',
  'Power',
  'PowerEndurance',
  'Performance',
  'Deload',
  'Taper',
  'Rehab',
]);

export const ExercisePillarSchema = z.enum([
  'MaxHang',
  'Repeaters',
  'LimitBoulder',
  'NoHangs',
  'Power',
  'Endurance',
  'Antagonist',
  'Other',
]);

export const WorkoutSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    type: z.nativeEnum(WorkoutType),
    description: z.string(),
    durationMinutes: z.number(),
    steps: z.array(z.string()),
    timerConfig: TimerConfigSchema.optional(),
    exercises: z.array(WorkoutExerciseSchema).optional(),
    phase: TrainingPhaseSchema.optional(),
    personaTags: z.array(z.string()).optional(),
  })
  .passthrough();

export const ScheduledWorkoutSchema = z
  .object({
    id: z.string(),
    date: z.string(),
    workoutId: z.string(),
    completed: z.boolean(),
  })
  .passthrough();

export const ClimbLocationSchema = z.enum(['gym', 'outdoor']);

export const SendStyleSchema = z.enum([
  'onsight',
  'flash',
  'redpoint',
  'repeat',
  'project',
  'attempt',
]);

export const ClimbLogSchema = z
  .object({
    id: z.string(),
    grade: z.string(),
    gradeSystem: GradeSystemSchema.optional(),
    attempts: z.number(),
    sent: z.boolean(),
    timestamp: z.number(),
    location: ClimbLocationSchema.optional(),
    routeName: z.string().optional(),
    crag: z.string().optional(),
    rockType: z.string().optional(),
    tempC: z.number().min(-20).max(40).optional(),
    humidityPct: z.number().min(0).max(100).optional(),
    sendStyle: SendStyleSchema.optional(),
  })
  .passthrough();

export const ExerciseLogSchema = z
  .object({
    id: z.string(),
    exerciseId: z.string(),
    completedSets: z.number(),
    completedReps: z.number(),
    addedWeight: z.number().optional(),
    edgeDepth: z.number().optional(),
    resistanceBand: z.string().optional(),
    rpe: z.number().optional(),
    notes: z.string().optional(),
    timestamp: z.number(),
    pillar: ExercisePillarSchema.optional(),
    isPR: z.boolean().optional(),
  })
  .passthrough();

export const ReadinessSchema = z
  .object({
    sleep: z.number(),
    skin: z.number(),
    energy: z.number(),
    stress: z.number(),
    score: z.number(),
    recordedAt: z.number(),
  })
  .passthrough();

export const SessionLogSchema = z
  .object({
    id: z.string(),
    workoutId: z.string().nullable(),
    date: z.string(),
    startTime: z.number(),
    endTime: z.number().optional(),
    durationMinutes: z.number(),
    rpe: z.number(),
    notes: z.string(),
    skinCondition: z.enum(['Good', 'Fair', 'Bad']),
    sleepQuality: z.enum(['Good', 'Fair', 'Bad']),
    climbs: z.array(ClimbLogSchema),
    exerciseLogs: z.array(ExerciseLogSchema).optional(),
    readiness: ReadinessSchema.optional(),
  })
  .passthrough();

export const OnboardingProfileSchema = z
  .object({
    displayName: z.string().optional(),
    topBoulderGrade: z.string().optional(),
    topRopeGrade: z.string().optional(),
    primaryGoal: z.enum(['fun', 'plateau', 'project', 'compete', 'injury']).optional(),
    frequencyPerWeek: z.number().optional(),
    injuryHistory: z.enum(['none', 'finger_past', 'shoulder_past', 'managing']).optional(),
    equipment: z
      .object({
        hangboard: z.boolean(),
        board: z.boolean(),
        freeWeights: z.boolean(),
      })
      .optional(),
  })
  .passthrough();

export const UserSettingsSchema = z
  .object({
    defaultGradeSystem: GradeSystemSchema,
    startOfWeek: z.enum(['Monday', 'Sunday']),
    weightUnit: z.enum(['kg', 'lbs']),
    activePlanId: z.string().optional(),
    todayReadiness: z
      .object({
        date: z.string(),
        readiness: ReadinessSchema,
      })
      .optional(),
    onboardingComplete: z.boolean().optional(),
    profile: OnboardingProfileSchema.optional(),
  })
  .passthrough();

// ---------------------------------------------------------------------------
// Goals
// ---------------------------------------------------------------------------

const GradeTargetSchema = z
  .object({
    type: z.literal('grade'),
    grade: z.string(),
    style: z.enum(['send', 'flash', 'onsight']),
  })
  .passthrough();

const StrengthTargetSchema = z
  .object({
    type: z.literal('strength'),
    exerciseId: z.string().optional(),
    metric: z.enum(['added_weight', 'hold_time', 'edge_depth']),
    targetValue: z.number(),
    unit: z.string(),
  })
  .passthrough();

const GoalStatusSchema = z.enum(['active', 'completed', 'archived']);

// Fields shared by every goal variant. Legacy-compat fields are optional
// so new-shape docs parse cleanly and old-shape docs round-trip.
const GoalCommonShape = {
  id: z.string(),
  deadline: z.string().optional(),
  achieved: z.boolean().optional(),
  notes: z.string().optional(),
  // Legacy
  title: z.string().optional(),
  description: z.string().optional(),
  status: GoalStatusSchema.optional(),
  target: z.union([GradeTargetSchema, StrengthTargetSchema]).optional(),
  targetDate: z.string().optional(),
  createdAt: z.string().optional(),
  completedAt: z.string().optional(),
} as const;

const GradeGoalSchema = z
  .object({
    ...GoalCommonShape,
    type: z.literal('grade'),
    targetGrade: z.string(),
    discipline: z.enum(['boulder', 'sport', 'trad']),
  })
  .passthrough();

const VolumeGoalSchema = z
  .object({
    ...GoalCommonShape,
    type: z.literal('volume'),
    targetCount: z.number(),
    unit: z.enum(['sessions', 'hours', 'climbs']),
    window: z.enum(['weekly', 'monthly', 'block']),
  })
  .passthrough();

const StrengthGoalSchema = z
  .object({
    ...GoalCommonShape,
    type: z.literal('strength'),
    metric: z.enum(['maxHang', 'weightedPullup', 'oneArmHang', 'custom']),
    targetKg: z.number().optional(),
    durationSec: z.number().optional(),
    customLabel: z.string().optional(),
  })
  .passthrough();

const ProjectGoalSchema = z
  .object({
    ...GoalCommonShape,
    type: z.literal('project'),
    routeName: z.string(),
    crag: z.string().optional(),
    grade: z.string().optional(),
  })
  .passthrough();

const CompGoalSchema = z
  .object({
    ...GoalCommonShape,
    type: z.literal('comp'),
    compName: z.string(),
    date: z.string(),
    placementTarget: z.string().optional(),
  })
  .passthrough();

const RehabGoalSchema = z
  .object({
    ...GoalCommonShape,
    type: z.literal('rehab'),
    injury: z.string(),
    phase: z.enum(['acute', 'sub-acute', 'return-to-climb']),
    clearedBy: z.string().optional(),
  })
  .passthrough();

/**
 * Pre-parse migration for goal docs:
 *  - Legacy docs with no `type` but a `target.type === 'grade'` or a top-level
 *    `targetGrade` are treated as grade goals.
 *  - Legacy docs with `target.type === 'strength'` in the old nested shape
 *    are mapped to the new `type: 'strength'` with best-effort metric
 *    inference (old `added_weight` / `hold_time` / `edge_depth` metrics have
 *    no direct equivalent in the new spec's `maxHang` / `weightedPullup`
 *    etc., so we default to `custom` and stash the old label).
 *  - For volume goals, accept the spec's `target: number` spelling and
 *    normalize it to `targetCount` so it matches the TS type.
 */
const goalPreprocess = (raw: unknown): unknown => {
  if (!raw || typeof raw !== 'object') return raw;
  const g = { ...(raw as Record<string, unknown>) };
  const legacyTarget = g.target as { type?: string; grade?: string; metric?: string; targetValue?: number; unit?: string; exerciseId?: string } | undefined;

  if (typeof g.type !== 'string') {
    if (legacyTarget?.type === 'grade' || typeof g.targetGrade === 'string') {
      g.type = 'grade';
    } else if (legacyTarget?.type === 'strength') {
      g.type = 'strength';
    }
  }

  if (g.type === 'grade') {
    if (typeof g.targetGrade !== 'string' && typeof legacyTarget?.grade === 'string') {
      g.targetGrade = legacyTarget.grade;
    }
    if (typeof g.discipline !== 'string') {
      g.discipline = 'boulder';
    }
  }

  if (g.type === 'strength') {
    const m = g.metric;
    const allowedNew = ['maxHang', 'weightedPullup', 'oneArmHang', 'custom'];
    if (typeof m !== 'string' || !allowedNew.includes(m)) {
      if (legacyTarget?.metric) {
        g.customLabel = g.customLabel ?? legacyTarget.metric;
      }
      g.metric = 'custom';
    }
    if (g.targetKg === undefined && legacyTarget?.unit === 'kg' && typeof legacyTarget.targetValue === 'number') {
      g.targetKg = legacyTarget.targetValue;
    }
    if (g.durationSec === undefined && legacyTarget?.unit === 'seconds' && typeof legacyTarget.targetValue === 'number') {
      g.durationSec = legacyTarget.targetValue;
    }
  }

  if (g.type === 'volume') {
    if (g.targetCount === undefined && typeof g.target === 'number') {
      g.targetCount = g.target;
      delete g.target;
    }
  }

  return g;
};

/**
 * Runtime schema for a `Goal` discriminated union. Applies the legacy
 * migration preprocessor so docs written by older clients (or the bare
 * pre-`type` shape) load without data loss.
 */
export const GoalSchema = z.preprocess(
  goalPreprocess,
  z.discriminatedUnion('type', [
    GradeGoalSchema,
    VolumeGoalSchema,
    StrengthGoalSchema,
    ProjectGoalSchema,
    CompGoalSchema,
    RehabGoalSchema,
  ]),
);

/**
 * Minimal shape of the `QueryDocumentSnapshot`s returned by Firestore
 * `onSnapshot` callbacks. Extracted so `parseDocs` can be called from tests
 * without pulling in the real firestore SDK.
 */
export interface DocLike {
  id: string;
  data: () => unknown;
}

/**
 * Validate an array of Firestore documents against a schema. Valid docs are
 * returned in order; invalid docs are logged via `console.warn` and skipped.
 */
export function parseDocs<T>(
  schema: z.ZodType<T>,
  docs: readonly DocLike[],
  kind: string,
): T[] {
  const out: T[] = [];
  for (const d of docs) {
    const raw = { id: d.id, ...(d.data() as Record<string, unknown>) };
    const result = schema.safeParse(raw);
    if (result.success) {
      out.push(result.data);
    } else {
      console.warn(`Invalid ${kind} doc`, d.id, result.error.flatten());
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Projects (Beta Book)
// ---------------------------------------------------------------------------

export const ProjectDisciplineSchema = z.enum(['boulder', 'sport', 'trad']);
export const ProjectStatusSchema = z.enum(['projecting', 'sent', 'shelved']);

/**
 * Runtime schema for a `Project`. Required fields: id, name, discipline,
 * createdAt. `status` defaults to 'projecting' when missing so older or
 * partially-written docs still load. Numeric `attempts` defaults to 0.
 */
export const ProjectSchema = z
  .object({
    id: z.string(),
    name: z.string().min(1),
    crag: z.string().optional(),
    grade: z.string().optional(),
    discipline: ProjectDisciplineSchema,
    status: ProjectStatusSchema.default('projecting'),
    beta: z.string().optional(),
    attempts: z.number().int().nonnegative().optional(),
    createdAt: z.string(),
    sentAt: z.string().optional(),
  })
  .passthrough();

/**
 * Parse an array of raw Firestore-like objects (each expected to already
 * contain its `id` merged with doc data) into validated `Project`s. Invalid
 * entries are logged and skipped. Follows the same philosophy as
 * `parseDocs` but takes plain objects so callers (and tests) don't need to
 * construct `DocLike` wrappers.
 */
export function parseProjects(docs: unknown[]): import('../types').Project[] {
  const out: import('../types').Project[] = [];
  for (const raw of docs) {
    const result = ProjectSchema.safeParse(raw);
    if (result.success) {
      out.push(result.data as import('../types').Project);
    } else {
      const id = (raw && typeof raw === 'object' && 'id' in raw)
        ? (raw as { id: unknown }).id
        : '<unknown>';
      console.warn('Invalid Project doc', id, result.error.flatten());
    }
  }
  return out;
}
