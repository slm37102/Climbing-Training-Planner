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
import { Workout, ScheduledWorkout, SessionLog, UserSettings, WorkoutType, Exercise, ExerciseCategory, Goal } from '../types';
import { generateId, formatDate } from '../utils';

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
  
  startSession: (workoutId: string | null) => string;
  updateSession: (id: string, updates: Partial<SessionLog>) => void;
  endSession: (id: string) => void;
  deleteSession: (id: string) => void;
  
  resetData: () => void;
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

const SEED_EXERCISES: Exercise[] = [
  // Antagonist & Stabilizer
  {
    id: 'e1',
    name: 'Push-ups',
    description: 'Standard push-ups for chest and tricep balance.',
    category: ExerciseCategory.ANTAGONIST,
    difficulty: 'Beginner',
    defaultSets: 3,
    defaultReps: 15
  },
  {
    id: 'e2',
    name: 'Reverse Wrist Curls',
    description: 'Forearm extensor strengthening to prevent elbow issues.',
    category: ExerciseCategory.ANTAGONIST,
    difficulty: 'Beginner',
    defaultSets: 3,
    defaultReps: 20
  },
  {
    id: 'e3',
    name: 'External Rotations',
    description: 'Shoulder stabilizer work with band or light weight.',
    category: ExerciseCategory.ANTAGONIST,
    difficulty: 'Beginner',
    defaultSets: 3,
    defaultReps: 15
  },
  // Core Training
  {
    id: 'e4',
    name: 'Hanging Leg Raises',
    description: 'Hang from bar, raise legs to 90 degrees or higher.',
    category: ExerciseCategory.CORE,
    difficulty: 'Intermediate',
    defaultSets: 3,
    defaultReps: 10
  },
  {
    id: 'e5',
    name: 'Front Lever Progressions',
    description: 'Tuck, advanced tuck, or full front lever holds.',
    category: ExerciseCategory.CORE,
    difficulty: 'Advanced',
    defaultSets: 5,
    defaultDurationSeconds: 10
  },
  {
    id: 'e6',
    name: 'Hollow Body Hold',
    description: 'Gymnastic hold for core tension.',
    category: ExerciseCategory.CORE,
    difficulty: 'Beginner',
    defaultSets: 3,
    defaultDurationSeconds: 30
  },
  // Limit-Strength
  {
    id: 'e7',
    name: 'Max Hangs',
    description: '10 second max weight hangs on 18-20mm edge.',
    category: ExerciseCategory.LIMIT_STRENGTH,
    difficulty: 'Advanced',
    defaultSets: 5,
    defaultDurationSeconds: 10,
    timerConfig: { workSeconds: 10, restSeconds: 0, reps: 1, sets: 5, restBetweenSetsSeconds: 180 }
  },
  {
    id: 'e8',
    name: 'One-Arm Lock-offs',
    description: 'Lock off at 90 degrees, assisted or weighted.',
    category: ExerciseCategory.LIMIT_STRENGTH,
    difficulty: 'Advanced',
    defaultSets: 3,
    defaultReps: 3
  },
  // Power Training
  {
    id: 'e9',
    name: 'Campus Ladders',
    description: '1-2-3 or 1-3-5 campus board sequences.',
    category: ExerciseCategory.POWER,
    difficulty: 'Advanced',
    defaultSets: 5,
    defaultReps: 2
  },
  {
    id: 'e10',
    name: 'Explosive Pull-ups',
    description: 'Pull up fast, hands leave bar at top.',
    category: ExerciseCategory.POWER,
    difficulty: 'Intermediate',
    defaultSets: 4,
    defaultReps: 5
  },
  // Strength/Power-Endurance
  {
    id: 'e11',
    name: 'Repeaters 7/3',
    description: '7 second hang, 3 second rest, 6 reps per set.',
    category: ExerciseCategory.STRENGTH_ENDURANCE,
    difficulty: 'Intermediate',
    defaultSets: 3,
    defaultReps: 6,
    timerConfig: { workSeconds: 7, restSeconds: 3, reps: 6, sets: 3, restBetweenSetsSeconds: 180 }
  },
  {
    id: 'e12',
    name: '4x4s',
    description: '4 boulder problems, 4 times through with minimal rest.',
    category: ExerciseCategory.STRENGTH_ENDURANCE,
    difficulty: 'Intermediate',
    defaultSets: 4,
    defaultReps: 4
  },
  {
    id: 'e13',
    name: 'Linked Boulder Circuit',
    description: 'Chain 3-5 easy boulders without rest.',
    category: ExerciseCategory.STRENGTH_ENDURANCE,
    difficulty: 'Intermediate',
    defaultSets: 3,
    defaultReps: 1
  },
  // Local/Generalized Aerobic
  {
    id: 'e14',
    name: 'ARC Training',
    description: '20-45 minutes of continuous easy climbing.',
    category: ExerciseCategory.AEROBIC,
    difficulty: 'Beginner',
    defaultSets: 1,
    defaultDurationSeconds: 1800
  },
  {
    id: 'e15',
    name: 'Easy Traversing',
    description: 'Traverse walls at low intensity for recovery.',
    category: ExerciseCategory.AEROBIC,
    difficulty: 'Beginner',
    defaultSets: 1,
    defaultDurationSeconds: 1200
  }
];

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [schedule, setSchedule] = useState<ScheduledWorkout[]>([]);
  const [sessions, setSessions] = useState<SessionLog[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [settings, setSettings] = useState<UserSettings>({
    defaultGradeSystem: 'V-Scale',
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
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Workout));
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
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ScheduledWorkout));
        setSchedule(data);
      })
    );

    // Subscribe to sessions
    const sessionsRef = collection(db, 'users', userId, 'sessions');
    unsubscribers.push(
      onSnapshot(query(sessionsRef), (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SessionLog));
        setSessions(data);
      })
    );

    // Subscribe to goals
    const goalsRef = collection(db, 'users', userId, 'goals');
    unsubscribers.push(
      onSnapshot(query(goalsRef), (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal));
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
            setSettings(data.settings);
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
    batch.set(settingsRef, { activeSessionId: null, settings: { defaultGradeSystem: 'V-Scale', startOfWeek: 'Monday', weightUnit: 'kg' } });
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
    const newGoal: Goal = {
      ...goal,
      id,
      createdAt: new Date().toISOString(),
      status: 'active'
    };
    await setDoc(doc(db, 'users', user.uid, 'goals', id), newGoal);
  };

  const updateGoal = async (goal: Goal) => {
    if (!user) return;
    await setDoc(doc(db, 'users', user.uid, 'goals', goal.id), goal);
  };

  const completeGoal = async (id: string) => {
    if (!user) return;
    const goal = goals.find(g => g.id === id);
    if (goal) {
      await setDoc(doc(db, 'users', user.uid, 'goals', id), {
        ...goal,
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

  const startSession = async (workoutId: string | null): Promise<string> => {
    if (!user) return '';
    const id = generateId();
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
      climbs: []
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
      updateSession,
      endSession,
      deleteSession,
      resetData
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
