import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatDate, getDayName, getDayNumber, cn } from '../utils';
import { ChevronLeft, ChevronRight, Plus, Trash2, Copy, MoreHorizontal } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { WorkoutType, Workout } from '../types';

export const Planner: React.FC = () => {
  const { schedule, workouts, scheduleWorkout, removeScheduledWorkout, copyWeekToNext } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null); // Date string

  // Helper to get the week's dates
  const getWeekDates = (baseDate: Date) => {
    const dates = [];
    const start = new Date(baseDate);
    // Adjust to Monday
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); 
    start.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      dates.push(formatDate(d));
    }
    return dates;
  };

  const weekDates = getWeekDates(currentDate);

  const changeWeek = (dir: 1 | -1) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (dir * 7));
    setCurrentDate(newDate);
  };

  const handleAssign = (workoutId: string) => {
    if (selectedDay) {
      scheduleWorkout(selectedDay, workoutId);
      setSelectedDay(null);
    }
  };
  
  const handleRemove = (e: React.MouseEvent, scheduleId: string) => {
    e.stopPropagation();
    if(confirm('Remove this workout from the plan?')) {
        removeScheduledWorkout(scheduleId);
    }
  };

  const handleCopyWeek = () => {
      if(confirm('Duplicate this week\'s schedule to the following week?')) {
          copyWeekToNext(weekDates[0]);
          changeWeek(1); // Auto move to see the result
      }
  };

  // Color mapping for workout types
  const typeColors: Record<string, string> = {
    [WorkoutType.BOULDER]: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
    [WorkoutType.SPORT]: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
    [WorkoutType.BOARD]: 'bg-indigo-500/20 text-indigo-500 border-indigo-500/30',
    [WorkoutType.HANGBOARD]: 'bg-purple-500/20 text-purple-500 border-purple-500/30',
    [WorkoutType.CONDITIONING]: 'bg-red-500/20 text-red-500 border-red-500/30',
    [WorkoutType.REST]: 'bg-green-500/20 text-green-500 border-green-500/30',
    [WorkoutType.OTHER]: 'bg-stone-500/20 text-stone-500 border-stone-500/30',
  };

  return (
    <div className="pb-20 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
           <h1 className="text-2xl font-bold text-stone-100">Weekly Plan</h1>
           <span className="text-xs font-medium text-stone-500">
             {new Date(weekDates[0]).toLocaleDateString(undefined, {month:'short', day:'numeric'})} - {new Date(weekDates[6]).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
           </span>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="ghost" size="icon" onClick={handleCopyWeek} title="Duplicate Week Forward">
              <Copy className="w-5 h-5" />
           </Button>
           <div className="flex items-center gap-1 bg-stone-800 rounded-lg p-1">
             <button onClick={() => changeWeek(-1)} className="p-2 hover:bg-stone-700 rounded"><ChevronLeft className="w-5 h-5 text-stone-400" /></button>
             <button onClick={() => changeWeek(1)} className="p-2 hover:bg-stone-700 rounded"><ChevronRight className="w-5 h-5 text-stone-400" /></button>
           </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar">
        {weekDates.map(dateStr => {
          // Get all workouts for this day
          const daySchedule = schedule.filter(s => s.date === dateStr);
          const isToday = dateStr === formatDate(new Date());

          return (
            <div 
              key={dateStr} 
              className={cn(
                "relative rounded-xl border p-3 min-h-[100px] transition-all flex flex-col",
                isToday ? "bg-stone-800/80 border-stone-600" : "bg-stone-900 border-stone-800",
                "hover:border-stone-700"
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex flex-col">
                    <span className={cn("text-xs font-bold uppercase", isToday ? "text-amber-500" : "text-stone-500")}>
                        {getDayName(dateStr)}
                    </span>
                    <span className={cn("text-lg font-light", isToday ? "text-white" : "text-stone-300")}>
                        {getDayNumber(dateStr)}
                    </span>
                </div>
                
                <Button size="sm" variant="ghost" onClick={() => setSelectedDay(dateStr)} className="h-8 w-8 p-0 rounded-full bg-stone-800/50 hover:bg-stone-700">
                    <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-1.5">
                  {daySchedule.map(sched => {
                     const w = workouts.find(workout => workout.id === sched.workoutId);
                     if (!w) return null;
                     return (
                      <div key={sched.id} className={cn("rounded px-2 py-1.5 text-xs font-medium border flex items-center justify-between gap-2", typeColors[w.type] || typeColors.Other)}>
                         <div className="flex items-center gap-2 overflow-hidden">
                             <div className={cn("w-2 h-2 rounded-full bg-current opacity-50 shrink-0")} />
                             <span className="truncate">{w.name}</span>
                         </div>
                         <button onClick={(e) => handleRemove(e, sched.id)} className="text-current opacity-50 hover:opacity-100 p-0.5">
                             <Trash2 className="w-3 h-3" />
                         </button>
                      </div>
                     );
                  })}
                  {daySchedule.length === 0 && (
                      <div className="text-xs text-stone-600 italic py-2">Rest</div>
                  )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Workout Selector Modal */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-stone-900 w-full max-w-md rounded-2xl border border-stone-700 max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-stone-800 flex justify-between items-center">
                <h3 className="font-bold text-white">Add to {new Date(selectedDay).toLocaleDateString(undefined, {weekday:'short', month:'short', day:'numeric'})}</h3>
                <button onClick={() => setSelectedDay(null)} className="text-stone-400">Close</button>
            </div>
            <div className="p-4 overflow-y-auto space-y-2">
                {workouts.map(w => (
                    <button 
                        key={w.id}
                        onClick={() => handleAssign(w.id)}
                        className="w-full text-left p-3 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 hover:border-stone-500 transition-all group"
                    >
                        <div className="flex justify-between items-center">
                            <span className="font-medium text-stone-200">{w.name}</span>
                            <span className="text-xs text-stone-500 group-hover:text-stone-300">{w.durationMinutes}m</span>
                        </div>
                        <div className="text-xs text-stone-500 mt-1 uppercase tracking-wide">{w.type}</div>
                    </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
