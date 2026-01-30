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
import { GoalCard } from '../components/goals/GoalCard';
import { GoalForm } from '../components/goals/GoalForm';
import { Plus, Target, Archive } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const Progress: React.FC = () => {
  const { sessions, goals, completeGoal, archiveGoal, deleteGoal } = useStore();
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  
  // Filter goals by status
  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');
  const archivedGoals = goals.filter(g => g.status === 'archived');

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
      
      {/* Goals Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-500" />
            <h2 className="font-bold text-stone-200">Goals</h2>
            {activeGoals.length > 0 && (
              <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                {activeGoals.length} active
              </span>
            )}
          </div>
          <Button size="sm" variant="ghost" onClick={() => setShowGoalForm(true)}>
            <Plus className="w-4 h-4" /> Add
          </Button>
        </div>
        
        {activeGoals.length === 0 && completedGoals.length === 0 ? (
          <div className="bg-stone-800/50 rounded-xl p-6 text-center border border-stone-700/50">
            <Target className="w-10 h-10 text-stone-600 mx-auto mb-2" />
            <p className="text-stone-500 text-sm">No goals yet</p>
            <Button 
              size="sm" 
              variant="outline" 
              className="mt-3"
              onClick={() => setShowGoalForm(true)}
            >
              <Plus className="w-4 h-4" /> Set Your First Goal
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Active Goals */}
            {activeGoals.map(goal => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onComplete={completeGoal}
                onArchive={archiveGoal}
                onDelete={deleteGoal}
              />
            ))}
            
            {/* Recently Completed */}
            {completedGoals.length > 0 && (
              <div className="pt-2">
                <div className="text-xs text-stone-500 mb-2 uppercase tracking-wide">Recently Completed</div>
                {completedGoals.slice(0, 2).map(goal => (
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
            )}
            
            {/* Archived Toggle */}
            {archivedGoals.length > 0 && (
              <button
                onClick={() => setShowArchived(!showArchived)}
                className="flex items-center gap-2 text-xs text-stone-500 hover:text-stone-400"
              >
                <Archive className="w-3 h-3" />
                {showArchived ? 'Hide' : 'Show'} {archivedGoals.length} archived
              </button>
            )}
            
            {showArchived && archivedGoals.map(goal => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onComplete={completeGoal}
                onArchive={archiveGoal}
                onDelete={deleteGoal}
              />
            ))}
          </div>
        )}
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
      
      {/* Goal Form Modal */}
      {showGoalForm && (
        <GoalForm onClose={() => setShowGoalForm(false)} />
      )}
    </div>
  );
};
