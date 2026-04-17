import React, { useState } from 'react';
import { StoreProvider } from './context/StoreContext';
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
import { AppView } from './types';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('DASHBOARD');
  const { user, loading } = useAuth();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Show login if not authenticated
  if (!user) {
    return <Login />;
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
