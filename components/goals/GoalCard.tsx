import React from 'react';
import { Goal, GradeTarget, StrengthTarget } from '../../types';
import { cn } from '../../utils';
import { Target, TrendingUp, Check, Archive, Trash2, Calendar, MoreVertical } from 'lucide-react';
import { Button } from '../ui/Button';

interface GoalCardProps {
  goal: Goal;
  onComplete: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  compact?: boolean;
}

export const GoalCard: React.FC<GoalCardProps> = ({ 
  goal, 
  onComplete, 
  onArchive, 
  onDelete,
  compact = false 
}) => {
  const [showActions, setShowActions] = React.useState(false);
  
  const isGradeGoal = goal.target.type === 'grade';
  const gradeTarget = goal.target as GradeTarget;
  const strengthTarget = goal.target as StrengthTarget;
  
  // Calculate days until deadline
  const daysRemaining = goal.targetDate 
    ? Math.ceil((new Date(goal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;
  
  const isOverdue = daysRemaining !== null && daysRemaining < 0;
  const isNearDeadline = daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= 7;
  
  const getTargetDisplay = () => {
    if (isGradeGoal) {
      const styleLabel = gradeTarget.style === 'send' ? '' : ` (${gradeTarget.style})`;
      return `${gradeTarget.grade}${styleLabel}`;
    } else {
      return `${strengthTarget.targetValue}${strengthTarget.unit}`;
    }
  };

  if (compact) {
    return (
      <div className={cn(
        "flex items-center gap-3 p-3 rounded-lg border",
        goal.status === 'completed' 
          ? "bg-green-500/10 border-green-500/30"
          : "bg-stone-800 border-stone-700"
      )}>
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
          isGradeGoal ? "bg-amber-500/20" : "bg-blue-500/20"
        )}>
          {isGradeGoal ? (
            <Target className="w-4 h-4 text-amber-500" />
          ) : (
            <TrendingUp className="w-4 h-4 text-blue-500" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-white truncate">{goal.title}</div>
          <div className="text-xs text-stone-500">{getTargetDisplay()}</div>
        </div>
        
        {goal.status === 'completed' ? (
          <Check className="w-5 h-5 text-green-500 shrink-0" />
        ) : daysRemaining !== null && (
          <div className={cn(
            "text-xs font-medium px-2 py-0.5 rounded shrink-0",
            isOverdue ? "bg-red-500/20 text-red-400" :
            isNearDeadline ? "bg-amber-500/20 text-amber-400" :
            "bg-stone-700 text-stone-400"
          )}>
            {isOverdue ? `${Math.abs(daysRemaining)}d late` : `${daysRemaining}d`}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn(
      "p-4 rounded-xl border relative",
      goal.status === 'completed' 
        ? "bg-green-500/10 border-green-500/30"
        : goal.status === 'archived'
        ? "bg-stone-900/50 border-stone-800 opacity-60"
        : "bg-stone-800 border-stone-700"
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            isGradeGoal ? "bg-amber-500/20" : "bg-blue-500/20"
          )}>
            {isGradeGoal ? (
              <Target className="w-5 h-5 text-amber-500" />
            ) : (
              <TrendingUp className="w-5 h-5 text-blue-500" />
            )}
          </div>
          <div>
            <h3 className={cn(
              "font-semibold",
              goal.status === 'completed' ? "text-green-400" : "text-white"
            )}>
              {goal.title}
            </h3>
            <p className="text-xs text-stone-500 capitalize">{goal.type} goal</p>
          </div>
        </div>
        
        {/* Actions menu */}
        {goal.status === 'active' && (
          <div className="relative">
            <button 
              onClick={() => setShowActions(!showActions)}
              className="p-1.5 hover:bg-stone-700 rounded"
            >
              <MoreVertical className="w-4 h-4 text-stone-500" />
            </button>
            
            {showActions && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowActions(false)}
                />
                <div className="absolute right-0 top-8 z-20 bg-stone-900 border border-stone-700 rounded-lg shadow-xl overflow-hidden min-w-[140px]">
                  <button 
                    onClick={() => { onComplete(goal.id); setShowActions(false); }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-stone-800 flex items-center gap-2 text-green-400"
                  >
                    <Check className="w-4 h-4" /> Complete
                  </button>
                  <button 
                    onClick={() => { onArchive(goal.id); setShowActions(false); }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-stone-800 flex items-center gap-2 text-stone-400"
                  >
                    <Archive className="w-4 h-4" /> Archive
                  </button>
                  <button 
                    onClick={() => { onDelete(goal.id); setShowActions(false); }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-stone-800 flex items-center gap-2 text-red-400"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        )}
        
        {goal.status === 'completed' && (
          <div className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded">
            ✓ DONE
          </div>
        )}
      </div>
      
      {/* Target Details */}
      <div className="bg-stone-900/50 rounded-lg p-3 mb-3">
        <div className="text-xs text-stone-500 mb-1">TARGET</div>
        <div className="text-lg font-bold text-white">
          {getTargetDisplay()}
        </div>
        {goal.description && (
          <p className="text-xs text-stone-500 mt-1">{goal.description}</p>
        )}
      </div>
      
      {/* Deadline */}
      {goal.targetDate && (
        <div className={cn(
          "flex items-center gap-2 text-sm",
          isOverdue ? "text-red-400" :
          isNearDeadline ? "text-amber-400" :
          "text-stone-500"
        )}>
          <Calendar className="w-4 h-4" />
          <span>
            {isOverdue 
              ? `Overdue by ${Math.abs(daysRemaining!)} days`
              : daysRemaining === 0 
              ? "Due today"
              : `${daysRemaining} days remaining`
            }
          </span>
        </div>
      )}
      
      {/* Completed info */}
      {goal.status === 'completed' && goal.completedAt && (
        <div className="text-xs text-stone-500 mt-2">
          Completed on {new Date(goal.completedAt).toLocaleDateString()}
        </div>
      )}
    </div>
  );
};
