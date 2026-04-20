import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

// --- Mocks -----------------------------------------------------------------

vi.mock('../context/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: () => ({
    user: {
      uid: 'u1',
      displayName: 'Test',
      metadata: { creationTime: new Date().toISOString() },
    },
    loading: false,
    signInWithEmail: vi.fn(),
    signUpWithEmail: vi.fn(),
    signInWithGoogle: vi.fn(),
    logout: vi.fn(),
  }),
}));

const storeStub = {
  // Data
  schedule: [],
  workouts: [],
  sessions: [],
  exercises: [],
  goals: [],
  trainingPlans: [],
  activeSessionId: null,
  settings: {
    defaultGradeSystem: 'V',
    startOfWeek: 'Monday',
    weightUnit: 'kg',
    onboardingComplete: true,
  },
  // Actions (no-op stubs)
  addWorkout: vi.fn(),
  updateWorkout: vi.fn(),
  deleteWorkout: vi.fn(),
  addExercise: vi.fn(),
  updateExercise: vi.fn(),
  deleteExercise: vi.fn(),
  scheduleWorkout: vi.fn(),
  removeScheduledWorkout: vi.fn(),
  toggleScheduledWorkout: vi.fn(),
  copyWeekToNext: vi.fn(),
  startSession: vi.fn(),
  updateSession: vi.fn(),
  endSession: vi.fn(),
  deleteSession: vi.fn(),
  completeGoal: vi.fn(),
  archiveGoal: vi.fn(),
  deleteGoal: vi.fn(),
  updateSettings: vi.fn().mockResolvedValue(undefined),
  setTodayReadiness: vi.fn(),
  applyTrainingPlan: vi.fn(),
};

vi.mock('../context/StoreContext', () => ({
  StoreProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useStore: () => storeStub,
}));

// Stub page components so the test focuses on routing, not page internals.
vi.mock('../pages/Dashboard', () => ({
  Dashboard: () => <div data-testid="page-dashboard">Dashboard Page</div>,
}));
vi.mock('../pages/Planner', () => ({
  Planner: () => <div data-testid="page-planner">Planner Page</div>,
}));
vi.mock('../pages/WorkoutLibrary', () => ({
  WorkoutLibrary: () => <div data-testid="page-library">Library Page</div>,
}));
vi.mock('../pages/Progress', () => ({
  Progress: () => <div data-testid="page-progress">Progress Page</div>,
}));
vi.mock('../pages/SessionTracker', () => ({
  SessionTracker: () => <div data-testid="page-session">Session Page</div>,
}));
vi.mock('../pages/Settings', () => ({
  Settings: () => <div data-testid="page-settings">Settings Page</div>,
}));
vi.mock('../pages/HangboardPicker', () => ({
  HangboardPicker: () => <div data-testid="page-hangboards">Hangboards Page</div>,
}));
vi.mock('../pages/Login', () => ({
  Login: () => <div data-testid="page-login">Login Page</div>,
}));
vi.mock('../pages/Onboarding', () => ({
  Onboarding: () => <div data-testid="page-onboarding">Onboarding</div>,
}));

import { AppContent } from '../App';

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <AppContent />
    </MemoryRouter>
  );

describe('routing', () => {
  it('renders Dashboard at /', async () => {
    renderAt('/');
    await waitFor(() =>
      expect(screen.getByTestId('page-dashboard')).toBeInTheDocument()
    );
  });

  it('renders Planner at /planner', async () => {
    renderAt('/planner');
    await waitFor(() =>
      expect(screen.getByTestId('page-planner')).toBeInTheDocument()
    );
  });

  it('renders WorkoutLibrary at /library', async () => {
    renderAt('/library');
    await waitFor(() =>
      expect(screen.getByTestId('page-library')).toBeInTheDocument()
    );
  });

  it('renders Progress at /progress', async () => {
    renderAt('/progress');
    await waitFor(() =>
      expect(screen.getByTestId('page-progress')).toBeInTheDocument()
    );
  });

  it('renders SessionTracker at /session', async () => {
    renderAt('/session');
    await waitFor(() =>
      expect(screen.getByTestId('page-session')).toBeInTheDocument()
    );
  });

  it('renders HangboardPicker at /hangboards', async () => {
    renderAt('/hangboards');
    await waitFor(() =>
      expect(screen.getByTestId('page-hangboards')).toBeInTheDocument()
    );
  });

  it('renders Settings at /settings', async () => {
    renderAt('/settings');
    await waitFor(() =>
      expect(screen.getByTestId('page-settings')).toBeInTheDocument()
    );
  });

  it('redirects unknown paths back to Dashboard', async () => {
    renderAt('/this-does-not-exist');
    await waitFor(() =>
      expect(screen.getByTestId('page-dashboard')).toBeInTheDocument()
    );
  });

  it('navigates to /planner when the Plan nav link is clicked', async () => {
    const user = userEvent.setup();
    renderAt('/');
    await waitFor(() =>
      expect(screen.getByTestId('page-dashboard')).toBeInTheDocument()
    );
    // The bottom nav links are rendered from Layout; "Plan" is the label.
    const planLink = screen.getByRole('link', { name: /plan/i });
    await user.click(planLink);
    await waitFor(() =>
      expect(screen.getByTestId('page-planner')).toBeInTheDocument()
    );
  });
});
