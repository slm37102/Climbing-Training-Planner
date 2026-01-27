import React, { useState } from 'react';
import { StoreProvider } from './context/StoreContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Planner } from './pages/Planner';
import { WorkoutLibrary } from './pages/WorkoutLibrary';
import { SessionTracker } from './pages/SessionTracker';
import { Progress } from './pages/Progress';
import { AppView } from './types';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('DASHBOARD');

  const renderView = () => {
    switch (currentView) {
      case 'DASHBOARD':
        return <Dashboard onNavigate={setCurrentView} />;
      case 'PLANNER':
        return <Planner />;
      case 'WORKOUTS':
        return <WorkoutLibrary />;
      case 'SESSION':
        return <SessionTracker onComplete={() => setCurrentView('DASHBOARD')} />;
      case 'PROGRESS':
        return <Progress />;
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
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
