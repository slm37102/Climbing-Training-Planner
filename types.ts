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
}

export interface WorkoutExercise {
  exerciseId: string;
  sets?: number;
  reps?: number;
  durationSeconds?: number;
  notes?: string;
}

export interface Workout {
  id: string;
  name: string;
  type: WorkoutType;
  description: string;
  durationMinutes: number;
  steps: string[]; // Simple text steps for now
  timerConfig?: TimerConfig;
  exercises?: WorkoutExercise[]; // Structured exercises
}

export interface ScheduledWorkout {
  id: string; // Unique ID for the schedule entry
  date: string; // ISO Date String YYYY-MM-DD
  workoutId: string;
  completed: boolean;
}

export interface ClimbLog {
  id: string;
  grade: string;
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
  defaultGradeSystem: 'V-Scale' | 'Font';
  startOfWeek: 'Monday' | 'Sunday';
  weightUnit: 'kg' | 'lbs';
}

export type AppView = 'DASHBOARD' | 'PLANNER' | 'WORKOUTS' | 'SESSION' | 'PROGRESS';
