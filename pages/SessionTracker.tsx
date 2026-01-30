import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Button } from '../components/ui/Button';
import { Play, Pause, Check, RotateCcw, Timer, Layers, ChevronDown, ChevronRight, Dumbbell, TrendingUp, Target } from 'lucide-react';
import { grades, cn, generateId, playAudioCue, initAudioContext } from '../utils';
import { ClimbLog, Workout, WorkoutType, ExerciseLog, Exercise, GradeTarget, StrengthTarget } from '../types';

// State for tracking exercise progress during session
interface ExerciseProgress {
  exerciseId: string;
  completedSets: number;
  completedReps: number;
  addedWeight?: number;
  edgeDepth?: number;
  resistanceBand?: string;
  rpe?: number;
  notes?: string;
  isExpanded: boolean;
}

// Track goals completed during this session
interface GoalAchievement {
  goalId: string;
  title: string;
  type: 'grade' | 'strength';
}

export const SessionTracker: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { activeSessionId, sessions, workouts, exercises, goals, settings, startSession, updateSession, endSession, completeGoal } = useStore();
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Goal achievements during session
  const [achievements, setAchievements] = useState<GoalAchievement[]>([]);
  
  // Standard Rest Timer State
  const [timerMode, setTimerMode] = useState<'none' | 'rest' | 'interval'>('none');
  const [timerTime, setTimerTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [initialTimerValue, setInitialTimerValue] = useState(120);

  // Interval Timer State
  const [intervalPhase, setIntervalPhase] = useState<'Work' | 'Rest' | 'Set Rest' | 'Done'>('Work');
  const [currentRep, setCurrentRep] = useState(1);
  const [totalReps, setTotalReps] = useState(6);
  const [currentSet, setCurrentSet] = useState(1);
  const [totalSets, setTotalSets] = useState(1);
  const [workDuration, setWorkDuration] = useState(7);
  const [restDuration, setRestDuration] = useState(3);
  const [restBetweenSets, setRestBetweenSets] = useState(120);
  
  // Logging state
  const [selectedGrade, setSelectedGrade] = useState('V3');
  const [attempts, setAttempts] = useState(1);
  const [rpe, setRpe] = useState(5);
  const [notes, setNotes] = useState('');

  // Exercise tracking state
  const [exerciseProgress, setExerciseProgress] = useState<ExerciseProgress[]>([]);

  // Active grade goals for auto-detection
  const activeGradeGoals = useMemo(() => 
    goals.filter(g => g.status === 'active' && g.target.type === 'grade'),
    [goals]
  );

  // Find current session object
  const session = sessions.find(s => s.id === activeSessionId);
  const workout = session?.workoutId ? workouts.find(w => w.id === session.workoutId) : null;

  // Get previous session data for progressive overload hints
  const previousSessionLogs = useMemo(() => {
    if (!workout) return new Map<string, ExerciseLog>();
    // Find last session with same workout
    const prevSession = sessions
      .filter(s => s.id !== activeSessionId && s.workoutId === workout.id && s.exerciseLogs?.length)
      .sort((a, b) => b.startTime - a.startTime)[0];
    
    const logsMap = new Map<string, ExerciseLog>();
    prevSession?.exerciseLogs?.forEach(log => {
      logsMap.set(log.exerciseId, log);
    });
    return logsMap;
  }, [sessions, workout, activeSessionId]);

  // Initialize exercise progress when workout loads
  useEffect(() => {
    if (workout?.exercises && exerciseProgress.length === 0) {
      const initial: ExerciseProgress[] = workout.exercises.map(we => {
        const exercise = exercises.find(e => e.id === we.exerciseId);
        const prevLog = previousSessionLogs.get(we.exerciseId);
        return {
          exerciseId: we.exerciseId,
          completedSets: 0,
          completedReps: 0,
          addedWeight: prevLog?.addedWeight,
          edgeDepth: prevLog?.edgeDepth,
          resistanceBand: prevLog?.resistanceBand,
          isExpanded: false
        };
      });
      setExerciseProgress(initial);
    }
  }, [workout, exercises, previousSessionLogs]);

  // Determine if we show the climb logging UI (Grade/Attempts/Sent)
  const showClimbLogging = !workout || (workout.type !== WorkoutType.HANGBOARD && workout.type !== WorkoutType.CONDITIONING && workout.type !== WorkoutType.REST);

  // Show exercise checklist if workout has structured exercises
  const showExerciseChecklist = workout?.exercises && workout.exercises.length > 0;

  // Initialize Interval Timer if workout has config
  useEffect(() => {
    if (workout?.timerConfig && timerMode === 'none') {
      setTimerMode('interval');
      setWorkDuration(workout.timerConfig.workSeconds);
      setRestDuration(workout.timerConfig.restSeconds);
      setTotalReps(workout.timerConfig.reps);
      setTotalSets(workout.timerConfig.sets || 1);
      setRestBetweenSets(workout.timerConfig.restBetweenSetsSeconds || 120);
      
      setTimerTime(workout.timerConfig.workSeconds);
      setIntervalPhase('Work');
      setIsTimerRunning(false); // Manual start requested
    }
  }, [workout, timerMode]);

  // Elapsed time counter
  useEffect(() => {
    if (!session) return;
    const interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - session.startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [session]);

  // General Timer Logic Loop
  useEffect(() => {
      let interval: ReturnType<typeof setInterval>;
      
      if (isTimerRunning && timerTime > 0) {
          interval = setInterval(() => {
              setTimerTime(prev => {
                  // Play countdown beep for last 3 seconds
                  if (prev <= 4 && prev > 1) {
                      playAudioCue('countdown');
                  }
                  return prev - 1;
              });
          }, 1000);
      } else if (timerTime === 0 && isTimerRunning) {
          // Timer finished
          if (timerMode === 'rest') {
             setIsTimerRunning(false);
             playAudioCue('restComplete');
          } else if (timerMode === 'interval') {
             handleIntervalTransition();
          }
      }
      return () => clearInterval(interval);
  }, [isTimerRunning, timerTime, timerMode]);

  const handleIntervalTransition = () => {
    if (intervalPhase === 'Work') {
        if (currentRep < totalReps) {
             playAudioCue('rest');
             setIntervalPhase('Rest');
             setTimerTime(restDuration);
        } else {
             // Set finished
             if (currentSet < totalSets) {
                 playAudioCue('setRest');
                 setIntervalPhase('Set Rest');
                 setTimerTime(restBetweenSets);
             } else {
                 playAudioCue('complete');
                 setIntervalPhase('Done');
                 setIsTimerRunning(false);
             }
        }
    } else if (intervalPhase === 'Rest') {
        playAudioCue('work');
        setIntervalPhase('Work');
        setTimerTime(workDuration);
        setCurrentRep(prev => prev + 1);
    } else if (intervalPhase === 'Set Rest') {
        playAudioCue('work');
        setIntervalPhase('Work');
        setTimerTime(workDuration);
        setCurrentRep(1);
        setCurrentSet(prev => prev + 1);
    }
  };

  const resetInterval = () => {
      if(!workout?.timerConfig) return;
      setCurrentRep(1);
      setCurrentSet(1);
      setIntervalPhase('Work');
      setTimerTime(workDuration);
      setIsTimerRunning(false);
  };

  // Handlers
  const handleStartSession = () => {
    if (!activeSessionId) {
       startSession(null); 
    }
  };

  const toggleTimer = () => {
      if (!isTimerRunning) {
          initAudioContext(); // Initialize audio on user interaction
      }
      setIsTimerRunning(!isTimerRunning);
  };

  const startRestTimer = (seconds: number) => {
      initAudioContext(); // Initialize audio on user interaction
      setTimerMode('rest');
      setInitialTimerValue(seconds);
      setTimerTime(seconds);
      setIsTimerRunning(true);
  };

  // Check if a climb completes any active grade goals
  const checkGradeGoals = (grade: string, sent: boolean, flashAttempt: boolean) => {
    if (!sent) return;
    
    const gradeIndex = grades.indexOf(grade);
    
    activeGradeGoals.forEach(goal => {
      const target = goal.target as GradeTarget;
      const targetIndex = grades.indexOf(target.grade);
      
      // Check if grade meets target
      if (gradeIndex < targetIndex) return;
      
      // Check style requirement
      if (target.style === 'flash' && !flashAttempt) return;
      if (target.style === 'onsight' && !flashAttempt) return; // For onsight, we'd need more context
      
      // Goal achieved!
      completeGoal(goal.id);
      setAchievements(prev => [...prev, { 
        goalId: goal.id, 
        title: goal.title, 
        type: 'grade' 
      }]);
    });
  };

  const addClimb = (sent: boolean) => {
      if (!session) return;
      const isFlash = attempts === 1;
      const newClimb: ClimbLog = {
          id: generateId(),
          grade: selectedGrade,
          attempts: attempts,
          sent,
          timestamp: Date.now()
      };
      updateSession(session.id, { climbs: [newClimb, ...session.climbs] });
      
      // Check grade goals for auto-completion
      if (sent) {
        checkGradeGoals(selectedGrade, sent, isFlash);
      }
      
      setAttempts(1); // Reset attempts
      // Auto start rest timer on log if not in interval mode
      if (timerMode !== 'interval') {
        startRestTimer(120);
      }
  };

  // Exercise progress helpers
  const updateExerciseProgress = (exerciseId: string, updates: Partial<ExerciseProgress>) => {
    setExerciseProgress(prev => prev.map(ep => 
      ep.exerciseId === exerciseId ? { ...ep, ...updates } : ep
    ));
  };

  const toggleExerciseExpanded = (exerciseId: string) => {
    setExerciseProgress(prev => prev.map(ep =>
      ep.exerciseId === exerciseId ? { ...ep, isExpanded: !ep.isExpanded } : ep
    ));
  };

  const incrementSet = (exerciseId: string) => {
    const progress = exerciseProgress.find(ep => ep.exerciseId === exerciseId);
    const we = workout?.exercises?.find(e => e.exerciseId === exerciseId);
    const exercise = exercises.find(e => e.id === exerciseId);
    const targetSets = we?.sets || exercise?.defaultSets || 3;
    
    if (progress && progress.completedSets < targetSets) {
      updateExerciseProgress(exerciseId, { completedSets: progress.completedSets + 1 });
      // Auto-start rest timer
      if (timerMode !== 'interval') {
        startRestTimer(120);
      }
    }
  };

  const handleFinish = () => {
      if (!session) return;
      
      // Build exercise logs from progress
      const exerciseLogs: ExerciseLog[] = exerciseProgress
        .filter(ep => ep.completedSets > 0)
        .map(ep => ({
          id: generateId(),
          exerciseId: ep.exerciseId,
          completedSets: ep.completedSets,
          completedReps: ep.completedReps,
          addedWeight: ep.addedWeight,
          edgeDepth: ep.edgeDepth,
          resistanceBand: ep.resistanceBand,
          rpe: ep.rpe,
          notes: ep.notes,
          timestamp: Date.now()
        }));
      
      updateSession(session.id, { rpe, notes, exerciseLogs });
      endSession(session.id);
      onComplete();
  };

  // Format MM:SS
  const fmt = (s: number) => {
      const m = Math.floor(s / 60);
      const sec = s % 60;
      return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  if (!activeSessionId || !session) {
      return (
          <div className="flex flex-col h-full justify-center items-center space-y-6 pb-20">
              <div className="w-20 h-20 bg-stone-800 rounded-full flex items-center justify-center animate-pulse">
                  <Play className="w-8 h-8 text-amber-500 ml-1" />
              </div>
              <h2 className="text-xl font-bold">Ready to Train?</h2>
              <div className="space-y-3 w-full max-w-xs">
                  <Button className="w-full py-4 text-lg" onClick={() => startSession(null)}>Start Free Session</Button>
              </div>
          </div>
      );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden pb-20">
      {/* Top Bar: Timer & Status */}
      <div className="bg-stone-800 p-4 rounded-b-2xl shadow-lg shrink-0 z-10">
          <div className="flex justify-between items-center mb-4">
              <div>
                  <h2 className="font-bold text-white max-w-[200px] truncate">{workout?.name || 'Free Session'}</h2>
                  <div className="text-stone-400 font-mono text-sm">{fmt(elapsedTime)} elapsed</div>
              </div>
              <Button variant="danger" size="sm" onClick={handleFinish}>Finish</Button>
          </div>
          
          {/* Active Timer Widget */}
          {timerMode === 'interval' ? (
              <div className={cn("rounded-xl p-4 border flex flex-col items-center justify-center transition-colors", 
                  intervalPhase === 'Work' ? "bg-amber-500/10 border-amber-500/50" : 
                  intervalPhase === 'Set Rest' ? "bg-blue-500/10 border-blue-500/50" :
                  "bg-stone-900 border-stone-700")}>
                  <div className="flex justify-between w-full items-center mb-2">
                      <div className="flex gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Interval</span>
                          <span className={cn("text-xs font-bold uppercase", 
                              intervalPhase === 'Work' ? "text-amber-500" : 
                              intervalPhase === 'Set Rest' ? "text-blue-500" :
                              "text-stone-500")}>{intervalPhase}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-mono text-stone-400">
                          <span>Set {currentSet}/{totalSets}</span>
                          <span>Rep {currentRep}/{totalReps}</span>
                      </div>
                  </div>
                  <div className="flex items-center gap-6">
                      <div className="text-center min-w-[80px]">
                          <div className={cn("text-4xl font-mono font-bold", 
                              intervalPhase === 'Work' ? "text-amber-500" : 
                              intervalPhase === 'Set Rest' ? "text-blue-500" : 
                              "text-stone-300")}>
                              {timerTime}
                          </div>
                      </div>
                      <div className="flex gap-2">
                         <button onClick={toggleTimer} className="p-4 bg-stone-800 rounded-full border border-stone-600 active:scale-95 transition-transform">
                            {isTimerRunning ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-amber-500 ml-1" />}
                         </button>
                         <button onClick={resetInterval} className="p-4 bg-stone-800 rounded-full border border-stone-600 active:scale-95 transition-transform">
                            <RotateCcw className="w-6 h-6 text-stone-400" />
                         </button>
                      </div>
                  </div>
              </div>
          ) : (
              <div className="bg-stone-900 rounded-xl p-3 border border-stone-700 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                     <div className={cn("w-12 h-12 rounded-full flex items-center justify-center border-2 font-mono font-bold text-lg", isTimerRunning ? "border-amber-500 text-amber-500" : "border-stone-600 text-stone-500")}>
                         {timerTime > 0 ? timerTime : '--'}
                     </div>
                     <div className="flex flex-col">
                         <span className="text-xs text-stone-400 uppercase tracking-wide">Rest Timer</span>
                         <div className="flex gap-2 mt-1">
                             <button onClick={() => startRestTimer(60)} className="px-2 py-0.5 bg-stone-700 rounded text-xs text-stone-300 hover:bg-stone-600">1m</button>
                             <button onClick={() => startRestTimer(120)} className="px-2 py-0.5 bg-stone-700 rounded text-xs text-stone-300 hover:bg-stone-600">2m</button>
                             <button onClick={() => startRestTimer(180)} className="px-2 py-0.5 bg-stone-700 rounded text-xs text-stone-300 hover:bg-stone-600">3m</button>
                         </div>
                     </div>
                 </div>
                 <button onClick={toggleTimer} className="p-3 bg-stone-800 rounded-full hover:bg-stone-700">
                     {isTimerRunning ? <Pause className="w-5 h-5 text-amber-500" /> : <Play className="w-5 h-5 text-stone-300" />}
                 </button>
              </div>
          )}
      </div>

      {/* Goal Achievement Toast */}
      {achievements.length > 0 && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-green-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3">
            <Target className="w-5 h-5" />
            <div>
              <div className="font-bold text-sm">🎉 Goal Achieved!</div>
              <div className="text-xs text-green-100">{achievements[achievements.length - 1].title}</div>
            </div>
            <button 
              onClick={() => setAchievements([])}
              className="ml-2 p-1 hover:bg-green-600 rounded"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-6">
          
          {/* Workout Steps */}
          {workout && (
             <div className="bg-stone-800/50 p-4 rounded-xl border border-stone-700/50">
                 <div className="flex justify-between items-center mb-2">
                     <h3 className="text-sm font-bold text-stone-300 uppercase tracking-wide">Plan</h3>
                     {workout.timerConfig && (
                        <button onClick={() => setTimerMode('interval')} className="text-xs text-amber-500 hover:underline">
                            Show Interval Timer
                        </button>
                     )}
                 </div>
                 <ul className="list-disc list-inside text-sm text-stone-400 space-y-1">
                     {workout.steps.map((s, i) => <li key={i}>{s}</li>)}
                 </ul>
                 {workout.timerConfig && (
                     <div className="mt-3 text-xs text-stone-500 border-t border-stone-700 pt-2 flex gap-4">
                         <span className="flex items-center gap-1"><Timer className="w-3 h-3"/> {workout.timerConfig.workSeconds}s/{workout.timerConfig.restSeconds}s</span>
                         <span className="flex items-center gap-1"><Layers className="w-3 h-3"/> {workout.timerConfig.sets} x {workout.timerConfig.reps}</span>
                     </div>
                 )}
             </div>
          )}

          {/* Exercise Checklist - For workouts with structured exercises */}
          {showExerciseChecklist && workout?.exercises && (
            <div className="bg-stone-800 p-4 rounded-xl border border-stone-700">
              <div className="flex items-center gap-2 mb-3">
                <Dumbbell className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-stone-300 uppercase tracking-wide">Exercises</h3>
              </div>
              
              <div className="space-y-2">
                {workout.exercises.map(we => {
                  const exercise = exercises.find(e => e.id === we.exerciseId);
                  const progress = exerciseProgress.find(ep => ep.exerciseId === we.exerciseId);
                  const prevLog = previousSessionLogs.get(we.exerciseId);
                  const targetSets = we.sets || exercise?.defaultSets || 3;
                  const targetReps = we.reps || exercise?.defaultReps;
                  const targetDuration = we.durationSeconds || exercise?.defaultDurationSeconds;
                  const isComplete = progress && progress.completedSets >= targetSets;
                  
                  if (!exercise || !progress) return null;
                  
                  return (
                    <div key={we.exerciseId} className={cn(
                      "rounded-lg border transition-colors",
                      isComplete ? "bg-green-500/10 border-green-500/30" : "bg-stone-900 border-stone-700"
                    )}>
                      {/* Exercise Header */}
                      <button
                        onClick={() => toggleExerciseExpanded(we.exerciseId)}
                        className="w-full p-3 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                            isComplete ? "bg-green-500 text-white" : "bg-stone-700 text-stone-400"
                          )}>
                            {isComplete ? <Check className="w-3.5 h-3.5" /> : progress.completedSets}
                          </div>
                          <div className="text-left">
                            <div className={cn("font-medium text-sm", isComplete ? "text-green-400" : "text-white")}>
                              {exercise.name}
                            </div>
                            <div className="text-xs text-stone-500">
                              {progress.completedSets}/{targetSets} sets
                              {targetReps && ` • ${targetReps} reps`}
                              {targetDuration && ` • ${targetDuration}s`}
                            </div>
                          </div>
                        </div>
                        {progress.isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-stone-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-stone-500" />
                        )}
                      </button>
                      
                      {/* Expanded Details */}
                      {progress.isExpanded && (
                        <div className="px-3 pb-3 space-y-3 border-t border-stone-700/50 pt-3">
                          {/* Quick Set Completion */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-stone-400">Complete Set</span>
                            <Button
                              size="sm"
                              variant={isComplete ? "secondary" : "primary"}
                              disabled={isComplete}
                              onClick={() => incrementSet(we.exerciseId)}
                            >
                              <Check className="w-3.5 h-3.5 mr-1" />
                              Set {progress.completedSets + 1}
                            </Button>
                          </div>
                          
                          {/* Weight Input */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-stone-400">Added Weight</span>
                              {prevLog?.addedWeight && (
                                <span className="text-[10px] text-amber-500 flex items-center gap-0.5">
                                  <TrendingUp className="w-3 h-3" />
                                  Last: {prevLog.addedWeight}{settings.weightUnit}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                value={progress.addedWeight || ''}
                                onChange={(e) => updateExerciseProgress(we.exerciseId, { 
                                  addedWeight: e.target.value ? parseFloat(e.target.value) : undefined 
                                })}
                                className="w-16 bg-stone-800 border border-stone-600 rounded px-2 py-1 text-sm text-right"
                                placeholder="0"
                              />
                              <span className="text-xs text-stone-500">{settings.weightUnit}</span>
                            </div>
                          </div>
                          
                          {/* Edge Depth (for hangboard exercises) */}
                          {exercise.category === 'Limit-Strength' && (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-stone-400">Edge Depth</span>
                                {prevLog?.edgeDepth && (
                                  <span className="text-[10px] text-amber-500">
                                    Last: {prevLog.edgeDepth}mm
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  value={progress.edgeDepth || ''}
                                  onChange={(e) => updateExerciseProgress(we.exerciseId, { 
                                    edgeDepth: e.target.value ? parseFloat(e.target.value) : undefined 
                                  })}
                                  className="w-16 bg-stone-800 border border-stone-600 rounded px-2 py-1 text-sm text-right"
                                  placeholder="18"
                                />
                                <span className="text-xs text-stone-500">mm</span>
                              </div>
                            </div>
                          )}
                          
                          {/* Resistance Band (for assisted exercises) */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-stone-400">Resistance Band</span>
                            <select
                              value={progress.resistanceBand || ''}
                              onChange={(e) => updateExerciseProgress(we.exerciseId, { resistanceBand: e.target.value || undefined })}
                              className="bg-stone-800 border border-stone-600 rounded px-2 py-1 text-sm"
                            >
                              <option value="">None</option>
                              <option value="light">Light (Green)</option>
                              <option value="medium">Medium (Blue)</option>
                              <option value="heavy">Heavy (Black)</option>
                            </select>
                          </div>
                          
                          {/* Exercise-specific notes */}
                          <div>
                            <span className="text-xs text-stone-400 block mb-1">Notes</span>
                            <input
                              type="text"
                              value={progress.notes || ''}
                              onChange={(e) => updateExerciseProgress(we.exerciseId, { notes: e.target.value })}
                              className="w-full bg-stone-800 border border-stone-600 rounded px-2 py-1 text-sm"
                              placeholder="How did it feel?"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Climb Logger - Conditionally Rendered */}
          {showClimbLogging && (
            <div className="bg-stone-800 p-4 rounded-xl border border-stone-700">
                <h3 className="text-sm font-bold text-stone-300 mb-3 uppercase tracking-wide">Log Climb</h3>
                
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                       <button onClick={() => {
                           const idx = grades.indexOf(selectedGrade);
                           if(idx > 0) setSelectedGrade(grades[idx-1]);
                       }} className="w-10 h-10 rounded-lg bg-stone-700 flex items-center justify-center text-xl font-bold hover:bg-stone-600">-</button>
                       <div className="w-16 text-center text-3xl font-bold text-amber-500">{selectedGrade}</div>
                       <button onClick={() => {
                           const idx = grades.indexOf(selectedGrade);
                           if(idx < grades.length-1) setSelectedGrade(grades[idx+1]);
                       }} className="w-10 h-10 rounded-lg bg-stone-700 flex items-center justify-center text-xl font-bold hover:bg-stone-600">+</button>
                    </div>
                    
                    <div className="flex flex-col items-center">
                        <span className="text-xs text-stone-500 mb-1">ATTEMPTS</span>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setAttempts(Math.max(1, attempts-1))} className="w-8 h-8 rounded bg-stone-700 flex items-center justify-center font-bold">-</button>
                          <span className="font-mono text-xl w-6 text-center">{attempts}</span>
                          <button onClick={() => setAttempts(attempts+1)} className="w-8 h-8 rounded bg-stone-700 flex items-center justify-center font-bold">+</button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10" onClick={() => addClimb(false)}>
                        Fail
                    </Button>
                    <Button variant="primary" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => addClimb(true)}>
                        <Check className="w-4 h-4 mr-1" /> Sent
                    </Button>
                </div>
            </div>
          )}

          {/* Session Log History - Conditionally Rendered */}
          {showClimbLogging && (
            <div className="space-y-2">
                <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wide">Session Log</h3>
                {session.climbs.length === 0 && <p className="text-stone-600 text-sm italic">No climbs logged yet.</p>}
                {session.climbs.map(climb => (
                    <div key={climb.id} className="flex justify-between items-center bg-stone-900 p-3 rounded-lg border border-stone-800">
                        <div className="flex items-center gap-3">
                            <span className={cn("font-bold w-8 text-center", climb.sent ? "text-green-500" : "text-red-500")}>
                                {climb.grade}
                            </span>
                            <span className="text-stone-400 text-sm">{climb.attempts} attempt{climb.attempts > 1 ? 's' : ''}</span>
                        </div>
                        <span className="text-xs text-stone-600 font-mono">
                            {new Date(climb.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                    </div>
                ))}
            </div>
          )}

          {/* End of Session inputs */}
          <div className="bg-stone-800/50 p-4 rounded-xl space-y-3">
             <label className="text-xs text-stone-400 block">Session RPE (1-10)</label>
             <input 
               type="range" min="1" max="10" 
               value={rpe} onChange={(e) => setRpe(parseInt(e.target.value))} 
               className="w-full accent-amber-500" 
             />
             <div className="flex justify-between text-xs text-stone-500">
                 <span>1 (Easy)</span>
                 <span className="text-amber-500 font-bold">{rpe}</span>
                 <span>10 (Fail)</span>
             </div>
             
             <label className="text-xs text-stone-400 block mt-2">Notes</label>
             <textarea 
               value={notes} onChange={e => setNotes(e.target.value)}
               className="w-full bg-stone-900 rounded p-2 text-sm text-white border border-stone-700 outline-none"
               placeholder="How did you feel?"
             />
          </div>
          
          <div className="h-20"></div> {/* Spacer for scrolling */}
      </div>
    </div>
  );
};
