import React, { useCallback, useMemo } from 'react';
import { doc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import {
  SettingsStoreProvider,
  useSettingsStore,
  WorkoutStoreProvider,
  useWorkoutStore,
  GoalsStoreProvider,
  useGoalsStore,
  ProjectsStoreProvider,
  useProjectsStore,
  SessionStoreProvider,
  useSessionStore,
  seedDefaultData,
} from './stores';

/**
 * StoreProvider composes the domain sub-stores so the rest of the app can
 * continue to consume a single `useStore()` hook. Each sub-store owns its
 * own Firestore subscriptions and actions; this file only glues them together
 * and exposes a few cross-cutting facade actions (e.g. `resetData`).
 *
 * Nesting order matters: inner stores call outer stores' hooks.
 *   Settings -> Workout -> Goals -> Projects -> Session
 */
export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SettingsStoreProvider>
      <WorkoutStoreProvider>
        <GoalsStoreProvider>
          <ProjectsStoreProvider>
            <SessionStoreProvider>{children}</SessionStoreProvider>
          </ProjectsStoreProvider>
        </GoalsStoreProvider>
      </WorkoutStoreProvider>
    </SettingsStoreProvider>
  );
};

export const useStore = () => {
  const { user } = useAuth();
  const settings = useSettingsStore();
  const workout = useWorkoutStore();
  const goals = useGoalsStore();
  const projects = useProjectsStore();
  const session = useSessionStore();

  const resetData = useCallback(async () => {
    if (!user) return;
    const batch = writeBatch(db);
    workout.workouts.forEach((w) =>
      batch.delete(doc(db, 'users', user.uid, 'workouts', w.id))
    );
    workout.exercises.forEach((e) =>
      batch.delete(doc(db, 'users', user.uid, 'exercises', e.id))
    );
    workout.schedule.forEach((s) =>
      batch.delete(doc(db, 'users', user.uid, 'schedule', s.id))
    );
    session.sessions.forEach((s) =>
      batch.delete(doc(db, 'users', user.uid, 'sessions', s.id))
    );
    await batch.commit();
    await seedDefaultData(user.uid);
  }, [user, workout.workouts, workout.exercises, workout.schedule, session.sessions]);

  return useMemo(
    () => ({
      // Settings
      settings: settings.settings,
      activeSessionId: settings.activeSessionId,
      updateSettings: settings.updateSettings,
      setTodayReadiness: settings.setTodayReadiness,

      // Workouts / schedule / exercises / plans
      workouts: workout.workouts,
      exercises: workout.exercises,
      schedule: workout.schedule,
      trainingPlans: workout.trainingPlans,
      addWorkout: workout.addWorkout,
      updateWorkout: workout.updateWorkout,
      deleteWorkout: workout.deleteWorkout,
      addExercise: workout.addExercise,
      updateExercise: workout.updateExercise,
      deleteExercise: workout.deleteExercise,
      scheduleWorkout: workout.scheduleWorkout,
      removeScheduledWorkout: workout.removeScheduledWorkout,
      toggleScheduledWorkout: workout.toggleScheduledWorkout,
      copyWeekToNext: workout.copyWeekToNext,
      applyTrainingPlan: workout.applyTrainingPlan,

      // Goals
      goals: goals.goals,
      addGoal: goals.addGoal,
      updateGoal: goals.updateGoal,
      completeGoal: goals.completeGoal,
      archiveGoal: goals.archiveGoal,
      deleteGoal: goals.deleteGoal,

      // Projects
      projects: projects.projects,
      addProject: projects.addProject,
      updateProject: projects.updateProject,
      deleteProject: projects.deleteProject,

      // Sessions
      sessions: session.sessions,
      startSession: session.startSession,
      updateSession: session.updateSession,
      endSession: session.endSession,
      deleteSession: session.deleteSession,

      // Facade
      resetData,
    }),
    [settings, workout, goals, projects, session, resetData]
  );
};
