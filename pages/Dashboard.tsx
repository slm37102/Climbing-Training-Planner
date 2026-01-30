import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils';
import { Play, Calendar, AlertCircle, CheckCircle, Clock, Trash2, Edit2, X, Save, Check, LogOut } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { SessionLog, WorkoutType } from '../types';

interface DashboardProps {
  onNavigate: (view: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { schedule, workouts, sessions, activeSessionId, startSession, deleteSession, updateSession, toggleScheduledWorkout } = useStore();
  const { user, logout } = useAuth();
  const todayStr = formatDate(new Date());
  
  // Edit State
  const [editingSession, setEditingSession] = useState<SessionLog | null>(null);
  const [editForm, setEditForm] = useState({ notes: '', rpe: 5, duration: 0 });

  // Find all scheduled workouts for today
  const todayItems = schedule.filter(s => s.date === todayStr);
  const hasWorkouts = todayItems.length > 0;
  
  // Quick stats
  const recentSessions = sessions
    .filter(s => {
      const d = new Date(s.date);
      const now = new Date();
      return (now.getTime() - d.getTime()) / (1000 * 3600 * 24) < 30; // Show last 30 days for list
    })
    .sort((a, b) => b.startTime - a.startTime); // Newest first

  const bestGradeThisWeek = sessions
    .filter(s => (Date.now() - new Date(s.date).getTime()) < 7 * 24 * 3600 * 1000)
    .reduce((best, session) => {
      session.climbs.forEach(c => {
        if (c.sent && c.grade > best) best = c.grade;
      });
      return best;
    }, 'V0');

  const last2DaysSessions = sessions.filter(s => {
      const d = new Date(s.date);
      const diff = (Date.now() - d.getTime()) / (1000 * 3600 * 24);
      return diff < 2;
  });
  const shouldRest = last2DaysSessions.length >= 2 || last2DaysSessions.some(s => s.rpe >= 8);

  const handleStartWorkout = (workoutId: string) => {
     startSession(workoutId);
     onNavigate('SESSION');
  };

  const handleToggleRest = (scheduleId: string, currentState: boolean) => {
    toggleScheduledWorkout(scheduleId, !currentState);
  };

  const handleDelete = (id: string) => {
    if(confirm('Are you sure you want to delete this session log?')) {
      deleteSession(id);
    }
  };

  const startEdit = (session: SessionLog) => {
    setEditingSession(session);
    setEditForm({
      notes: session.notes,
      rpe: session.rpe,
      duration: session.durationMinutes
    });
  };

  const saveEdit = () => {
    if(editingSession) {
      updateSession(editingSession.id, {
        notes: editForm.notes,
        rpe: editForm.rpe,
        durationMinutes: editForm.duration
      });
      setEditingSession(null);
    }
  };

  return (
    <div className="space-y-6 pb-20 relative">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-stone-100">Welcome Back</h1>
          <p className="text-stone-400 text-sm">Let's crush some plastic today.</p>
        </div>
        <button 
          onClick={logout}
          className="h-10 w-10 bg-amber-500 rounded-full flex items-center justify-center text-stone-900 font-bold hover:bg-amber-400 transition-colors group relative"
          title="Logout"
        >
          <span className="group-hover:hidden">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </span>
          <LogOut className="w-5 h-5 hidden group-hover:block" />
        </button>
      </header>

      {/* Recovery Alert */}
      {shouldRest && (
        <div className="bg-orange-900/30 border border-orange-500/30 p-4 rounded-xl flex gap-3 items-start">
          <AlertCircle className="w-5 h-5 text-orange-400 mt-0.5" />
          <div>
            <h3 className="text-orange-200 font-medium text-sm">Recovery Tip</h3>
            <p className="text-orange-200/70 text-xs mt-1">
              You've had high intensity or frequent sessions recently. Consider a rest day or light mobility work today.
            </p>
          </div>
        </div>
      )}

      {/* Today's Plan Card */}
      <section>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold text-stone-200">Today's Plan</h2>
          <Button variant="ghost" size="sm" onClick={() => onNavigate('PLANNER')}>Edit</Button>
        </div>
        
        <div className="bg-stone-800 rounded-xl p-5 border border-stone-700 shadow-lg relative overflow-hidden">
          {activeSessionId ? (
             <div className="flex flex-col items-center justify-center py-4">
               <div className="animate-pulse h-3 w-3 bg-amber-500 rounded-full mb-2"></div>
               <h3 className="text-xl font-bold text-amber-500 mb-1">Session in Progress</h3>
               <p className="text-stone-400 text-sm mb-4">You are currently training.</p>
               <Button onClick={() => onNavigate('SESSION')} className="w-full">
                 Resume Session
               </Button>
             </div>
          ) : hasWorkouts ? (
            <div className="space-y-4">
              {todayItems.map(item => {
                  const w = workouts.find(w => w.id === item.workoutId);
                  if(!w) return null;
                  const isRest = w.type === WorkoutType.REST;
                  
                  return (
                    <div key={item.id} className="border-b border-stone-700 last:border-0 pb-4 last:pb-0">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    {w.name}
                                    {item.completed && <CheckCircle className="text-green-500 w-4 h-4" />}
                                </h3>
                                <p className="text-stone-400 text-xs flex items-center gap-2 mt-1">
                                    <span className="uppercase tracking-wide bg-stone-700 px-1.5 py-0.5 rounded">{w.type}</span>
                                    <span>{w.durationMinutes}m</span>
                                </p>
                            </div>
                        </div>
                        <p className="text-stone-300 text-sm mb-3 line-clamp-1">{w.description}</p>
                        
                        {isRest ? (
                           <Button 
                              variant={item.completed ? "secondary" : "outline"} 
                              className={item.completed ? "bg-green-500/20 text-green-500 w-full" : "w-full"}
                              onClick={() => handleToggleRest(item.id, item.completed)}
                           >
                              {item.completed ? <><Check className="w-4 h-4 mr-1"/> Rested</> : "Mark as Rested"}
                           </Button>
                        ) : (
                          item.completed ? (
                               <Button variant="secondary" size="sm" className="w-full opacity-50 cursor-not-allowed">
                                 Completed
                               </Button>
                          ) : (
                              <Button 
                                className="w-full" 
                                variant="outline"
                                onClick={() => handleStartWorkout(w.id)}
                              >
                                <Play className="w-3 h-3 mr-2 fill-current" />
                                Start This Workout
                              </Button>
                          )
                        )}
                    </div>
                  );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Calendar className="w-10 h-10 text-stone-600 mb-2" />
              <p className="text-stone-400 mb-4">No workout planned for today.</p>
              <Button variant="outline" onClick={() => onNavigate('PLANNER')}>
                Plan Workout
              </Button>
              <div className="my-2 text-xs text-stone-500">- OR -</div>
              <Button variant="primary" onClick={() => handleStartWorkout('free')}>
                Start Free Session
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Quick Stats Grid */}
      <section className="grid grid-cols-2 gap-4">
        <div className="bg-stone-800 p-4 rounded-xl border border-stone-700">
          <div className="text-stone-400 text-xs mb-1 uppercase tracking-wider">Sessions (7d)</div>
          <div className="text-2xl font-bold text-stone-100">{recentSessions.filter(s => (Date.now() - new Date(s.date).getTime()) < 7 * 24 * 3600 * 1000).length}</div>
        </div>
        <div className="bg-stone-800 p-4 rounded-xl border border-stone-700">
          <div className="text-stone-400 text-xs mb-1 uppercase tracking-wider">Top Grade (7d)</div>
          <div className="text-2xl font-bold text-amber-500">{bestGradeThisWeek > 'V0' ? bestGradeThisWeek : '-'}</div>
        </div>
      </section>

      {/* Recent Activity List */}
      <section>
        <h2 className="text-lg font-semibold text-stone-200 mb-3">Recent History</h2>
        <div className="space-y-3">
          {recentSessions.length === 0 && (
            <p className="text-stone-500 text-sm italic">No recent sessions recorded.</p>
          )}
          {recentSessions.slice(0, 5).map(session => {
            const w = workouts.find(w => w.id === session.workoutId);
            return (
              <div key={session.id} className="bg-stone-800/50 p-3 rounded-lg border border-stone-700/50 relative group">
                <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-stone-200 font-medium text-sm">{w?.name || 'Free Session'}</h4>
                      <p className="text-stone-500 text-xs">{new Date(session.date).toLocaleDateString()} • {session.durationMinutes}m • RPE {session.rpe}</p>
                    </div>
                    <div className="flex gap-2">
                       {/* Action Buttons */}
                       <button onClick={() => startEdit(session)} className="p-1.5 text-stone-500 hover:text-stone-300 bg-stone-800/50 rounded">
                          <Edit2 className="w-3.5 h-3.5" />
                       </button>
                       <button onClick={() => handleDelete(session.id)} className="p-1.5 text-stone-500 hover:text-red-400 bg-stone-800/50 rounded">
                          <Trash2 className="w-3.5 h-3.5" />
                       </button>
                    </div>
                </div>
                {session.notes && <p className="text-xs text-stone-400 mt-2 italic">"{session.notes}"</p>}
                
                <div className="flex gap-2 text-xs mt-2">
                   {session.climbs.length > 0 && (
                     <span className="px-2 py-0.5 bg-stone-700/50 rounded text-stone-400">
                       {session.climbs.filter(c => c.sent).length}/{session.climbs.length} sent
                     </span>
                   )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Edit Modal */}
      {editingSession && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
           <div className="bg-stone-900 w-full max-w-sm rounded-xl border border-stone-700 p-4">
               <div className="flex justify-between items-center mb-4">
                   <h3 className="font-bold text-white">Edit Session</h3>
                   <button onClick={() => setEditingSession(null)} className="text-stone-500"><X className="w-5 h-5"/></button>
               </div>
               
               <div className="space-y-4">
                   <div>
                       <label className="text-xs text-stone-400 block mb-1">Duration (min)</label>
                       <input 
                         type="number" 
                         value={editForm.duration} 
                         onChange={e => setEditForm({...editForm, duration: parseInt(e.target.value)})}
                         className="w-full bg-stone-800 border border-stone-600 rounded p-2 text-white"
                       />
                   </div>
                   <div>
                       <label className="text-xs text-stone-400 block mb-1">RPE (1-10)</label>
                       <input 
                         type="number" max={10} min={1}
                         value={editForm.rpe} 
                         onChange={e => setEditForm({...editForm, rpe: parseInt(e.target.value)})}
                         className="w-full bg-stone-800 border border-stone-600 rounded p-2 text-white"
                       />
                   </div>
                   <div>
                       <label className="text-xs text-stone-400 block mb-1">Notes</label>
                       <textarea 
                         value={editForm.notes} 
                         onChange={e => setEditForm({...editForm, notes: e.target.value})}
                         className="w-full bg-stone-800 border border-stone-600 rounded p-2 text-white h-24"
                       />
                   </div>
                   <Button onClick={saveEdit} className="w-full">
                       <Save className="w-4 h-4 mr-2" /> Save Changes
                   </Button>
               </div>
           </div>
        </div>
      )}
    </div>
  );
};
