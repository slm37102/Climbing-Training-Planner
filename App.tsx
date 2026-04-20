import React, { useState, useMemo } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Planner } from './pages/Planner';
import { WorkoutLibrary } from './pages/WorkoutLibrary';
import { SessionTracker } from './pages/SessionTracker';
import { Progress } from './pages/Progress';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { HangboardPicker } from './pages/HangboardPicker';
import { Onboarding, OnboardingAnswers } from './pages/Onboarding';
import { AppView } from './types';
import { pickPlanForPersona, nextMondayISO } from './utils/onboarding';

const SEED_WORKOUT_IDS = new Set(['w1', 'w2', 'w3', 'w4']);

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('DASHBOARD');
  const { user, loading } = useAuth();
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

    // Existing users with real data: silently skip.
    const nonSeedWorkouts = workouts.filter((w) => !SEED_WORKOUT_IDS.has(w.id));
    const hasRealData = nonSeedWorkouts.length > 0 || sessions.length > 0;
    if (hasRealData) return false;

    // For undefined onboardingComplete, only onboard accounts created within 48h.
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

  // Silent-skip side effect: if we have real data but no flag, mark complete once.
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
      // Non-fatal: user can still proceed; settings may retry elsewhere.
      console.error('Onboarding save failed', e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  if (shouldShowOnboarding) {
    return (
      <Onboarding
        onComplete={handleOnboardingComplete}
        initialDisplayName={user.displayName ?? undefined}
      />
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'DASHBOARD':
        return <Dashboard onNavigate={setCurrentView} />;
      case 'PLANNER':
        return <Planner />;
      case 'WORKOUTS':
        return <WorkoutLibrary onNavigate={setCurrentView} />;
      case 'SESSION':
        return <SessionTracker onComplete={() => setCurrentView('DASHBOARD')} />;
      case 'PROGRESS':
        return <Progress />;
      case 'HANGBOARD_PICKER':
        return <HangboardPicker onNavigate={setCurrentView} />;
      case 'SETTINGS':
        return <Settings onBack={() => setCurrentView('DASHBOARD')} />;
      default:
        return <Dashboard onNavigate={setCurrentView} />;
    }
  };

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>
      {renderView()}
    </Layout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <AppContent />
      </StoreProvider>
    </AuthProvider>
  );
}
