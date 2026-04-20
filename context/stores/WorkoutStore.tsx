import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../AuthContext';
import {
  Exercise,
  ScheduledWorkout,
  TrainingPlan,
  Workout,
  WorkoutType,
} from '../../types';
import {
  ScheduledWorkoutSchema,
  WorkoutSchema,
  parseDocs,
} from '../../schemas';
import { formatDate, generateId } from '../../utils';
import { EXERCISE_CATALOG } from '../../data/exerciseCatalog';
import { SEED_TRAINING_PLANS, buildPlanApplication } from '../../data/trainingPlans';
import { useSettingsStore } from './SettingsStore';

const SEED_WORKOUTS: Workout[] = [
  {
    id: 'w1',
    name: 'Limit Bouldering',
    type: WorkoutType.BOULDER,
    description: 'Projecting at your limit. Focus on hard moves.',
    durationMinutes: 90,
    steps: ['Warm up (20m)', 'Pyramid up to flash level', 'Projecting: 4-5 problems (45m)', 'Cool down'],
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
      restBetweenSetsSeconds: 180,
    },
  },
  {
    id: 'w3',
    name: 'Volume Day',
    type: WorkoutType.BOULDER,
    description: 'Sub-max climbing to build capacity.',
    durationMinutes: 120,
    steps: ['20 boulders between V2-V4', 'Focus on perfect technique'],
  },
  {
    id: 'w4',
    name: 'Rest Day',
    type: WorkoutType.REST,
    description: 'Active recovery or full rest.',
    durationMinutes: 0,
    steps: ['Stretch', 'Walk', 'Sleep'],
  },
];

const SEED_EXERCISES: Exercise[] = EXERCISE_CATALOG;

export async function seedDefaultData(userId: string): Promise<void> {
  const batch = writeBatch(db);
  SEED_WORKOUTS.forEach((workout) => {
    const ref = doc(db, 'users', userId, 'workouts', workout.id);
    batch.set(ref, workout);
  });
  SEED_EXERCISES.forEach((exercise) => {
    const ref = doc(db, 'users', userId, 'exercises', exercise.id);
    batch.set(ref, exercise);
  });
  const settingsRef = doc(db, 'users', userId, 'meta', 'settings');
  batch.set(settingsRef, {
    activeSessionId: null,
    settings: { defaultGradeSystem: 'V', startOfWeek: 'Monday', weightUnit: 'kg' },
  });
  await batch.commit();
}

interface WorkoutStoreValue {
  workouts: Workout[];
  exercises: Exercise[];
  schedule: ScheduledWorkout[];
  trainingPlans: TrainingPlan[];

  addWorkout: (workout: Omit<Workout, 'id'>) => Promise<void>;
  updateWorkout: (workout: Workout) => Promise<void>;
  deleteWorkout: (id: string) => Promise<void>;

  addExercise: (exercise: Omit<Exercise, 'id'>) => Promise<void>;
  updateExercise: (exercise: Exercise) => Promise<void>;
  deleteExercise: (id: string) => Promise<void>;

  scheduleWorkout: (date: string, workoutId: string) => Promise<void>;
  removeScheduledWorkout: (scheduleId: string) => Promise<void>;
  toggleScheduledWorkout: (scheduleId: string, completed: boolean) => Promise<void>;
  copyWeekToNext: (startDateStr: string) => Promise<void>;

  applyTrainingPlan: (planId: string, startDate: string) => Promise<void>;
}

const WorkoutStoreContext = createContext<WorkoutStoreValue | undefined>(undefined);

export const WorkoutStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { updateSettings } = useSettingsStore();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [schedule, setSchedule] = useState<ScheduledWorkout[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!user) {
      setWorkouts([]);
      setExercises([]);
      setSchedule([]);
      setIsLoaded(false);
      return;
    }

    const userId = user.uid;
    const unsubscribers: (() => void)[] = [];

    const workoutsRef = collection(db, 'users', userId, 'workouts');
    unsubscribers.push(
      onSnapshot(query(workoutsRef), (snapshot) => {
        if (snapshot.empty && !isLoaded) {
          seedDefaultData(userId);
        } else {
          const data = parseDocs(WorkoutSchema, snapshot.docs, 'Workout') as Workout[];
          setWorkouts(data);
        }
        setIsLoaded(true);
      })
    );

    const exercisesRef = collection(db, 'users', userId, 'exercises');
    unsubscribers.push(
      onSnapshot(query(exercisesRef), (snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Exercise));
        setExercises(data);
      })
    );

    const scheduleRef = collection(db, 'users', userId, 'schedule');
    unsubscribers.push(
      onSnapshot(query(scheduleRef), (snapshot) => {
        const data = parseDocs(
          ScheduledWorkoutSchema,
          snapshot.docs,
          'ScheduledWorkout'
        ) as ScheduledWorkout[];
        setSchedule(data);
      })
    );

    return () => {
      unsubscribers.forEach((u) => u());
    };
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const addWorkout = useCallback(
    async (workout: Omit<Workout, 'id'>) => {
      if (!user) return;
      const id = generateId();
      const newWorkout = { ...workout, id };
      await setDoc(doc(db, 'users', user.uid, 'workouts', id), newWorkout);
    },
    [user]
  );

  const updateWorkout = useCallback(
    async (workout: Workout) => {
      if (!user) return;
      await setDoc(doc(db, 'users', user.uid, 'workouts', workout.id), workout);
    },
    [user]
  );

  const deleteWorkout = useCallback(
    async (id: string) => {
      if (!user) return;
      await deleteDoc(doc(db, 'users', user.uid, 'workouts', id));
    },
    [user]
  );

  const addExercise = useCallback(
    async (exercise: Omit<Exercise, 'id'>) => {
      if (!user) return;
      const id = generateId();
      const newExercise = { ...exercise, id };
      await setDoc(doc(db, 'users', user.uid, 'exercises', id), newExercise);
    },
    [user]
  );

  const updateExercise = useCallback(
    async (exercise: Exercise) => {
      if (!user) return;
      await setDoc(doc(db, 'users', user.uid, 'exercises', exercise.id), exercise);
    },
    [user]
  );

  const deleteExercise = useCallback(
    async (id: string) => {
      if (!user) return;
      await deleteDoc(doc(db, 'users', user.uid, 'exercises', id));
    },
    [user]
  );

  const scheduleWorkout = useCallback(
    async (date: string, workoutId: string) => {
      if (!user) return;
      const id = generateId();
      const newItem: ScheduledWorkout = { id, date, workoutId, completed: false };
      await setDoc(doc(db, 'users', user.uid, 'schedule', id), newItem);
    },
    [user]
  );

  const removeScheduledWorkout = useCallback(
    async (scheduleId: string) => {
      if (!user) return;
      await deleteDoc(doc(db, 'users', user.uid, 'schedule', scheduleId));
    },
    [user]
  );

  const toggleScheduledWorkout = useCallback(
    async (scheduleId: string, completed: boolean) => {
      if (!user) return;
      const item = schedule.find((s) => s.id === scheduleId);
      if (item) {
        await setDoc(doc(db, 'users', user.uid, 'schedule', scheduleId), {
          ...item,
          completed,
        });
      }
    },
    [user, schedule]
  );

  const copyWeekToNext = useCallback(
    async (startDateStr: string) => {
      if (!user) return;
      const startDate = new Date(startDateStr);
      const sourceWeekDates: string[] = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        sourceWeekDates.push(formatDate(d));
      }
      const itemsToCopy = schedule.filter((s) => sourceWeekDates.includes(s.date));
      const batch = writeBatch(db);
      itemsToCopy.forEach((item) => {
        const d = new Date(item.date);
        d.setDate(d.getDate() + 7);
        const id = generateId();
        const newItem = {
          id,
          date: formatDate(d),
          workoutId: item.workoutId,
          completed: false,
        };
        batch.set(doc(db, 'users', user.uid, 'schedule', id), newItem);
      });
      await batch.commit();
    },
    [user, schedule]
  );

  const applyTrainingPlan = useCallback(
    async (planId: string, startDate: string) => {
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
    },
    [user, workouts, updateSettings]
  );

  return (
    <WorkoutStoreContext.Provider
      value={{
        workouts,
        exercises,
        schedule,
        trainingPlans: SEED_TRAINING_PLANS,
        addWorkout,
        updateWorkout,
        deleteWorkout,
        addExercise,
        updateExercise,
        deleteExercise,
        scheduleWorkout,
        removeScheduledWorkout,
        toggleScheduledWorkout,
        copyWeekToNext,
        applyTrainingPlan,
      }}
    >
      {children}
    </WorkoutStoreContext.Provider>
  );
};

export const useWorkoutStore = (): WorkoutStoreValue => {
  const ctx = useContext(WorkoutStoreContext);
  if (!ctx) throw new Error('useWorkoutStore must be used within WorkoutStoreProvider');
  return ctx;
};
