import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Button } from '../components/ui/Button';
import { Plus, Clock, FileText, Trash2, Edit2, Timer } from 'lucide-react';
import { Workout, WorkoutType, TimerConfig } from '../types';

export const WorkoutLibrary: React.FC = () => {
  const { workouts, addWorkout, deleteWorkout } = useStore();
  const [isCreating, setIsCreating] = useState(false);
  
  // Simple form state
  const [formData, setFormData] = useState<Partial<Workout>>({
      name: '',
      type: WorkoutType.BOULDER,
      durationMinutes: 60,
      description: '',
      steps: []
  });

  const [hasTimer, setHasTimer] = useState(false);
  const [timerConfig, setTimerConfig] = useState<TimerConfig>({
    workSeconds: 7,
    restSeconds: 3,
    reps: 6,
    sets: 1,
    restBetweenSetsSeconds: 120
  });

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if(formData.name && formData.type) {
          const newWorkout = {
            ...formData,
            timerConfig: hasTimer ? timerConfig : undefined
          };
          addWorkout(newWorkout as Omit<Workout, 'id'>);
          setIsCreating(false);
          setFormData({ name: '', type: WorkoutType.BOULDER, durationMinutes: 60, description: '', steps: [] });
          setHasTimer(false);
      }
  };

  return (
    <div className="pb-20 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-stone-100">Library</h1>
        <Button onClick={() => setIsCreating(true)} size="sm">
            <Plus className="w-4 h-4 mr-1" /> New
        </Button>
      </div>

      {!isCreating ? (
          <div className="grid gap-4">
            {workouts.map(workout => (
                <div key={workout.id} className="bg-stone-800 p-4 rounded-xl border border-stone-700 relative group">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-stone-100">{workout.name}</h3>
                        <div className="px-2 py-0.5 rounded text-xs bg-stone-700 text-stone-300 uppercase tracking-wide">
                            {workout.type}
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-stone-500 mb-3">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {workout.durationMinutes} min</span>
                        <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {workout.steps.length} steps</span>
                        {workout.timerConfig && (
                           <span className="flex items-center gap-1 text-amber-500"><Timer className="w-3 h-3" /> Interval</span>
                        )}
                    </div>
                    <p className="text-stone-400 text-sm mb-4 line-clamp-2">{workout.description}</p>
                    
                    <div className="flex gap-2">
                         <Button variant="danger" size="sm" onClick={() => deleteWorkout(workout.id)} className="px-2">
                             <Trash2 className="w-4 h-4" />
                         </Button>
                         {/* Edit functionality omitted for brevity in MVP */}
                    </div>
                </div>
            ))}
          </div>
      ) : (
          <div className="bg-stone-800 p-6 rounded-xl border border-stone-700 animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-xl font-bold mb-4">Create Workout</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                      <label className="block text-xs font-medium text-stone-400 mb-1">Name</label>
                      <input 
                        type="text" 
                        required
                        className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-white focus:border-amber-500 outline-none"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs font-medium text-stone-400 mb-1">Type</label>
                        <select 
                            className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-white outline-none"
                            value={formData.type}
                            onChange={e => setFormData({...formData, type: e.target.value as WorkoutType})}
                        >
                            {Object.values(WorkoutType).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                     </div>
                     <div>
                        <label className="block text-xs font-medium text-stone-400 mb-1">Duration (min)</label>
                        <input 
                            type="number" 
                            className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-white outline-none"
                            value={formData.durationMinutes}
                            onChange={e => setFormData({...formData, durationMinutes: parseInt(e.target.value)})}
                        />
                     </div>
                  </div>
                  <div>
                      <label className="block text-xs font-medium text-stone-400 mb-1">Description</label>
                      <textarea 
                        className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-white outline-none h-20"
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                      />
                  </div>

                  {/* Interval Timer Settings */}
                  <div className="border-t border-stone-700 pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <input 
                        type="checkbox" 
                        id="hasTimer"
                        checked={hasTimer}
                        onChange={(e) => setHasTimer(e.target.checked)}
                        className="w-4 h-4 rounded border-stone-600 bg-stone-800 text-amber-500"
                      />
                      <label htmlFor="hasTimer" className="text-sm font-medium text-stone-300">Enable Interval Timer</label>
                    </div>
                    
                    {hasTimer && (
                      <div className="space-y-3 bg-stone-900/50 p-3 rounded-lg">
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[10px] uppercase text-stone-500 mb-1">Work (s)</label>
                            <input 
                              type="number" 
                              className="w-full bg-stone-800 border border-stone-600 rounded p-1 text-center text-white"
                              value={timerConfig.workSeconds}
                              onChange={e => setTimerConfig({...timerConfig, workSeconds: parseInt(e.target.value)})}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase text-stone-500 mb-1">Rest (s)</label>
                            <input 
                              type="number" 
                              className="w-full bg-stone-800 border border-stone-600 rounded p-1 text-center text-white"
                              value={timerConfig.restSeconds}
                              onChange={e => setTimerConfig({...timerConfig, restSeconds: parseInt(e.target.value)})}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase text-stone-500 mb-1">Reps</label>
                            <input 
                              type="number" 
                              className="w-full bg-stone-800 border border-stone-600 rounded p-1 text-center text-white"
                              value={timerConfig.reps}
                              onChange={e => setTimerConfig({...timerConfig, reps: parseInt(e.target.value)})}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-stone-800">
                           <div>
                            <label className="block text-[10px] uppercase text-stone-500 mb-1">Total Sets</label>
                            <input 
                              type="number" 
                              className="w-full bg-stone-800 border border-stone-600 rounded p-1 text-center text-white"
                              value={timerConfig.sets}
                              onChange={e => setTimerConfig({...timerConfig, sets: parseInt(e.target.value)})}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase text-stone-500 mb-1">Set Rest (s)</label>
                            <input 
                              type="number" 
                              className="w-full bg-stone-800 border border-stone-600 rounded p-1 text-center text-white"
                              value={timerConfig.restBetweenSetsSeconds}
                              onChange={e => setTimerConfig({...timerConfig, restBetweenSetsSeconds: parseInt(e.target.value)})}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-2">
                      <Button type="button" variant="ghost" onClick={() => setIsCreating(false)} className="flex-1">Cancel</Button>
                      <Button type="submit" className="flex-1">Save Workout</Button>
                  </div>
              </form>
          </div>
      )}
    </div>
  );
};
