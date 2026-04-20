import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot,
  writeBatch,
  query
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import { Workout, ScheduledWorkout, SessionLog, UserSettings, WorkoutType, Exercise, Goal, TrainingPlan, Readiness } from '../types';
import { generateId, formatDate } from '../utils';
import { SEED_TRAINING_PLANS, buildPlanApplication } from '../data/trainingPlans';
import {
  WorkoutSchema,
  ScheduledWorkoutSchema,
  SessionLogSchema,
  UserSettingsSchema,
  GoalSchema,
  parseDocs,
} from '../schemas';
import { EXERCISE_CATALOG } from '../data/exerciseCatalog';

interface StoreContextType {
  workouts: Workout[];
  exercises: Exercise[];
  schedule: ScheduledWorkout[];
  sessions: SessionLog[];
  goals: Goal[];
  settings: UserSettings;
  activeSessionId: string | null;
  
  // Workout Actions
  addWorkout: (workout: Omit<Workout, 'id'>) => void;
  updateWorkout: (workout: Workout) => void;
  deleteWorkout: (id: string) => void;
  
  // Exercise Actions
  addExercise: (exercise: Omit<Exercise, 'id'>) => void;
  updateExercise: (exercise: Exercise) => void;
  deleteExercise: (id: string) => void;
  
  // Goal Actions
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'status'>) => void;
  updateGoal: (goal: Goal) => void;
  completeGoal: (id: string) => void;
  archiveGoal: (id: string) => void;
  deleteGoal: (id: string) => void;
  
  scheduleWorkout: (date: string, workoutId: string) => void;
  removeScheduledWorkout: (scheduleId: string) => void;
  toggleScheduledWorkout: (scheduleId: string, completed: boolean) => void;
  copyWeekToNext: (startDateStr: string) => void;
  
  startSession: (workoutId: string | null, readiness?: Readiness) => string;
  setTodayReadiness: (readiness: Readiness) => Promise<void>;
  updateSession: (id: string, updates: Partial<SessionLog>) => void;
  endSession: (id: string) => void;
  deleteSession: (id: string) => void;
  
  resetData: () => void;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;

  // Training plans (read-only seed catalog)
  trainingPlans: TrainingPlan[];
  applyTrainingPlan: (planId: string, startDate: string) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const SEED_WORKOUTS: Workout[] = [
  {
    id: 'w1',
    name: 'Limit Bouldering',
    type: WorkoutType.BOULDER,
    description: 'Projecting at your limit. Focus on hard moves.',
    durationMinutes: 90,
    steps: ['Warm up (20m)', 'Pyramid up to flash level', 'Projecting: 4-5 problems (45m)', 'Cool down']
  },
  {
    id: 'w2',
    name: 'Hangboard 7/3',
    type: WorkoutType.HANGBOARD,
    description: 'Repeaters protocol. 7s hang, 3s rest. 6 reps per set, 3 sets.',
    durationMinutes: 45,
    steps: ['Warm up fingers', 'Start timer for protocols'],
    timerConfig: {
        workSeconds: 7,
        restSeconds: 3,
        reps: 6,
        sets: 3,
        restBetweenSetsSeconds: 180
    }
  },
  {
    id: 'w3',
    name: 'Volume Day',
    type: WorkoutType.BOULDER,
    description: 'Sub-max climbing to build capacity.',
    durationMinutes: 120,
    steps: ['20 boulders between V2-V4', 'Focus on perfect technique']
  },
  {
    id: 'w4',
    name: 'Rest Day',
    type: WorkoutType.REST,
    description: 'Active recovery or full rest.',
    durationMinutes: 0,
    steps: ['Stretch', 'Walk', 'Sleep']
  }
];

// SEED_EXERCISES: canonical catalog sourced from data/exerciseCatalog.ts.
// New users are seeded with the full catalog on first login.
const SEED_EXERCISES: Exercise[] = EXERCISE_CATALOG;

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [schedule, setSchedule] = useState<ScheduledWorkout[]>([]);
  const [sessions, setSessions] = useState<SessionLog[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [settings, setSettings] = useState<UserSettings>({
    defaultGradeSystem: 'V',
    startOfWeek: 'Monday',
    weightUnit: 'kg'
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Subscribe to Firestore data when user is logged in
  useEffect(() => {
    if (!user) {
      // Reset state when logged out
      setWorkouts([]);
      setExercises([]);
      setSchedule([]);
      setSessions([]);
      setGoals([]);
      setActiveSessionId(null);
      setIsLoaded(false);
      return;
    }

    const userId = user.uid;
    const unsubscribers: (() => void)[] = [];

    // Subscribe to workouts
    const workoutsRef = collection(db, 'users', userId, 'workouts');
    unsubscribers.push(
      onSnapshot(query(workoutsRef), (snapshot) => {
        if (snapshot.empty && !isLoaded) {
          // Seed default workouts for new users
          seedDefaultData(userId);
        } else {
          const data = parseDocs(WorkoutSchema, snapshot.docs, 'Workout') as Workout[];
          setWorkouts(data);
        }
      })
    );

    // Subscribe to exercises
    const exercisesRef = collection(db, 'users', userId, 'exercises');
    unsubscribers.push(
      onSnapshot(query(exercisesRef), (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Exercise));
        setExercises(data);
      })
    );

    // Subscribe to schedule
    const scheduleRef = collection(db, 'users', userId, 'schedule');
    unsubscribers.push(
      onSnapshot(query(scheduleRef), (snapshot) => {
        const data = parseDocs(ScheduledWorkoutSchema, snapshot.docs, 'ScheduledWorkout') as ScheduledWorkout[];
        setSchedule(data);
      })
    );

    // Subscribe to sessions
    const sessionsRef = collection(db, 'users', userId, 'sessions');
    unsubscribers.push(
      onSnapshot(query(sessionsRef), (snapshot) => {
        const data = parseDocs(SessionLogSchema, snapshot.docs, 'SessionLog') as SessionLog[];
        setSessions(data);
      })
    );

    // Subscribe to goals
    const goalsRef = collection(db, 'users', userId, 'goals');
    unsubscribers.push(
      onSnapshot(query(goalsRef), (snapshot) => {
        const data = parseDocs(GoalSchema, snapshot.docs, 'Goal') as Goal[];
        setGoals(data);
      })
    );

    // Subscribe to user settings (including activeSessionId)
    const settingsRef = doc(db, 'users', userId, 'meta', 'settings');
    unsubscribers.push(
      onSnapshot(settingsRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data.activeSessionId !== undefined) {
            setActiveSessionId(data.activeSessionId);
          }
          if (data.settings) {
            // Migrate legacy 'V-Scale' value to new 'V' GradeSystem code,
            // then validate with zod so a corrupt settings doc can't break
            // the listener.
            const raw = data.settings as Record<string, unknown>;
            const migratedRaw = {
              ...raw,
              defaultGradeSystem:
                raw.defaultGradeSystem === 'V-Scale'
                  ? 'V'
                  : raw.defaultGradeSystem || 'V',
            };
            const parsed = UserSettingsSchema.safeParse(migratedRaw);
            if (parsed.success) {
              setSettings(parsed.data as UserSettings);
            } else {
              console.warn('Invalid UserSettings doc', snapshot.id, parsed.error.flatten());
            }
          }
        }
        setIsLoaded(true);
      })
    );

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [user]);

  // Seed default workouts and exercises for new users
  const seedDefaultData = async (userId: string) => {
    const batch = writeBatch(db);
    SEED_WORKOUTS.forEach(workout => {
      const ref = doc(db, 'users', userId, 'workouts', workout.id);
      batch.set(ref, workout);
    });
    SEED_EXERCISES.forEach(exercise => {
      const ref = doc(db, 'users', userId, 'exercises', exercise.id);
      batch.set(ref, exercise);
    });
    // Also create settings doc
    const settingsRef = doc(db, 'users', userId, 'meta', 'settings');
    batch.set(settingsRef, { activeSessionId: null, settings: { defaultGradeSystem: 'V', startOfWeek: 'Monday', weightUnit: 'kg' } });
    await batch.commit();
  };

  const addWorkout = async (workout: Omit<Workout, 'id'>) => {
    if (!user) return;
    const id = generateId();
    const newWorkout = { ...workout, id };
    await setDoc(doc(db, 'users', user.uid, 'workouts', id), newWorkout);
  };

  const updateWorkout = async (workout: Workout) => {
    if (!user) return;
    await setDoc(doc(db, 'users', user.uid, 'workouts', workout.id), workout);
  };

  const deleteWorkout = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'workouts', id));
  };

  const addExercise = async (exercise: Omit<Exercise, 'id'>) => {
    if (!user) return;
    const id = generateId();
    const newExercise = { ...exercise, id };
    await setDoc(doc(db, 'users', user.uid, 'exercises', id), newExercise);
  };

  const updateExercise = async (exercise: Exercise) => {
    if (!user) return;
    await setDoc(doc(db, 'users', user.uid, 'exercises', exercise.id), exercise);
  };

  const deleteExercise = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'exercises', id));
  };

  const addGoal = async (goal: Omit<Goal, 'id' | 'createdAt' | 'status'>) => {
    if (!user) return;
    const id = generateId();
    const createdAt = new Date().toISOString();
    // Treat the incoming shape loosely while we attach bookkeeping fields
    // and legacy mirrors. Firestore persists plain JSON; the zod schema
    // validates on read.
    const base: Record<string, unknown> = {
      ...(goal as unknown as Record<string, unknown>),
      id,
      createdAt,
      status: 'active',
      achieved: (goal as { achieved?: boolean }).achieved ?? false,
    };
    // Populate legacy mirror fields on grade/strength goals so pre-union
    // consumers (e.g. SessionTracker's auto-completion) keep working.
    if (base.type === 'grade') {
      base.title = base.title ?? `Send ${String(base.targetGrade ?? '')}`.trim();
      if (!base.target && typeof base.targetGrade === 'string') {
        base.target = { type: 'grade', grade: base.targetGrade, style: 'send' };
      }
    } else if (base.type === 'strength') {
      base.title = base.title ?? (base.customLabel as string | undefined) ?? 'Strength goal';
    } else if (base.type === 'volume') {
      base.title = base.title ?? `${base.targetCount} ${base.unit} / ${base.window}`;
    } else if (base.type === 'project') {
      base.title = base.title ?? `Project: ${base.routeName}`;
    } else if (base.type === 'comp') {
      base.title = base.title ?? String(base.compName);
    } else if (base.type === 'rehab') {
      base.title = base.title ?? `Rehab: ${base.injury}`;
    }
    const cleanGoal = JSON.parse(JSON.stringify(base));
    await setDoc(doc(db, 'users', user.uid, 'goals', id), cleanGoal);
  };

  const updateGoal = async (goal: Goal) => {
    if (!user) return;
    // Remove undefined values for Firestore
    const cleanGoal = JSON.parse(JSON.stringify(goal));
    await setDoc(doc(db, 'users', user.uid, 'goals', goal.id), cleanGoal);
  };

  const completeGoal = async (id: string) => {
    if (!user) return;
    const goal = goals.find(g => g.id === id);
    if (goal) {
      await setDoc(doc(db, 'users', user.uid, 'goals', id), {
        ...goal,
        achieved: true,
        status: 'completed',
        completedAt: new Date().toISOString()
      });
    }
  };

  const archiveGoal = async (id: string) => {
    if (!user) return;
    const goal = goals.find(g => g.id === id);
    if (goal) {
      await setDoc(doc(db, 'users', user.uid, 'goals', id), {
        ...goal,
        status: 'archived'
      });
    }
  };

  const deleteGoal = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'goals', id));
  };

  const scheduleWorkout = async (date: string, workoutId: string) => {
    if (!user) return;
    const id = generateId();
    const newItem: ScheduledWorkout = { id, date, workoutId, completed: false };
    await setDoc(doc(db, 'users', user.uid, 'schedule', id), newItem);
  };

  const removeScheduledWorkout = async (scheduleId: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'schedule', scheduleId));
  };

  const toggleScheduledWorkout = async (scheduleId: string, completed: boolean) => {
    if (!user) return;
    const item = schedule.find(s => s.id === scheduleId);
    if (item) {
      await setDoc(doc(db, 'users', user.uid, 'schedule', scheduleId), { ...item, completed });
    }
  };

  const copyWeekToNext = async (startDateStr: string) => {
    if (!user) return;
    const startDate = new Date(startDateStr);
    const sourceWeekDates: string[] = [];
    
    // Get all 7 days of source week
    for(let i=0; i<7; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        sourceWeekDates.push(formatDate(d));
    }

    // Find all items in this week
    const itemsToCopy = schedule.filter(s => sourceWeekDates.includes(s.date));
    
    // Create new items shifted by 7 days
    const batch = writeBatch(db);
    itemsToCopy.forEach(item => {
        const d = new Date(item.date);
        d.setDate(d.getDate() + 7);
        const id = generateId();
        const newItem = {
            id,
            date: formatDate(d),
            workoutId: item.workoutId,
            completed: false
        };
        batch.set(doc(db, 'users', user.uid, 'schedule', id), newItem);
    });
    await batch.commit();
  };

  const startSession = async (workoutId: string | null, readiness?: Readiness): Promise<string> => {
    if (!user) return '';
    const id = generateId();
    const effectiveReadiness =
      readiness
      ?? (settings.todayReadiness && settings.todayReadiness.date === formatDate(new Date())
            ? settings.todayReadiness.readiness
            : undefined);
    const newSession: SessionLog = {
      id,
      workoutId,
      date: new Date().toISOString(),
      startTime: Date.now(),
      durationMinutes: 0,
      rpe: 5,
      notes: '',
      skinCondition: 'Good',
      sleepQuality: 'Good',
      climbs: [],
      ...(effectiveReadiness ? { readiness: effectiveReadiness } : {})
    };
    await setDoc(doc(db, 'users', user.uid, 'sessions', id), newSession);
    await setDoc(doc(db, 'users', user.uid, 'meta', 'settings'), { 
      activeSessionId: id,
      settings 
    }, { merge: true });
    return id;
  };

  const updateSession = async (id: string, updates: Partial<SessionLog>) => {
    if (!user) return;
    const session = sessions.find(s => s.id === id);
    if (session) {
      await setDoc(doc(db, 'users', user.uid, 'sessions', id), { ...session, ...updates });
    }
  };

  const endSession = async (id: string) => {
    if (!user) return;
    const session = sessions.find(s => s.id === id);
    if (session) {
      const endTime = Date.now();
      const durationMinutes = Math.round((endTime - session.startTime) / 60000);
      await setDoc(doc(db, 'users', user.uid, 'sessions', id), { 
        ...session, 
        endTime, 
        durationMinutes 
      });
      await setDoc(doc(db, 'users', user.uid, 'meta', 'settings'), { 
        activeSessionId: null,
        settings 
      }, { merge: true });
      
      // Mark scheduled workout as complete if applicable
      if (session.workoutId) {
        const todayStr = formatDate(new Date());
        const todaySchedule = schedule.find(s => 
          !s.completed && s.date === todayStr && s.workoutId === session.workoutId
        );
        if (todaySchedule) {
          await setDoc(doc(db, 'users', user.uid, 'schedule', todaySchedule.id), {
            ...todaySchedule,
            completed: true
          });
        }
      }
    }
  };

  const deleteSession = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'sessions', id));
    if (activeSessionId === id) {
      await setDoc(doc(db, 'users', user.uid, 'meta', 'settings'), { 
        activeSessionId: null,
        settings 
      }, { merge: true });
    }
  };

  const setTodayReadiness = async (readiness: Readiness) => {
    if (!user) return;
    const next: UserSettings = {
      ...settings,
      todayReadiness: { date: formatDate(new Date()), readiness }
    };
    setSettings(next);
    await setDoc(
      doc(db, 'users', user.uid, 'meta', 'settings'),
      { settings: next },
      { merge: true }
    );
  };

  const updateSettings = async (updates: Partial<UserSettings>) => {
    if (!user) return;
    const next = { ...settings, ...updates };
    setSettings(next);
    await setDoc(
      doc(db, 'users', user.uid, 'meta', 'settings'),
      { settings: next },
      { merge: true }
    );
  };

  const applyTrainingPlan = async (planId: string, startDate: string) => {
    if (!user) return;
    const plan = SEED_TRAINING_PLANS.find((p) => p.id === planId);
    if (!plan) return;

    const { newWorkouts, newScheduleEntries } = buildPlanApplication(
      plan,
      startDate,
      workouts,
      generateId
    );

    const batch = writeBatch(db);
    newWorkouts.forEach((w) => {
      batch.set(doc(db, 'users', user.uid, 'workouts', w.id), w);
    });
    newScheduleEntries.forEach((s) => {
      batch.set(doc(db, 'users', user.uid, 'schedule', s.id), s);
    });
    await batch.commit();

    await updateSettings({ activePlanId: planId });
  };

  const resetData = async () => {
    if (!user) return;
    // Delete all user data and reseed
    const batch = writeBatch(db);
    workouts.forEach(w => batch.delete(doc(db, 'users', user.uid, 'workouts', w.id)));
    exercises.forEach(e => batch.delete(doc(db, 'users', user.uid, 'exercises', e.id)));
    schedule.forEach(s => batch.delete(doc(db, 'users', user.uid, 'schedule', s.id)));
    sessions.forEach(s => batch.delete(doc(db, 'users', user.uid, 'sessions', s.id)));
    await batch.commit();
    await seedDefaultData(user.uid);
  };

  return (
    <StoreContext.Provider value={{
      workouts,
      exercises,
      schedule,
      sessions,
      goals,
      settings,
      activeSessionId,
      addWorkout,
      updateWorkout,
      deleteWorkout,
      addExercise,
      updateExercise,
      deleteExercise,
      addGoal,
      updateGoal,
      completeGoal,
      archiveGoal,
      deleteGoal,
      scheduleWorkout,
      removeScheduledWorkout,
      toggleScheduledWorkout,
      copyWeekToNext,
      startSession,
      setTodayReadiness,
      updateSession,
      endSession,
      deleteSession,
      resetData,
      updateSettings,
      trainingPlans: SEED_TRAINING_PLANS,
      applyTrainingPlan
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};
