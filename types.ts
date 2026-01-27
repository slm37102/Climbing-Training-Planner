export enum WorkoutType {
  BOULDER = 'Boulder',
  SPORT = 'Sport',
  BOARD = 'Board',
  HANGBOARD = 'Hangboard',
  CONDITIONING = 'Conditioning',
  REST = 'Rest',
  OTHER = 'Other'
}

export interface TimerConfig {
  workSeconds: number;
  restSeconds: number;
  reps: number;
  sets: number;
  restBetweenSetsSeconds: number;
}

export interface Workout {
  id: string;
  name: string;
  type: WorkoutType;
  description: string;
  durationMinutes: number;
  steps: string[]; // Simple text steps for now
  timerConfig?: TimerConfig;
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
}

export interface UserSettings {
  defaultGradeSystem: 'V-Scale' | 'Font';
  startOfWeek: 'Monday' | 'Sunday';
}

export type AppView = 'DASHBOARD' | 'PLANNER' | 'WORKOUTS' | 'SESSION' | 'PROGRESS';
