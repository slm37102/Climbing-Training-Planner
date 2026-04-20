import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Calendar, Dumbbell, TrendingUp, Play, BookMarked } from 'lucide-react';
import { cn } from '../utils';
import { useStore } from '../context/StoreContext';

interface LayoutProps {
  children: React.ReactNode;
}

interface NavItemProps {
  to: string;
  icon: any;
  label: string;
  end?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon: Icon, label, end }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      cn(
        'flex flex-col items-center justify-center w-full py-2 transition-colors',
        isActive ? 'text-amber-500' : 'text-stone-500 hover:text-stone-300'
      )
    }
  >
    {({ isActive }) => (
      <>
        <Icon className={cn('w-6 h-6 mb-1', isActive && 'fill-current/20')} />
        <span className="text-[10px] font-medium">{label}</span>
      </>
    )}
  </NavLink>
);

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { activeSessionId } = useStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col max-w-md mx-auto relative shadow-2xl overflow-hidden">

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth pb-0">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-stone-900/95 backdrop-blur border-t border-stone-800 flex justify-around items-end z-50 pb-safe">
          <NavItem to="/" end icon={Home} label="Home" />
          <NavItem to="/planner" icon={Calendar} label="Plan" />

          {/* Center Action Button */}
          <div className="relative -top-5">
              <button
                  type="button"
                  onClick={() => navigate('/session')}
                  aria-label="Session"
                  className={cn(
                      "w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-4 border-stone-900 transition-all active:scale-95",
                      activeSessionId ? "bg-amber-500 animate-pulse" : "bg-amber-500 hover:bg-amber-400"
                  )}
              >
                  <Play className="w-6 h-6 text-stone-900 fill-current ml-1" />
              </button>
          </div>

          <NavItem to="/library" icon={Dumbbell} label="Library" />
          <NavItem to="/projects" icon={BookMarked} label="Projects" />
          <NavItem to="/progress" icon={TrendingUp} label="Stats" />
      </nav>
    </div>
  );
};
