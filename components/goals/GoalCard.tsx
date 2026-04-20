import React from 'react';
import {
  Goal,
  isGradeGoal,
  isVolumeGoal,
  isStrengthGoal,
  isProjectGoal,
  isCompGoal,
  isRehabGoal,
} from '../../types';
import { cn } from '../../utils';
import { Target, TrendingUp, Check, Archive, Trash2, Calendar, MoreVertical, Dumbbell, Mountain, Trophy, HeartPulse, BarChart3 } from 'lucide-react';

interface GoalCardProps {
  goal: Goal;
  onComplete: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  compact?: boolean;
  /** Optional extra context for volume goals (e.g. current progress
   * toward the target). When omitted the progress bar is hidden. */
  progress?: { current: number; target: number };
}

// Lightweight per-type descriptor: icon + accent color + summary line.
const descriptorFor = (goal: Goal, progress?: GoalCardProps['progress']) => {
  if (isGradeGoal(goal)) {
    const disc = goal.discipline ? ` ${goal.discipline}` : '';
    const by = goal.deadline ? ` by ${goal.deadline}` : '';
    return {
      icon: <Target className="w-5 h-5 text-amber-500" />,
      accent: 'bg-amber-500/20',
      typeLabel: 'Grade',
      summary: `Send ${goal.targetGrade}${disc}${by}`,
    };
  }
  if (isVolumeGoal(goal)) {
    const prog = progress
      ? ` (${progress.current}/${progress.target})`
      : '';
    return {
      icon: <BarChart3 className="w-5 h-5 text-emerald-500" />,
      accent: 'bg-emerald-500/20',
      typeLabel: 'Volume',
      summary: `${goal.targetCount} ${goal.unit} this ${goal.window}${prog}`,
    };
  }
  if (isStrengthGoal(goal)) {
    const metricLabels: Record<string, string> = {
      maxHang: 'Max hang',
      weightedPullup: 'Weighted pull-up',
      oneArmHang: 'One-arm hang',
      custom: goal.customLabel || 'Custom',
    };
    const parts: string[] = [];
    if (goal.targetKg !== undefined) parts.push(`${goal.targetKg}kg`);
    if (goal.durationSec !== undefined) parts.push(`${goal.durationSec}s`);
    return {
      icon: <Dumbbell className="w-5 h-5 text-blue-500" />,
      accent: 'bg-blue-500/20',
      typeLabel: 'Strength',
      summary: `${metricLabels[goal.metric]}: ${parts.join(' ') || 'goal'}`,
    };
  }
  if (isProjectGoal(goal)) {
    const grade = goal.grade ? ` (${goal.grade})` : '';
    const crag = goal.crag ? ` @ ${goal.crag}` : '';
    return {
      icon: <Mountain className="w-5 h-5 text-purple-500" />,
      accent: 'bg-purple-500/20',
      typeLabel: 'Project',
      summary: `${goal.routeName}${grade}${crag}`,
    };
  }
  if (isCompGoal(goal)) {
    const placement = goal.placementTarget ? ` — ${goal.placementTarget}` : '';
    return {
      icon: <Trophy className="w-5 h-5 text-yellow-500" />,
      accent: 'bg-yellow-500/20',
      typeLabel: 'Comp',
      summary: `${goal.compName} — ${goal.date}${placement}`,
    };
  }
  if (isRehabGoal(goal)) {
    return {
      icon: <HeartPulse className="w-5 h-5 text-rose-500" />,
      accent: 'bg-rose-500/20',
      typeLabel: 'Rehab',
      summary: `${goal.injury} — ${goal.phase} phase`,
    };
  }
  // Unreachable with complete union, but keep a safe fallback.
  return {
    icon: <TrendingUp className="w-5 h-5 text-stone-400" />,
    accent: 'bg-stone-700',
    typeLabel: 'Goal',
    summary: '',
  };
};

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onComplete,
  onArchive,
  onDelete,
  compact = false,
  progress,
}) => {
  const [showActions, setShowActions] = React.useState(false);
  const desc = descriptorFor(goal, progress);

  const isDone = goal.achieved || goal.status === 'completed';
  const isArchived = goal.status === 'archived';
  const title = goal.title || desc.summary;

  // Deadline (new `deadline`) falls back to legacy `targetDate`.
  const deadlineStr = goal.deadline || goal.targetDate;
  const daysRemaining = deadlineStr
    ? Math.ceil((new Date(deadlineStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;
  const isOverdue = daysRemaining !== null && daysRemaining < 0;
  const isNearDeadline = daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= 7;

  if (compact) {
    return (
      <div
        data-testid="goal-card"
        data-goal-type={goal.type}
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg border',
          isDone
            ? 'bg-green-500/10 border-green-500/30'
            : 'bg-stone-800 border-stone-700',
        )}
      >
        <div
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
            desc.accent,
          )}
        >
          {desc.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-white truncate">{title}</div>
          <div className="text-xs text-stone-500 truncate">{desc.summary}</div>
        </div>

        {isDone ? (
          <Check className="w-5 h-5 text-green-500 shrink-0" />
        ) : daysRemaining !== null ? (
          <div
            className={cn(
              'text-xs font-medium px-2 py-0.5 rounded shrink-0',
              isOverdue
                ? 'bg-red-500/20 text-red-400'
                : isNearDeadline
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-stone-700 text-stone-400',
            )}
          >
            {isOverdue ? `${Math.abs(daysRemaining)}d late` : `${daysRemaining}d`}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div
      data-testid="goal-card"
      data-goal-type={goal.type}
      className={cn(
        'p-4 rounded-xl border relative',
        isDone
          ? 'bg-green-500/10 border-green-500/30'
          : isArchived
          ? 'bg-stone-900/50 border-stone-800 opacity-60'
          : 'bg-stone-800 border-stone-700',
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', desc.accent)}>
            {desc.icon}
          </div>
          <div>
            <h3 className={cn('font-semibold', isDone ? 'text-green-400' : 'text-white')}>{title}</h3>
            <p className="text-xs text-stone-500">{desc.typeLabel} goal</p>
          </div>
        </div>

        {!isDone && !isArchived && (
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1.5 hover:bg-stone-700 rounded"
              aria-label="Goal actions"
            >
              <MoreVertical className="w-4 h-4 text-stone-500" />
            </button>

            {showActions && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)} />
                <div className="absolute right-0 top-8 z-20 bg-stone-900 border border-stone-700 rounded-lg shadow-xl overflow-hidden min-w-[140px]">
                  <button
                    onClick={() => {
                      onComplete(goal.id);
                      setShowActions(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-stone-800 flex items-center gap-2 text-green-400"
                  >
                    <Check className="w-4 h-4" /> Complete
                  </button>
                  <button
                    onClick={() => {
                      onArchive(goal.id);
                      setShowActions(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-stone-800 flex items-center gap-2 text-stone-400"
                  >
                    <Archive className="w-4 h-4" /> Archive
                  </button>
                  <button
                    onClick={() => {
                      onDelete(goal.id);
                      setShowActions(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-stone-800 flex items-center gap-2 text-red-400"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {isDone && (
          <div className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded">
            ✓ DONE
          </div>
        )}
      </div>

      {/* Details */}
      <div className="bg-stone-900/50 rounded-lg p-3 mb-3">
        <div className="text-xs text-stone-500 mb-1">TARGET</div>
        <div className="text-base font-semibold text-white">{desc.summary}</div>
        {goal.notes && <p className="text-xs text-stone-500 mt-1">{goal.notes}</p>}
        {!goal.notes && goal.description && <p className="text-xs text-stone-500 mt-1">{goal.description}</p>}
      </div>

      {/* Volume progress bar */}
      {isVolumeGoal(goal) && progress && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-stone-500 mb-1">
            <span>Progress</span>
            <span>
              {progress.current} / {progress.target}
            </span>
          </div>
          <div className="h-2 bg-stone-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all"
              style={{
                width: `${Math.min(100, (progress.current / Math.max(1, progress.target)) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      {deadlineStr && (
        <div
          className={cn(
            'flex items-center gap-2 text-sm',
            isOverdue ? 'text-red-400' : isNearDeadline ? 'text-amber-400' : 'text-stone-500',
          )}
        >
          <Calendar className="w-4 h-4" />
          <span>
            {isOverdue
              ? `Overdue by ${Math.abs(daysRemaining!)} days`
              : daysRemaining === 0
              ? 'Due today'
              : `${daysRemaining} days remaining`}
          </span>
        </div>
      )}

      {isDone && goal.completedAt && (
        <div className="text-xs text-stone-500 mt-2">
          Completed on {new Date(goal.completedAt).toLocaleDateString()}
        </div>
      )}
    </div>
  );
};
