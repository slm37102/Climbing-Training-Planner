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
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../AuthContext';
import { Readiness, SessionLog } from '../../types';
import { SessionLogSchema, parseDocs } from '../../schemas';
import { formatDate, generateId } from '../../utils';
import { useSettingsStore } from './SettingsStore';
import { useWorkoutStore } from './WorkoutStore';

interface SessionStoreValue {
  sessions: SessionLog[];
  startSession: (workoutId: string | null, readiness?: Readiness) => Promise<string>;
  updateSession: (id: string, updates: Partial<SessionLog>) => Promise<void>;
  endSession: (id: string) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
}

const SessionStoreContext = createContext<SessionStoreValue | undefined>(undefined);

export const SessionStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { settings, activeSessionId, setActiveSessionId } = useSettingsStore();
  const { schedule } = useWorkoutStore();
  const [sessions, setSessions] = useState<SessionLog[]>([]);

  useEffect(() => {
    if (!user) {
      setSessions([]);
      return;
    }
    const sessionsRef = collection(db, 'users', user.uid, 'sessions');
    const unsub = onSnapshot(query(sessionsRef), (snapshot) => {
      const data = parseDocs(SessionLogSchema, snapshot.docs, 'SessionLog') as SessionLog[];
      setSessions(data);
    });
    return () => unsub();
  }, [user]);

  const startSession = useCallback(
    async (workoutId: string | null, readiness?: Readiness): Promise<string> => {
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
        ...(effectiveReadiness ? { readiness: effectiveReadiness } : {}),
      };
      await setDoc(doc(db, 'users', user.uid, 'sessions', id), newSession);
      await setActiveSessionId(id);
      return id;
    },
    [user, settings, setActiveSessionId]
  );

  const updateSession = useCallback(
    async (id: string, updates: Partial<SessionLog>) => {
      if (!user) return;
      const session = sessions.find((s) => s.id === id);
      if (session) {
        await setDoc(doc(db, 'users', user.uid, 'sessions', id), { ...session, ...updates });
      }
    },
    [user, sessions]
  );

  const endSession = useCallback(
    async (id: string) => {
      if (!user) return;
      const session = sessions.find((s) => s.id === id);
      if (session) {
        const endTime = Date.now();
        const durationMinutes = Math.round((endTime - session.startTime) / 60000);
        await setDoc(doc(db, 'users', user.uid, 'sessions', id), {
          ...session,
          endTime,
          durationMinutes,
        });
        await setActiveSessionId(null);

        if (session.workoutId) {
          const todayStr = formatDate(new Date());
          const todaySchedule = schedule.find(
            (s) => !s.completed && s.date === todayStr && s.workoutId === session.workoutId
          );
          if (todaySchedule) {
            await setDoc(doc(db, 'users', user.uid, 'schedule', todaySchedule.id), {
              ...todaySchedule,
              completed: true,
            });
          }
        }
      }
    },
    [user, sessions, schedule, setActiveSessionId]
  );

  const deleteSession = useCallback(
    async (id: string) => {
      if (!user) return;
      await deleteDoc(doc(db, 'users', user.uid, 'sessions', id));
      if (activeSessionId === id) {
        await setActiveSessionId(null);
      }
    },
    [user, activeSessionId, setActiveSessionId]
  );

  return (
    <SessionStoreContext.Provider
      value={{ sessions, startSession, updateSession, endSession, deleteSession }}
    >
      {children}
    </SessionStoreContext.Provider>
  );
};

export const useSessionStore = (): SessionStoreValue => {
  const ctx = useContext(SessionStoreContext);
  if (!ctx) throw new Error('useSessionStore must be used within SessionStoreProvider');
  return ctx;
};
