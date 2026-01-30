import React, { useState } from 'react';
import { Goal, GoalType, GradeTarget, StrengthTarget, ExerciseCategory } from '../../types';
import { useStore } from '../../context/StoreContext';
import { grades, cn } from '../../utils';
import { Button } from '../ui/Button';
import { X, Target, TrendingUp } from 'lucide-react';

interface GoalFormProps {
  onClose: () => void;
  editGoal?: Goal;
}

export const GoalForm: React.FC<GoalFormProps> = ({ onClose, editGoal }) => {
  const { addGoal, updateGoal, exercises, settings } = useStore();
  
  // Form state
  const [goalType, setGoalType] = useState<GoalType>(editGoal?.type || 'grade');
  const [title, setTitle] = useState(editGoal?.title || '');
  const [description, setDescription] = useState(editGoal?.description || '');
  const [hasDeadline, setHasDeadline] = useState(!!editGoal?.targetDate);
  const [targetDate, setTargetDate] = useState(editGoal?.targetDate || '');
  
  // Grade goal state
  const [targetGrade, setTargetGrade] = useState(
    editGoal?.target.type === 'grade' ? (editGoal.target as GradeTarget).grade : 'V5'
  );
  const [gradeStyle, setGradeStyle] = useState<'send' | 'flash' | 'onsight'>(
    editGoal?.target.type === 'grade' ? (editGoal.target as GradeTarget).style : 'send'
  );
  
  // Strength goal state
  const [metric, setMetric] = useState<'added_weight' | 'hold_time' | 'edge_depth'>(
    editGoal?.target.type === 'strength' ? (editGoal.target as StrengthTarget).metric : 'added_weight'
  );
  const [targetValue, setTargetValue] = useState(
    editGoal?.target.type === 'strength' ? (editGoal.target as StrengthTarget).targetValue : 10
  );
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | undefined>(
    editGoal?.target.type === 'strength' ? (editGoal.target as StrengthTarget).exerciseId : undefined
  );
  
  // Get unit based on metric
  const getUnit = () => {
    switch (metric) {
      case 'added_weight': return settings.weightUnit;
      case 'hold_time': return 'seconds';
      case 'edge_depth': return 'mm';
      default: return '';
    }
  };
  
  // Hangboard exercises for linking
  const hangboardExercises = exercises.filter(
    e => e.category === ExerciseCategory.LIMIT_STRENGTH || 
         e.category === ExerciseCategory.STRENGTH_ENDURANCE
  );
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const goalData: Omit<Goal, 'id' | 'createdAt' | 'status'> = {
      title: title || (goalType === 'grade' ? `Send ${targetGrade}` : `${metric.replace('_', ' ')} goal`),
      description: description || undefined,
      type: goalType,
      targetDate: hasDeadline && targetDate ? targetDate : undefined,
      target: goalType === 'grade' 
        ? { type: 'grade', grade: targetGrade, style: gradeStyle } as GradeTarget
        : { 
            type: 'strength', 
            metric, 
            targetValue, 
            unit: getUnit(),
            exerciseId: selectedExerciseId 
          } as StrengthTarget
    };
    
    if (editGoal) {
      updateGoal({
        ...editGoal,
        ...goalData
      });
    } else {
      addGoal(goalData);
    }
    
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-end justify-center z-50">
      <div className="bg-stone-900 w-full max-w-md rounded-t-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-stone-900 border-b border-stone-800 p-4 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">
            {editGoal ? 'Edit Goal' : 'New Goal'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-stone-800 rounded-lg">
            <X className="w-5 h-5 text-stone-400" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-5">
          {/* Goal Type Selector */}
          <div>
            <label className="text-xs text-stone-400 block mb-2">GOAL TYPE</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setGoalType('grade')}
                className={cn(
                  "p-3 rounded-lg border flex items-center gap-2 transition-colors",
                  goalType === 'grade'
                    ? "bg-amber-500/20 border-amber-500 text-amber-400"
                    : "bg-stone-800 border-stone-700 text-stone-400 hover:border-stone-600"
                )}
              >
                <Target className="w-5 h-5" />
                <span className="font-medium">Grade</span>
              </button>
              <button
                type="button"
                onClick={() => setGoalType('strength')}
                className={cn(
                  "p-3 rounded-lg border flex items-center gap-2 transition-colors",
                  goalType === 'strength'
                    ? "bg-blue-500/20 border-blue-500 text-blue-400"
                    : "bg-stone-800 border-stone-700 text-stone-400 hover:border-stone-600"
                )}
              >
                <TrendingUp className="w-5 h-5" />
                <span className="font-medium">Strength</span>
              </button>
            </div>
          </div>
          
          {/* Title */}
          <div>
            <label className="text-xs text-stone-400 block mb-2">TITLE (optional)</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white placeholder-stone-500"
              placeholder={goalType === 'grade' ? `Send ${targetGrade}` : 'My strength goal'}
            />
          </div>
          
          {/* Grade Goal Options */}
          {goalType === 'grade' && (
            <>
              <div>
                <label className="text-xs text-stone-400 block mb-2">TARGET GRADE</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const idx = grades.indexOf(targetGrade);
                      if (idx > 0) setTargetGrade(grades[idx - 1]);
                    }}
                    className="w-10 h-10 rounded-lg bg-stone-700 flex items-center justify-center text-xl font-bold hover:bg-stone-600"
                  >
                    -
                  </button>
                  <div className="flex-1 text-center">
                    <div className="text-3xl font-bold text-amber-500">{targetGrade}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const idx = grades.indexOf(targetGrade);
                      if (idx < grades.length - 1) setTargetGrade(grades[idx + 1]);
                    }}
                    className="w-10 h-10 rounded-lg bg-stone-700 flex items-center justify-center text-xl font-bold hover:bg-stone-600"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div>
                <label className="text-xs text-stone-400 block mb-2">STYLE</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['send', 'flash', 'onsight'] as const).map(style => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setGradeStyle(style)}
                      className={cn(
                        "py-2 px-3 rounded-lg border text-sm font-medium capitalize transition-colors",
                        gradeStyle === style
                          ? "bg-amber-500/20 border-amber-500 text-amber-400"
                          : "bg-stone-800 border-stone-700 text-stone-400"
                      )}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
          
          {/* Strength Goal Options */}
          {goalType === 'strength' && (
            <>
              <div>
                <label className="text-xs text-stone-400 block mb-2">METRIC</label>
                <select
                  value={metric}
                  onChange={e => setMetric(e.target.value as typeof metric)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="added_weight">Added Weight</option>
                  <option value="hold_time">Hold Time</option>
                  <option value="edge_depth">Edge Depth</option>
                </select>
              </div>
              
              <div>
                <label className="text-xs text-stone-400 block mb-2">TARGET VALUE</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={targetValue}
                    onChange={e => setTargetValue(parseFloat(e.target.value) || 0)}
                    className="flex-1 bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white text-right"
                    min={0}
                    step={metric === 'edge_depth' ? 1 : 0.5}
                  />
                  <span className="text-stone-400 w-16">{getUnit()}</span>
                </div>
              </div>
              
              {hangboardExercises.length > 0 && (
                <div>
                  <label className="text-xs text-stone-400 block mb-2">LINK TO EXERCISE (optional)</label>
                  <select
                    value={selectedExerciseId || ''}
                    onChange={e => setSelectedExerciseId(e.target.value || undefined)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="">None</option>
                    {hangboardExercises.map(ex => (
                      <option key={ex.id} value={ex.id}>{ex.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}
          
          {/* Description */}
          <div>
            <label className="text-xs text-stone-400 block mb-2">NOTES (optional)</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white placeholder-stone-500 resize-none"
              rows={2}
              placeholder="Any context for this goal..."
            />
          </div>
          
          {/* Deadline Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-sm text-stone-300">Set a deadline?</label>
            <button
              type="button"
              onClick={() => setHasDeadline(!hasDeadline)}
              className={cn(
                "w-12 h-6 rounded-full transition-colors relative",
                hasDeadline ? "bg-amber-500" : "bg-stone-700"
              )}
            >
              <div className={cn(
                "w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform",
                hasDeadline ? "translate-x-6" : "translate-x-0.5"
              )} />
            </button>
          </div>
          
          {hasDeadline && (
            <div>
              <label className="text-xs text-stone-400 block mb-2">TARGET DATE</label>
              <input
                type="date"
                value={targetDate}
                onChange={e => setTargetDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
          )}
          
          {/* Submit */}
          <div className="pt-2 pb-4">
            <Button type="submit" className="w-full py-3">
              {editGoal ? 'Save Changes' : 'Create Goal'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
