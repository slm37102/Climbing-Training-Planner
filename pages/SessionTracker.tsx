import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { Button } from '../components/ui/Button';
import { Play, Pause, Square, Plus, Check, RotateCcw, Timer, Save, SkipForward, Layers } from 'lucide-react';
import { grades, cn, rpeDescriptions } from '../utils';
import { ClimbLog, Workout, WorkoutType } from '../types';

export const SessionTracker: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { activeSessionId, sessions, workouts, schedule, startSession, updateSession, endSession, deleteSession } = useStore();
  const [elapsedTime, setElapsedTime] = useState(0);
  
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

  // Find current session object
  const session = sessions.find(s => s.id === activeSessionId);
  const workout = session?.workoutId ? workouts.find(w => w.id === session.workoutId) : null;

  // Determine if we show the climb logging UI (Grade/Attempts/Sent)
  const showClimbLogging = !workout || (workout.type !== WorkoutType.HANGBOARD && workout.type !== WorkoutType.CONDITIONING && workout.type !== WorkoutType.REST);

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
              setTimerTime(prev => prev - 1);
          }, 1000);
      } else if (timerTime === 0 && isTimerRunning) {
          // Timer finished
          if (timerMode === 'rest') {
             setIsTimerRunning(false);
             if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
          } else if (timerMode === 'interval') {
             handleIntervalTransition();
          }
      }
      return () => clearInterval(interval);
  }, [isTimerRunning, timerTime, timerMode]);

  const handleIntervalTransition = () => {
    if ('vibrate' in navigator) navigator.vibrate(200);
    
    if (intervalPhase === 'Work') {
        if (currentRep < totalReps) {
             setIntervalPhase('Rest');
             setTimerTime(restDuration);
        } else {
             // Set finished
             if (currentSet < totalSets) {
                 setIntervalPhase('Set Rest');
                 setTimerTime(restBetweenSets);
             } else {
                 setIntervalPhase('Done');
                 setIsTimerRunning(false);
             }
        }
    } else if (intervalPhase === 'Rest') {
        setIntervalPhase('Work');
        setTimerTime(workDuration);
        setCurrentRep(prev => prev + 1);
    } else if (intervalPhase === 'Set Rest') {
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

  const startRestTimer = (seconds: number) => {
      setTimerMode('rest');
      setInitialTimerValue(seconds);
      setTimerTime(seconds);
      setIsTimerRunning(true);
  };

  const addClimb = (sent: boolean) => {
      if (!session) return;
      const newClimb: ClimbLog = {
          id: Math.random().toString(36),
          grade: selectedGrade,
          attempts: attempts,
          sent,
          timestamp: Date.now()
      };
      updateSession(session.id, { climbs: [newClimb, ...session.climbs] });
      setAttempts(1); // Reset attempts
      // Auto start rest timer on log if not in interval mode
      if (timerMode !== 'interval') {
        startRestTimer(120);
      }
  };

  const handleFinish = () => {
      if (!session) return;
      updateSession(session.id, { rpe, notes });
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
                         <button onClick={() => setIsTimerRunning(!isTimerRunning)} className="p-4 bg-stone-800 rounded-full border border-stone-600 active:scale-95 transition-transform">
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
                 <button onClick={() => setIsTimerRunning(!isTimerRunning)} className="p-3 bg-stone-800 rounded-full hover:bg-stone-700">
                     {isTimerRunning ? <Pause className="w-5 h-5 text-amber-500" /> : <Play className="w-5 h-5 text-stone-300" />}
                 </button>
              </div>
          )}
      </div>

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
