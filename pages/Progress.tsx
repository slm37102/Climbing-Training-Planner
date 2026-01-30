import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { 
  grades, 
  TimeRange, 
  getDateRange, 
  getPreviousRange, 
  getProgressStats, 
  getComparisonChange 
} from '../utils';
import { StatCard } from '../components/stats/StatCard';
import { CalendarHeatmap } from '../components/stats/CalendarHeatmap';
import { TimeRangeSelector } from '../components/stats/TimeRangeSelector';

export const Progress: React.FC = () => {
  const { sessions } = useStore();
  const [timeRange, setTimeRange] = useState<TimeRange>('month');

  // Current period stats
  const currentRange = useMemo(() => getDateRange(timeRange), [timeRange]);
  const currentStats = useMemo(() => getProgressStats(sessions, currentRange), [sessions, currentRange]);
  
  // Previous period stats for comparison
  const previousRange = useMemo(() => getPreviousRange(timeRange), [timeRange]);
  const previousStats = useMemo(() => getProgressStats(sessions, previousRange), [sessions, previousRange]);
  
  // Comparisons
  const sessionsChange = getComparisonChange(currentStats.totalSessions, previousStats.totalSessions);
  const sendsChange = getComparisonChange(currentStats.totalSends, previousStats.totalSends);

  const hasGradeData = currentStats.gradeDistribution.length > 0;

  return (
    <div className="pb-20 space-y-6">
      {/* Header with time range selector */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-stone-100">Progress</h1>
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      </div>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard 
          label="Sessions" 
          value={currentStats.totalSessions}
          comparison={sessionsChange}
        />
        <StatCard 
          label="Climbs Sent" 
          value={currentStats.totalSends}
          comparison={sendsChange}
        />
        <StatCard 
          label="Top Grade" 
          value={currentStats.highestGrade || '-'}
          highlight
        />
        <StatCard 
          label="Avg Duration" 
          value={currentStats.avgDuration ? `${currentStats.avgDuration}m` : '-'}
        />
      </div>

      {/* Grade Distribution Chart */}
      <div className="bg-stone-800 p-4 rounded-xl border border-stone-700">
        <h3 className="text-sm font-bold text-stone-400 mb-4 uppercase">Grade Profile</h3>
        {hasGradeData ? (
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentStats.gradeDistribution}>
                <XAxis 
                  dataKey="grade" 
                  stroke="#78716c" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1c1917', 
                    border: 'none', 
                    borderRadius: '8px', 
                    fontSize: '12px' 
                  }}
                  itemStyle={{ color: '#fbbf24' }}
                  cursor={{ fill: '#292524' }}
                  formatter={(value: number) => [`${value} sends`, 'Count']}
                />
                <Bar dataKey="count" fill="#fbbf24" radius={[4, 4, 0, 0]}>
                  {currentStats.gradeDistribution.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`hsl(45, 96%, ${Math.max(40, 60 - index * 3)}%)`} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center text-stone-500 text-sm italic">
            Log some sends to see your grade profile.
          </div>
        )}
      </div>

      {/* Calendar Heatmap */}
      <CalendarHeatmap range={timeRange} trainingDays={currentStats.trainingDays} />

      {/* Additional Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard 
          label="Total Climbs" 
          value={currentStats.totalClimbs}
        />
        <StatCard 
          label="Avg RPE" 
          value={currentStats.avgRpe ?? '-'}
        />
      </div>
    </div>
  );
};
