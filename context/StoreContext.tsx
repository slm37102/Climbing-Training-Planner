import React, { createContext, useContext, useEffect, useState } from 'react';
import { Workout, ScheduledWorkout, SessionLog, UserSettings, WorkoutType } from '../types';
import { generateId, formatDate } from '../utils';

interface StoreContextType {
  workouts: Workout[];
  schedule: ScheduledWorkout[];
  sessions: SessionLog[];
  settings: UserSettings;
  activeSessionId: string | null;
  
  // Actions
  addWorkout: (workout: Omit<Workout, 'id'>) => void;
  updateWorkout: (workout: Workout) => void;
  deleteWorkout: (id: string) => void;
  
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

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [schedule, setSchedule] = useState<ScheduledWorkout[]>([]);
  const [sessions, setSessions] = useState<SessionLog[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [settings, setSettings] = useState<UserSettings>({
    defaultGradeSystem: 'V-Scale',
    startOfWeek: 'Monday'
  });

  // Load data
  useEffect(() => {
    const loadedWorkouts = localStorage.getItem('sendit_workouts');
    const loadedSchedule = localStorage.getItem('sendit_schedule');
    const loadedSessions = localStorage.getItem('sendit_sessions');
    const loadedActive = localStorage.getItem('sendit_active_session');
    
    if (loadedWorkouts) setWorkouts(JSON.parse(loadedWorkouts));
    else setWorkouts(SEED_WORKOUTS);

    if (loadedSchedule) {
      const parsed = JSON.parse(loadedSchedule);
      // Migration: Ensure IDs exist for legacy data
      const migrated = parsed.map((s: any) => s.id ? s : { ...s, id: generateId() });
      setSchedule(migrated);
    }

    if (loadedSessions) setSessions(JSON.parse(loadedSessions));
    if (loadedActive) setActiveSessionId(JSON.parse(loadedActive));
  }, []);

  // Save data effects
  useEffect(() => localStorage.setItem('sendit_workouts', JSON.stringify(workouts)), [workouts]);
  useEffect(() => localStorage.setItem('sendit_schedule', JSON.stringify(schedule)), [schedule]);
  useEffect(() => localStorage.setItem('sendit_sessions', JSON.stringify(sessions)), [sessions]);
  useEffect(() => localStorage.setItem('sendit_active_session', JSON.stringify(activeSessionId)), [activeSessionId]);

  const addWorkout = (workout: Omit<Workout, 'id'>) => {
    const newWorkout = { ...workout, id: generateId() };
    setWorkouts([...workouts, newWorkout]);
  };

  const updateWorkout = (workout: Workout) => {
    setWorkouts(workouts.map(w => w.id === workout.id ? workout : w));
  };

  const deleteWorkout = (id: string) => {
    setWorkouts(workouts.filter(w => w.id !== id));
  };

  const scheduleWorkout = (date: string, workoutId: string) => {
    // Append new workout, allowing duplicates for multiple sessions per day
    const newItem: ScheduledWorkout = { 
      id: generateId(), 
      date, 
      workoutId, 
      completed: false 
    };
    setSchedule(prev => [...prev, newItem]);
  };

  const removeScheduledWorkout = (scheduleId: string) => {
    setSchedule(schedule.filter(s => s.id !== scheduleId));
  };

  const toggleScheduledWorkout = (scheduleId: string, completed: boolean) => {
    setSchedule(prev => prev.map(s => s.id === scheduleId ? { ...s, completed } : s));
  };

  const copyWeekToNext = (startDateStr: string) => {
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
    const newItems = itemsToCopy.map(item => {
        const d = new Date(item.date);
        d.setDate(d.getDate() + 7);
        return {
            id: generateId(),
            date: formatDate(d),
            workoutId: item.workoutId,
            completed: false
        };
    });

    setSchedule(prev => [...prev, ...newItems]);
  };

  const startSession = (workoutId: string | null): string => {
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
    setSessions(prev => [...prev, newSession]);
    setActiveSessionId(id);
    return id;
  };

  const updateSession = (id: string, updates: Partial<SessionLog>) => {
    setSessions(sessions.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const endSession = (id: string) => {
    const session = sessions.find(s => s.id === id);
    if (session) {
      const endTime = Date.now();
      const durationMinutes = Math.round((endTime - session.startTime) / 60000);
      updateSession(id, { endTime, durationMinutes });
      setActiveSessionId(null);
      
      // Mark scheduled workout as complete if applicable
      if (session.workoutId) {
        const todayStr = formatDate(new Date());
        setSchedule(prev => {
           let found = false;
           return prev.map(s => {
              if (!found && !s.completed && s.date === todayStr && s.workoutId === session.workoutId) {
                  found = true;
                  return { ...s, completed: true };
              }
              return s;
           });
        });
      }
    }
  };

  const deleteSession = (id: string) => {
    setSessions(sessions.filter(s => s.id !== id));
    if (activeSessionId === id) setActiveSessionId(null);
  };

  const resetData = () => {
    setWorkouts(SEED_WORKOUTS);
    setSchedule([]);
    setSessions([]);
    setActiveSessionId(null);
    localStorage.clear();
  };

  return (
    <StoreContext.Provider value={{
      workouts,
      schedule,
      sessions,
      settings,
      activeSessionId,
      addWorkout,
      updateWorkout,
      deleteWorkout,
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
