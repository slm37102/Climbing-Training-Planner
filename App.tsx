import React, { useState, useMemo, Suspense, lazy } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { StoreProvider, useStore } from './context/StoreContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Onboarding, OnboardingAnswers } from './pages/Onboarding';
import { LoadingFallback } from './components/LoadingFallback';
import { ErrorBoundary } from './components/ErrorBoundary';
import { InstallPrompt } from './components/InstallPrompt';
import { UpdateToast } from './components/UpdateToast';
import { pickPlanForPersona, nextMondayISO } from './utils/onboarding';

const Planner = lazy(() =>
  import('./pages/Planner').then((m) => ({ default: m.Planner }))
);
const WorkoutLibrary = lazy(() =>
  import('./pages/WorkoutLibrary').then((m) => ({ default: m.WorkoutLibrary }))
);
const SessionTracker = lazy(() =>
  import('./pages/SessionTracker').then((m) => ({ default: m.SessionTracker }))
);
const Progress = lazy(() =>
  import('./pages/Progress').then((m) => ({ default: m.Progress }))
);
const Settings = lazy(() =>
  import('./pages/Settings').then((m) => ({ default: m.Settings }))
);
const HangboardPicker = lazy(() =>
  import('./pages/HangboardPicker').then((m) => ({ default: m.HangboardPicker }))
);
const Projects = lazy(() =>
  import('./pages/Projects').then((m) => ({ default: m.Projects }))
);

const SEED_WORKOUT_IDS = new Set(['w1', 'w2', 'w3', 'w4']);

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <>{children}</>;
};

const LoginRoute: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (user) return <Navigate to="/" replace />;
  return <Login />;
};

// Dashboard wrapper: translates legacy onNavigate(view) calls into router navigation.
const VIEW_TO_PATH: Record<string, string> = {
  DASHBOARD: '/',
  PLANNER: '/planner',
  WORKOUTS: '/library',
  SESSION: '/session',
  PROGRESS: '/progress',
  HANGBOARD_PICKER: '/hangboards',
  SETTINGS: '/settings',
};

const DashboardRoute: React.FC = () => {
  const navigate = useNavigate();
  return <Dashboard onNavigate={(view) => navigate(VIEW_TO_PATH[view] ?? '/')} />;
};

const WorkoutLibraryRoute: React.FC = () => {
  return <WorkoutLibrary />;
};

const SessionTrackerRoute: React.FC = () => {
  const navigate = useNavigate();
  return <SessionTracker onComplete={() => navigate('/')} />;
};

const HangboardPickerRoute: React.FC = () => {
  return <HangboardPicker />;
};

const SettingsRoute: React.FC = () => {
  const navigate = useNavigate();
  return <Settings onBack={() => navigate('/')} />;
};

const ProtectedShell: React.FC = () => {
  const { user } = useAuth();
  const {
    settings,
    updateSettings,
    applyTrainingPlan,
    trainingPlans,
    workouts,
    sessions,
  } = useStore();
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);

  const shouldShowOnboarding = useMemo(() => {
    if (!user) return false;
    if (onboardingDismissed) return false;
    if (settings.onboardingComplete === true) return false;

    const nonSeedWorkouts = workouts.filter((w) => !SEED_WORKOUT_IDS.has(w.id));
    const hasRealData = nonSeedWorkouts.length > 0 || sessions.length > 0;
    if (hasRealData) return false;

    if (settings.onboardingComplete === undefined) {
      const creationTime = user.metadata?.creationTime;
      if (!creationTime) return false;
      const createdMs = new Date(creationTime).getTime();
      if (Number.isNaN(createdMs)) return false;
      const ageMs = Date.now() - createdMs;
      if (ageMs > 48 * 60 * 60 * 1000) return false;
    }
    return true;
  }, [user, onboardingDismissed, settings.onboardingComplete, workouts, sessions]);

  React.useEffect(() => {
    if (!user) return;
    if (settings.onboardingComplete === true) return;
    const nonSeedWorkouts = workouts.filter((w) => !SEED_WORKOUT_IDS.has(w.id));
    const hasRealData = nonSeedWorkouts.length > 0 || sessions.length > 0;
    if (hasRealData) {
      updateSettings({ onboardingComplete: true }).catch(() => {});
    }
  }, [user, settings.onboardingComplete, workouts, sessions, updateSettings]);

  const handleOnboardingComplete = async (answers: OnboardingAnswers | null) => {
    setOnboardingDismissed(true);
    try {
      if (answers === null) {
        await updateSettings({ onboardingComplete: true });
        return;
      }
      await updateSettings({
        onboardingComplete: true,
        defaultGradeSystem: answers.defaultGradeSystem,
        profile: answers.profile,
      });
      if (answers.profile.primaryGoal) {
        const plan = pickPlanForPersona(answers.profile, trainingPlans);
        if (plan) {
          await applyTrainingPlan(plan.id, nextMondayISO(new Date()));
        }
      }
    } catch (e) {
      console.error('Onboarding save failed', e);
    }
  };

  if (shouldShowOnboarding && user) {
    return (
      <Onboarding
        onComplete={handleOnboardingComplete}
        initialDisplayName={user.displayName ?? undefined}
      />
    );
  }

  return (
    <Layout>
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<DashboardRoute />} />
            <Route path="/planner" element={<Planner />} />
            <Route path="/library" element={<WorkoutLibraryRoute />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/session" element={<SessionTrackerRoute />} />
            <Route path="/settings" element={<SettingsRoute />} />
            <Route path="/hangboards" element={<HangboardPickerRoute />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </Layout>
  );
};

const AppContent: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginRoute />} />
      <Route
        path="/*"
        element={
          <RequireAuth>
            <ProtectedShell />
          </RequireAuth>
        }
      />
    </Routes>
  );
};

export { AppContent };

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <BrowserRouter>
          <AppContent />
          <InstallPrompt />
          <UpdateToast />
        </BrowserRouter>
      </StoreProvider>
    </AuthProvider>
  );
}
