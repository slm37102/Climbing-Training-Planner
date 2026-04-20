import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../AuthContext';
import { UserSettings, Readiness } from '../../types';
import { UserSettingsSchema } from '../../schemas';
import { formatDate } from '../../utils';

interface SettingsStoreValue {
  settings: UserSettings;
  activeSessionId: string | null;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  setTodayReadiness: (readiness: Readiness) => Promise<void>;
  setActiveSessionId: (id: string | null) => Promise<void>;
}

const DEFAULT_SETTINGS: UserSettings = {
  defaultGradeSystem: 'V',
  startOfWeek: 'Monday',
  weightUnit: 'kg',
};

const SettingsStoreContext = createContext<SettingsStoreValue | undefined>(undefined);

export const SettingsStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [activeSessionId, setActiveSessionIdState] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setSettings(DEFAULT_SETTINGS);
      setActiveSessionIdState(null);
      return;
    }
    const settingsRef = doc(db, 'users', user.uid, 'meta', 'settings');
    const unsub = onSnapshot(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.activeSessionId !== undefined) {
          setActiveSessionIdState(data.activeSessionId);
        }
        if (data.settings) {
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
    });
    return () => unsub();
  }, [user]);

  const updateSettings = useCallback(
    async (updates: Partial<UserSettings>) => {
      if (!user) return;
      const next = { ...settings, ...updates };
      setSettings(next);
      await setDoc(
        doc(db, 'users', user.uid, 'meta', 'settings'),
        { settings: next },
        { merge: true }
      );
    },
    [user, settings]
  );

  const setTodayReadiness = useCallback(
    async (readiness: Readiness) => {
      if (!user) return;
      const next: UserSettings = {
        ...settings,
        todayReadiness: { date: formatDate(new Date()), readiness },
      };
      setSettings(next);
      await setDoc(
        doc(db, 'users', user.uid, 'meta', 'settings'),
        { settings: next },
        { merge: true }
      );
    },
    [user, settings]
  );

  const setActiveSessionId = useCallback(
    async (id: string | null) => {
      if (!user) return;
      await setDoc(
        doc(db, 'users', user.uid, 'meta', 'settings'),
        { activeSessionId: id },
        { merge: true }
      );
    },
    [user]
  );

  return (
    <SettingsStoreContext.Provider
      value={{
        settings,
        activeSessionId,
        updateSettings,
        setTodayReadiness,
        setActiveSessionId,
      }}
    >
      {children}
    </SettingsStoreContext.Provider>
  );
};

export const useSettingsStore = (): SettingsStoreValue => {
  const ctx = useContext(SettingsStoreContext);
  if (!ctx) throw new Error('useSettingsStore must be used within SettingsStoreProvider');
  return ctx;
};
