import React from 'react';
import { Home, Calendar, Dumbbell, TrendingUp, Play } from 'lucide-react';
import { AppView } from '../types';
import { cn } from '../utils';
import { useStore } from '../context/StoreContext';

interface LayoutProps {
  children: React.ReactNode;
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate }) => {
  const { activeSessionId } = useStore();

  const NavItem = ({ view, icon: Icon, label }: { view: AppView; icon: any; label: string }) => (
    <button
      onClick={() => onNavigate(view)}
      className={cn(
        "flex flex-col items-center justify-center w-full py-2 transition-colors",
        currentView === view ? "text-amber-500" : "text-stone-500 hover:text-stone-300"
      )}
    >
      <Icon className={cn("w-6 h-6 mb-1", currentView === view && "fill-current/20")} />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col max-w-md mx-auto relative shadow-2xl overflow-hidden">
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth pb-0">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-stone-900/95 backdrop-blur border-t border-stone-800 flex justify-around items-end z-50 pb-safe">
          <NavItem view="DASHBOARD" icon={Home} label="Home" />
          <NavItem view="PLANNER" icon={Calendar} label="Plan" />
          
          {/* Center Action Button */}
          <div className="relative -top-5">
              <button 
                  onClick={() => onNavigate('SESSION')}
                  className={cn(
                      "w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-4 border-stone-900 transition-all active:scale-95",
                      activeSessionId ? "bg-amber-500 animate-pulse" : "bg-amber-500 hover:bg-amber-400"
                  )}
              >
                  <Play className="w-6 h-6 text-stone-900 fill-current ml-1" />
              </button>
          </div>

          <NavItem view="WORKOUTS" icon={Dumbbell} label="Library" />
          <NavItem view="PROGRESS" icon={TrendingUp} label="Stats" />
      </nav>
    </div>
  );
};
