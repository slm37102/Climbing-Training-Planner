import React from 'react';
import { cn, getCalendarDays, TimeRange } from '../../utils';

interface CalendarHeatmapProps {
  range: TimeRange;
  trainingDays: Set<string>;
}

export const CalendarHeatmap: React.FC<CalendarHeatmapProps> = ({ range, trainingDays }) => {
  const days = getCalendarDays(range);
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  
  // Group days by week for grid layout
  const weeks: { date: string; dayOfWeek: number }[][] = [];
  let currentWeek: { date: string; dayOfWeek: number }[] = [];
  
  // Pad first week if needed
  if (days.length > 0) {
    const firstDayOfWeek = days[0].dayOfWeek;
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push({ date: '', dayOfWeek: i });
    }
  }
  
  days.forEach(day => {
    if (day.dayOfWeek === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(day);
  });
  
  if (currentWeek.length > 0) {
    // Pad last week
    while (currentWeek.length < 7) {
      currentWeek.push({ date: '', dayOfWeek: currentWeek.length });
    }
    weeks.push(currentWeek);
  }

  return (
    <div className="bg-stone-800 p-4 rounded-xl border border-stone-700">
      <h3 className="text-sm font-bold text-stone-400 mb-3 uppercase">Training Calendar</h3>
      
      {/* Day labels */}
      <div className="flex gap-1 mb-1">
        {weekDays.map((d, i) => (
          <div key={i} className="w-6 h-4 text-[10px] text-stone-500 text-center">{d}</div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="flex flex-col gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex gap-1">
            {week.map((day, di) => {
              const isTrained = day.date && trainingDays.has(day.date);
              const isToday = day.date === new Date().toISOString().split('T')[0];
              
              return (
                <div
                  key={di}
                  className={cn(
                    "w-6 h-6 rounded-sm transition-colors",
                    !day.date && "bg-transparent",
                    day.date && !isTrained && "bg-stone-700/50",
                    isTrained && "bg-amber-500",
                    isToday && "ring-1 ring-amber-400 ring-offset-1 ring-offset-stone-800"
                  )}
                  title={day.date ? `${day.date}${isTrained ? ' - Trained' : ''}` : ''}
                />
              );
            })}
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex items-center gap-3 mt-3 text-[10px] text-stone-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-stone-700/50 rounded-sm" />
          <span>Rest</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-amber-500 rounded-sm" />
          <span>Trained</span>
        </div>
      </div>
    </div>
  );
};
