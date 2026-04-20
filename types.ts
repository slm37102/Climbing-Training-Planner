export enum WorkoutType {
  BOULDER = 'Boulder',
  SPORT = 'Sport',
  BOARD = 'Board',
  HANGBOARD = 'Hangboard',
  CONDITIONING = 'Conditioning',
  REST = 'Rest',
  OTHER = 'Other'
}

export enum ExerciseCategory {
  ANTAGONIST = 'Antagonist & Stabilizer',
  CORE = 'Core Training',
  LIMIT_STRENGTH = 'Limit-Strength',
  POWER = 'Power Training',
  STRENGTH_ENDURANCE = 'Strength/Power-Endurance',
  AEROBIC = 'Local/Generalized Aerobic'
}

export interface TimerConfig {
  workSeconds: number;
  restSeconds: number;
  reps: number;
  sets: number;
  restBetweenSetsSeconds: number;
}

export interface TimerPreset {
  id: string;
  name: string;
  timerConfig: TimerConfig;
}

export const DEFAULT_INTERVAL_PRESETS: TimerPreset[] = [
  {
    id: 'repeaters-7-3',
    name: '7/3 Repeaters',
    timerConfig: { workSeconds: 7, restSeconds: 3, reps: 6, sets: 3, restBetweenSetsSeconds: 180 }
  },
  {
    id: 'max-hangs-10',
    name: '10s Max Hangs',
    timerConfig: { workSeconds: 10, restSeconds: 0, reps: 1, sets: 5, restBetweenSetsSeconds: 180 }
  },
  {
    id: 'density-hangs',
    name: 'Density Hangs',
    timerConfig: { workSeconds: 30, restSeconds: 30, reps: 6, sets: 1, restBetweenSetsSeconds: 0 }
  }
];

export type ExercisePillar =
  | 'MaxHang'
  | 'Repeaters'
  | 'LimitBoulder'
  | 'NoHangs'
  | 'Power'
  | 'Endurance'
  | 'Antagonist'
  | 'Other';

export interface Exercise {
  id: string;
  name: string;
  description?: string;
  category: ExerciseCategory;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  defaultSets?: number;
  defaultReps?: number;
  defaultDurationSeconds?: number;
  timerConfig?: TimerConfig;
  pillar?: ExercisePillar;
  // Numbered execution cues/steps (3-6 items). Used by the catalog.
  steps?: string[];
  // Short form-correction reminders surfaced during a session.
  cues?: string[];
  // Things NOT to do — common coaching mistakes.
  commonMistakes?: string[];
  // Optional video demo link (YouTube or similar). Only populated when we
  // have a confirmed reputable source — never fabricated.
  videoUrl?: string;
  // Optional target duration in minutes, used when the exercise is a whole
  // workout block (e.g. ARC, long traverse sessions).
  targetDurationMinutes?: number;
}

export interface WorkoutExercise {
  exerciseId: string;
  sets?: number;
  reps?: number;
  durationSeconds?: number;
  notes?: string;
}

export type TrainingPhase =
  | 'Base'
  | 'Strength'
  | 'Power'
  | 'PowerEndurance'
  | 'Performance'
  | 'Deload'
  | 'Taper'
  | 'Rehab';

export interface Workout {
  id: string;
  name: string;
  type: WorkoutType;
  description: string;
  durationMinutes: number;
  steps: string[]; // Simple text steps for now
  timerConfig?: TimerConfig;
  exercises?: WorkoutExercise[]; // Structured exercises
  phase?: TrainingPhase;
  personaTags?: string[];
  // Optional catalog metadata — additive, backward-compatible.
  category?: ExerciseCategory;
  cues?: string[];
  commonMistakes?: string[];
  videoUrl?: string;
}

export interface PlanWeek {
  weekNumber: number; // 1-indexed
  phase: TrainingPhase;
  label?: string;
  // Slot-based: keys are 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
  slots: { [day: string]: { workoutName: string; notes?: string } };
}

export interface TrainingPlan {
  id: string;
  name: string;
  description: string;
  personaTags: string[];
  durationWeeks: number;
  weeks: PlanWeek[];
}

export interface ScheduledWorkout {
  id: string; // Unique ID for the schedule entry
  date: string; // ISO Date String YYYY-MM-DD
  workoutId: string;
  completed: boolean;
}

import type { GradeSystem } from './utils/grades';

export type ClimbLocation = 'gym' | 'outdoor';
export type SendStyle =
  | 'onsight'
  | 'flash'
  | 'redpoint'
  | 'repeat'
  | 'project'
  | 'attempt';

export interface ClimbLog {
  id: string;
  grade: string;
  // Grade system this climb was logged in. When omitted, consumers should
  // assume the user's current defaultGradeSystem (view-time default).
  // We intentionally do NOT backfill this field on existing logs.
  gradeSystem?: GradeSystem;
  attempts: number;
  sent: boolean;
  timestamp: number;
  // Optional indoor/outdoor context. All fields are additive and backward-
  // compatible — older logs without them remain valid.
  location?: ClimbLocation;
  routeName?: string;
  crag?: string;
  rockType?: string;
  tempC?: number;
  humidityPct?: number;
  sendStyle?: SendStyle;
}

export interface ExerciseLog {
  id: string;
  exerciseId: string;
  completedSets: number;
  completedReps: number;
  addedWeight?: number;      // kg or lbs based on user setting
  edgeDepth?: number;        // mm for hangboard
  resistanceBand?: string;   // color/strength descriptor
  rpe?: number;              // 1-10
  notes?: string;
  timestamp: number;
  pillar?: ExercisePillar;
  isPR?: boolean;
}

export interface SessionLog {
  id: string;
  workoutId: string | null; // null if ad-hoc
  date: string; // ISO Date String
  startTime: number;
  endTime?: number;
  durationMinutes: number;
  rpe: number; // 1-10
  notes: string;
  skinCondition: 'Good' | 'Fair' | 'Bad';
  sleepQuality: 'Good' | 'Fair' | 'Bad';
  climbs: ClimbLog[];
  exerciseLogs?: ExerciseLog[];
  readiness?: Readiness;
}

export interface Readiness {
  sleep: number;      // hours, 3-10
  skin: number;       // 1-5
  energy: number;     // 1-5
  stress: number;     // 1-5 (higher = worse)
  score: number;      // 1-10, computed
  recordedAt: number; // epoch ms
}

export interface OnboardingProfile {
  displayName?: string;
  topBoulderGrade?: string;     // in chosen system
  topRopeGrade?: string;        // in chosen system
  primaryGoal?: 'fun' | 'plateau' | 'project' | 'compete' | 'injury';
  frequencyPerWeek?: number;    // 2..6
  injuryHistory?: 'none' | 'finger_past' | 'shoulder_past' | 'managing';
  equipment?: { hangboard: boolean; board: boolean; freeWeights: boolean };
}

export interface UserSettings {
  defaultGradeSystem: GradeSystem;
  startOfWeek: 'Monday' | 'Sunday';
  weightUnit: 'kg' | 'lbs';
  activePlanId?: string;
  todayReadiness?: {
    date: string; // YYYY-MM-DD
    readiness: Readiness;
  };
  onboardingComplete?: boolean;
  profile?: OnboardingProfile;
}

// ---------------------------------------------------------------------------
// Goals
// ---------------------------------------------------------------------------
// `Goal` is a discriminated union over `type`. Six variants are supported:
// grade, volume, strength, project, comp, rehab. Each variant carries its
// own typed fields plus common fields (`id`, `achieved?`, `notes?`,
// `deadline?`).
//
// Legacy fields (`title?`, `description?`, `status?`, `target?`, `targetDate?`,
// `createdAt?`, `completedAt?`) remain on the shared `GoalCommon` base so
// code written before the union refactor (notably SessionTracker and
// Progress) continues to type-check and behave correctly. New code should
// prefer the spec fields (`deadline`, `achieved`, `notes`) and the typed
// per-variant fields over the legacy ones.
//
// Note: the spec sketch names the numeric target on a volume goal `target`.
// Because `target?: GradeTarget | StrengthTarget` already lives on
// `GoalCommon` for back-compat, we store the numeric value on
// `targetCount` instead. `GoalSchema` in `schemas/index.ts` accepts either
// spelling on read and normalizes to `targetCount`.
// ---------------------------------------------------------------------------

export type GoalType = 'grade' | 'volume' | 'strength' | 'project' | 'comp' | 'rehab';
export type GoalStatus = 'active' | 'completed' | 'archived';

// Legacy target shapes, pre-discriminated-union. Preserved so existing docs
// and code paths keep working.
export interface GradeTarget {
  type: 'grade';
  grade: string;              // "V6", "5.12a"
  style: 'send' | 'flash' | 'onsight';
}

export interface StrengthTarget {
  type: 'strength';
  exerciseId?: string;
  metric: 'added_weight' | 'hold_time' | 'edge_depth';
  targetValue: number;
  unit: string;               // "kg", "seconds", "mm"
}

interface GoalCommon {
  id: string;
  // New unified fields (spec)
  deadline?: string;
  achieved?: boolean;
  notes?: string;
  // Legacy fields — optional, populated for back-compat when it's cheap.
  title?: string;
  description?: string;
  status?: GoalStatus;
  target?: GradeTarget | StrengthTarget;
  targetDate?: string;
  createdAt?: string;
  completedAt?: string;
}

export interface GradeGoal extends GoalCommon {
  type: 'grade';
  targetGrade: string;
  discipline: 'boulder' | 'sport' | 'trad';
}

export interface VolumeGoal extends GoalCommon {
  type: 'volume';
  /** Numeric target. Spec calls this `target`; stored as `targetCount` to
   * avoid colliding with the legacy object-shaped `target` field on the
   * common base. `GoalSchema` accepts either spelling at read time. */
  targetCount: number;
  unit: 'sessions' | 'hours' | 'climbs';
  window: 'weekly' | 'monthly' | 'block';
}

export interface StrengthGoal extends GoalCommon {
  type: 'strength';
  metric: 'maxHang' | 'weightedPullup' | 'oneArmHang' | 'custom';
  targetKg?: number;
  durationSec?: number;
  customLabel?: string;
}

export interface ProjectGoal extends GoalCommon {
  type: 'project';
  routeName: string;
  crag?: string;
  grade?: string;
}

export interface CompGoal extends GoalCommon {
  type: 'comp';
  compName: string;
  date: string;
  placementTarget?: string;
}

export interface RehabGoal extends GoalCommon {
  type: 'rehab';
  injury: string;
  phase: 'acute' | 'sub-acute' | 'return-to-climb';
  clearedBy?: string;
}

export type Goal =
  | GradeGoal
  | VolumeGoal
  | StrengthGoal
  | ProjectGoal
  | CompGoal
  | RehabGoal;

// Type guards — prefer these over `as` casts when narrowing a `Goal`.
export const isGradeGoal = (g: Goal): g is GradeGoal => g.type === 'grade';
export const isVolumeGoal = (g: Goal): g is VolumeGoal => g.type === 'volume';
export const isStrengthGoal = (g: Goal): g is StrengthGoal => g.type === 'strength';
export const isProjectGoal = (g: Goal): g is ProjectGoal => g.type === 'project';
export const isCompGoal = (g: Goal): g is CompGoal => g.type === 'comp';
export const isRehabGoal = (g: Goal): g is RehabGoal => g.type === 'rehab';

// ---------------------------------------------------------------------------
// Projects (Beta Book)
// ---------------------------------------------------------------------------
// A `Project` represents a specific route or boulder the user is working on,
// with freeform beta notes, attempt tracking, and a status lifecycle
// (projecting → sent / shelved). Stored under users/{uid}/projects/{id}.
export type ProjectDiscipline = 'boulder' | 'sport' | 'trad';
export type ProjectStatus = 'projecting' | 'sent' | 'shelved';

export interface Project {
  id: string;
  name: string;
  crag?: string;
  grade?: string;
  discipline: ProjectDiscipline;
  status: ProjectStatus;
  beta?: string;
  attempts?: number;
  createdAt: string;
  sentAt?: string;
}

// Hangboard Protocol — a science-backed interval prescription that can be
// turned into a concrete Workout. See data/hangboardProtocols.ts for the seed
// catalog. A future PR may migrate this to a global Firestore collection so
// updates ship to all users without an app release.
export type HangboardPillar = 'MaxStrength' | 'Endurance' | 'Frequency';
export type HangboardLoadPrescription = 'addedWeight' | 'minEdge' | 'bodyweight';

export interface HangboardProtocol {
  id: string;
  name: string;                           // "MaxHangs 10s"
  aka?: string[];                         // ["Max Hangs", "Lopez Max"]
  pillar: HangboardPillar;
  edgeRecommendation: { mm: number[]; prefer: number };
  loadPrescription: HangboardLoadPrescription;
  work: number;                           // seconds per rep
  rest: number;                           // seconds between reps
  reps: number;
  sets: number;
  restBetweenSets: number;                // seconds
  frequencyPerWeek: number;
  source: { title: string; author: string; url?: string };
  contraindications?: string[];
  /** One-line rationale surfaced in the "Why this protocol?" tooltip. */
  rationale?: string;
  /** Optional extra load hint like "80–100% MVC" or "30–70% BW". */
  loadHint?: string;
}
