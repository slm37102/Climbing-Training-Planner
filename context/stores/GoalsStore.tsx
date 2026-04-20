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
import { Goal } from '../../types';
import { GoalSchema, parseDocs } from '../../schemas';
import { generateId } from '../../utils';

interface GoalsStoreValue {
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  updateGoal: (goal: Goal) => Promise<void>;
  completeGoal: (id: string) => Promise<void>;
  archiveGoal: (id: string) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
}

const GoalsStoreContext = createContext<GoalsStoreValue | undefined>(undefined);

export const GoalsStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    if (!user) {
      setGoals([]);
      return;
    }
    const goalsRef = collection(db, 'users', user.uid, 'goals');
    const unsub = onSnapshot(query(goalsRef), (snapshot) => {
      const data = parseDocs(GoalSchema, snapshot.docs, 'Goal') as Goal[];
      setGoals(data);
    });
    return () => unsub();
  }, [user]);

  const addGoal = useCallback(
    async (goal: Omit<Goal, 'id' | 'createdAt' | 'status'>) => {
      if (!user) return;
      const id = generateId();
      const createdAt = new Date().toISOString();
      const base: Record<string, unknown> = {
        ...(goal as unknown as Record<string, unknown>),
        id,
        createdAt,
        status: 'active',
        achieved: (goal as { achieved?: boolean }).achieved ?? false,
      };
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
    },
    [user]
  );

  const updateGoal = useCallback(
    async (goal: Goal) => {
      if (!user) return;
      const cleanGoal = JSON.parse(JSON.stringify(goal));
      await setDoc(doc(db, 'users', user.uid, 'goals', goal.id), cleanGoal);
    },
    [user]
  );

  const completeGoal = useCallback(
    async (id: string) => {
      if (!user) return;
      const goal = goals.find((g) => g.id === id);
      if (goal) {
        await setDoc(doc(db, 'users', user.uid, 'goals', id), {
          ...goal,
          achieved: true,
          status: 'completed',
          completedAt: new Date().toISOString(),
        });
      }
    },
    [user, goals]
  );

  const archiveGoal = useCallback(
    async (id: string) => {
      if (!user) return;
      const goal = goals.find((g) => g.id === id);
      if (goal) {
        await setDoc(doc(db, 'users', user.uid, 'goals', id), {
          ...goal,
          status: 'archived',
        });
      }
    },
    [user, goals]
  );

  const deleteGoal = useCallback(
    async (id: string) => {
      if (!user) return;
      await deleteDoc(doc(db, 'users', user.uid, 'goals', id));
    },
    [user]
  );

  return (
    <GoalsStoreContext.Provider
      value={{ goals, addGoal, updateGoal, completeGoal, archiveGoal, deleteGoal }}
    >
      {children}
    </GoalsStoreContext.Provider>
  );
};

export const useGoalsStore = (): GoalsStoreValue => {
  const ctx = useContext(GoalsStoreContext);
  if (!ctx) throw new Error('useGoalsStore must be used within GoalsStoreProvider');
  return ctx;
};
