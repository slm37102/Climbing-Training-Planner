import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { formatDate, compareGrades } from '../utils';
import { Play, Calendar, AlertCircle, CheckCircle, Clock, Trash2, Edit2, X, Save, Check, LogOut, Target, ChevronRight, Settings as SettingsIcon, HandMetal } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { SessionLog, WorkoutType, ExerciseLog, Readiness, Workout, RehabGoal } from '../types';
import { PulleyPopModal } from '../components/PulleyPopModal';
import { GoalCard } from '../components/goals/GoalCard';
import { DeloadBanner } from '../components/DeloadBanner';
import { computeDailyLoads, shouldShowDeloadBanner } from '../utils/load';
import { convertGrade, gradeRank, GradeSystem } from '../utils/grades';
import { computeOverload, inferPillarFromName } from '../utils/progression';
import { ReadinessPill } from '../components/ReadinessPill';
import { Term } from '../components/Term';
import { ReadinessCheckIn } from '../components/ReadinessCheckIn';
import { shouldSuggestAlternative } from '../utils/readiness';

interface DashboardProps {
  onNavigate: (view: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { schedule, workouts, sessions, exercises, goals, activeSessionId, settings, startSession, setTodayReadiness, deleteSession, updateSession, toggleScheduledWorkout, completeGoal, archiveGoal, deleteGoal, addGoal } = useStore();
  const [pulleyModalOpen, setPulleyModalOpen] = useState(false);

  const handleCreateRehabGoal = (phase: RehabGoal['phase']) => {
    addGoal({
      type: 'rehab',
      injury: 'A2 pulley (suspected)',
      phase,
      notes: 'Auto-created from the finger-injury self-check. This is general guidance, not medical advice — see a specialist.',
    });
  };
  const { user, logout } = useAuth();
  const todayStr = formatDate(new Date());
  
  // Edit State
  const [editingSession, setEditingSession] = useState<SessionLog | null>(null);
  const [editForm, setEditForm] = useState({ notes: '', rpe: 5, duration: 0 });

  // Find all scheduled workouts for today
  const todayItems = schedule.filter(s => s.date === todayStr);
  const hasWorkouts = todayItems.length > 0;
  
  // Active goals (show max 3 on dashboard)
  const activeGoals = goals.filter(g => g.status === 'active').slice(0, 3);
  
  // Quick stats
  const recentSessions = sessions
    .filter(s => {
      const d = new Date(s.date);
      const now = new Date();
      return (now.getTime() - d.getTime()) / (1000 * 3600 * 24) < 30; // Show last 30 days for list
    })
    .sort((a, b) => b.startTime - a.startTime); // Newest first

  const userSystem = settings.defaultGradeSystem;

  // Compute best grade this week in user's preferred system.
  let bestGradeThisWeek: string | null = null;
  let bestRank = -1;
  sessions
    .filter(s => (Date.now() - new Date(s.date).getTime()) < 7 * 24 * 3600 * 1000)
    .forEach(session => {
      session.climbs.forEach(c => {
        if (!c.sent) return;
        const sys: GradeSystem = (c.gradeSystem as GradeSystem) || userSystem;
        const r = gradeRank(c.grade, sys);
        if (r > bestRank) {
          bestRank = r;
          bestGradeThisWeek = sys === userSystem ? c.grade : (convertGrade(c.grade, sys, userSystem) || c.grade);
        }
      });
    });

  const last2DaysSessions = sessions.filter(s => {
      const d = new Date(s.date);
      const diff = (Date.now() - d.getTime()) / (1000 * 3600 * 24);
      return diff < 2;
  });
  const shouldRest = last2DaysSessions.length >= 2 || last2DaysSessions.some(s => s.rpe >= 8);

  // Training load / ACWR safety banner (issue #13). Never gated — this is
  // an injury-risk heuristic, not a premium feature.
  const dailyLoads = useMemo(
    () => computeDailyLoads(
      sessions.map(s => ({ rpe: s.rpe, durationMinutes: s.durationMinutes, date: s.date }))
    ),
    [sessions]
  );
  const showDeload = useMemo(
    () => shouldShowDeloadBanner(dailyLoads, todayStr),
    [dailyLoads, todayStr]
  );
  const [loadToast, setLoadToast] = useState<string | null>(null);
  const handleSwapTomorrow = () => {
    setLoadToast("Consider replacing tomorrow's workout with a skill session");
    setTimeout(() => {
      setLoadToast(null);
      onNavigate('PLANNER');
    }, 1200);
  };

  const handleStartWorkout = (workoutId: string) => {
     startSession(workoutId);
     onNavigate('SESSION');
  };

  // Map of exerciseId → most-recent ExerciseLog, used to produce a tiny
  // "Upcoming: +2.5kg on Max Hangs" hint on today's workout card.
  const lastLogByExercise = useMemo(() => {
    const map = new Map<string, ExerciseLog>();
    [...sessions]
      .filter(s => s.exerciseLogs?.length)
      .sort((a, b) => b.startTime - a.startTime)
      .forEach(s => {
        s.exerciseLogs?.forEach(log => {
          if (!map.has(log.exerciseId)) map.set(log.exerciseId, log);
        });
      });
    return map;
  }, [sessions]);

  const overloadHintFor = (workoutId: string): string | null => {
    const w = workouts.find(x => x.id === workoutId);
    if (!w?.exercises?.length) return null;
    for (const we of w.exercises) {
      const prev = lastLogByExercise.get(we.exerciseId);
      if (!prev) continue;
      const ex = exercises.find(e => e.id === we.exerciseId);
      const pillar = ex?.pillar ?? inferPillarFromName(ex?.name ?? '');
      const target = computeOverload(prev, pillar);
      if (target.load != null && prev.addedWeight != null) {
        const diff = parseFloat(target.load) - prev.addedWeight;
        if (Math.abs(diff) >= 0.1) {
          const sign = diff > 0 ? '+' : '';
          return `Upcoming: ${sign}${diff}${settings.weightUnit} on ${ex?.name ?? 'exercise'}`;
        }
      }
      if (target.edge != null && prev.edgeDepth != null && target.edge < prev.edgeDepth) {
        return `Upcoming: −${prev.edgeDepth - target.edge}mm edge on ${ex?.name ?? 'exercise'}`;
      }
      if (target.sets != null && target.sets > prev.completedSets) {
        return `Upcoming: +${target.sets - prev.completedSets} set on ${ex?.name ?? 'exercise'}`;
      }
    }
    return null;
  };

  // --- Readiness gating ---------------------------------------------------
  const todayReadiness =
    settings.todayReadiness && settings.todayReadiness.date === todayStr
      ? settings.todayReadiness.readiness
      : undefined;

  const [showReadinessModal, setShowReadinessModal] = useState(false);
  const [pendingWorkoutId, setPendingWorkoutId] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<{
    workout: Workout | null;
    readiness: Readiness;
    alternatives: Workout[];
  } | null>(null);

  const launchStart = (workoutId: string, readiness: Readiness) => {
    const w = workouts.find(x => x.id === workoutId) || null;
    if (w && shouldSuggestAlternative(readiness.score, w.type, w.name)) {
      const altNames = ['No-Hangs 3×5', 'ARC 30 min'];
      const alternatives = altNames
        .map(n => workouts.find(wk => wk.name.toLowerCase() === n.toLowerCase()))
        .filter((x): x is Workout => !!x);
      setSuggestion({ workout: w, readiness, alternatives });
      return;
    }
    startSession(workoutId, readiness);
    onNavigate('SESSION');
  };

  const handleStartGated = (workoutId: string) => {
    if (todayReadiness) {
      launchStart(workoutId, todayReadiness);
      return;
    }
    setPendingWorkoutId(workoutId);
    setShowReadinessModal(true);
  };

  const handleReadinessSaved = async (readiness: Readiness) => {
    await setTodayReadiness(readiness);
    setShowReadinessModal(false);
    if (pendingWorkoutId) {
      const id = pendingWorkoutId;
      setPendingWorkoutId(null);
      launchStart(id, readiness);
    }
  };

  const handleProceedOriginal = () => {
    if (!suggestion) return;
    const wid = suggestion.workout?.id;
    const r = suggestion.readiness;
    setSuggestion(null);
    if (wid) {
      startSession(wid, r);
      onNavigate('SESSION');
    }
  };

  const handleSwapAlternative = (alt: Workout) => {
    if (!suggestion) return;
    const r = suggestion.readiness;
    setSuggestion(null);
    startSession(alt.id, r);
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('SETTINGS')}
            className="h-10 w-10 bg-stone-800 rounded-full flex items-center justify-center text-stone-300 hover:bg-stone-700 transition-colors"
            title="Settings"
            aria-label="Settings"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>
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
        </div>
      </header>

      {/* Readiness check-in */}
      <div className="flex items-center justify-between">
        <ReadinessPill
          score={todayReadiness?.score}
          onClick={() => setShowReadinessModal(true)}
        />
        {todayReadiness && (
          <span className="text-[10px] text-stone-500">
            checked in today
          </span>
        )}
      </div>

      {/* Training-load deload banner (issue #13) */}
      {showDeload && (
        <DeloadBanner
          daily={dailyLoads}
          onDate={todayStr}
          onSwapTomorrow={handleSwapTomorrow}
        />
      )}
      {loadToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-stone-900 border border-amber-500 text-amber-200 text-xs px-4 py-2 rounded-full shadow-lg z-50"
        >
          {loadToast}
        </div>
      )}

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
                        {(() => {
                          const hint = overloadHintFor(w.id);
                          return hint ? (
                            <p className="text-amber-400/90 text-[11px] mb-3 -mt-2 flex items-center gap-1">
                              <span className="inline-block w-1 h-1 rounded-full bg-amber-400" />
                              {hint}
                            </p>
                          ) : null;
                        })()}
                        
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
                                onClick={() => handleStartGated(w.id)}
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
              <Button variant="primary" onClick={() => handleStartGated('free')}>
                Start Free Session
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Active Goals Section */}
      {activeGoals.length > 0 && (
        <section>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-500" />
              <h2 className="text-lg font-semibold text-stone-200">Goals</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('PROGRESS')}>
              See All <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
          <div className="space-y-2">
            {activeGoals.map(goal => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onComplete={completeGoal}
                onArchive={archiveGoal}
                onDelete={deleteGoal}
                compact
              />
            ))}
          </div>
        </section>
      )}

      {/* Finger injury self-check entry-point */}
      <section>
        <Button
          variant="outline"
          className="w-full justify-start py-3"
          onClick={() => setPulleyModalOpen(true)}
        >
          <HandMetal className="w-4 h-4 text-amber-500" />
          <span className="flex-1 text-left">Finger injury? Self-check &amp; rehab guide</span>
          <ChevronRight className="w-4 h-4 text-stone-500" />
        </Button>
      </section>

      {/* Quick Stats Grid */}
      <section className="grid grid-cols-2 gap-4">
        <div className="bg-stone-800 p-4 rounded-xl border border-stone-700">
          <div className="text-stone-400 text-xs mb-1 uppercase tracking-wider">Sessions (7d)</div>
          <div className="text-2xl font-bold text-stone-100">{recentSessions.filter(s => (Date.now() - new Date(s.date).getTime()) < 7 * 24 * 3600 * 1000).length}</div>
        </div>
        <div className="bg-stone-800 p-4 rounded-xl border border-stone-700">
          <div className="text-stone-400 text-xs mb-1 uppercase tracking-wider">Top Grade (7d)</div>
          <div className="text-2xl font-bold text-amber-500">{bestGradeThisWeek || '-'}</div>
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
                      <p className="text-stone-500 text-xs">{new Date(session.date).toLocaleDateString()} • {session.durationMinutes}m • <Term id="rpe">RPE</Term> {session.rpe}</p>
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

      {/* Readiness check-in modal */}
      {showReadinessModal && (
        <ReadinessCheckIn
          initial={todayReadiness ? {
            sleep: todayReadiness.sleep,
            skin: todayReadiness.skin,
            energy: todayReadiness.energy,
            stress: todayReadiness.stress,
          } : undefined}
          onSave={handleReadinessSaved}
          onCancel={() => {
            setShowReadinessModal(false);
            setPendingWorkoutId(null);
          }}
        />
      )}

      {/* Low-readiness alternative suggestion */}
      {suggestion && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="bg-stone-900 w-full max-w-sm rounded-xl border border-amber-500/40 p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-amber-300">Low readiness</h3>
              <button onClick={() => setSuggestion(null)} className="text-stone-500" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-stone-300 mb-4">
              Your readiness is <span className="font-semibold text-amber-400">{suggestion.readiness.score}/10</span>.
              Max-intensity work ({suggestion.workout?.name}) has a higher injury risk today.
              Consider swapping to a lower-intensity session.
            </p>
            {suggestion.alternatives.length > 0 ? (
              <div className="space-y-2 mb-4">
                {suggestion.alternatives.map(alt => (
                  <button
                    key={alt.id}
                    onClick={() => handleSwapAlternative(alt)}
                    className="w-full text-left p-3 rounded-lg border border-stone-700 hover:border-amber-500/50 bg-stone-800/60 transition-colors"
                  >
                    <div className="text-sm text-stone-100 font-medium">Swap to: {alt.name}</div>
                    <div className="text-xs text-stone-400 mt-0.5">{alt.durationMinutes}m · {alt.type}</div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-500 italic mb-4">
                Try a lighter option like "No-Hangs 3×5" or "<Term id="arc">ARC</Term> 30 min".
              </p>
            )}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setSuggestion(null)}>
                Cancel
              </Button>
              <Button variant="secondary" className="flex-1" onClick={handleProceedOriginal}>
                Proceed anyway
              </Button>
            </div>
          </div>
        </div>
      )}

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
                       <label className="text-xs text-stone-400 block mb-1"><Term id="rpe">RPE</Term> (1-10)</label>
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

      <PulleyPopModal
        open={pulleyModalOpen}
        onClose={() => setPulleyModalOpen(false)}
        onCreateRehabGoal={handleCreateRehabGoal}
      />
    </div>
  );
};
