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
}

export interface UserSettings {
  defaultGradeSystem: GradeSystem;
  startOfWeek: 'Monday' | 'Sunday';
  weightUnit: 'kg' | 'lbs';
  activePlanId?: string;
}

// Goal Types
export type GoalType = 'grade' | 'strength';
export type GoalStatus = 'active' | 'completed' | 'archived';

export interface GradeTarget {
  type: 'grade';
  grade: string;              // "V6", "5.12a"
  style: 'send' | 'flash' | 'onsight';
}

export interface StrengthTarget {
  type: 'strength';
  exerciseId?: string;        // optional link to exercise
  metric: 'added_weight' | 'hold_time' | 'edge_depth';
  targetValue: number;
  unit: string;               // "kg", "seconds", "mm"
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  type: GoalType;
  target: GradeTarget | StrengthTarget;
  targetDate?: string;        // ISO date, optional
  createdAt: string;
  completedAt?: string;
  status: GoalStatus;
}

export type AppView = 'DASHBOARD' | 'PLANNER' | 'WORKOUTS' | 'SESSION' | 'PROGRESS' | 'HANGBOARD_PICKER' | 'SETTINGS';

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
