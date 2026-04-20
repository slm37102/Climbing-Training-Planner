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
