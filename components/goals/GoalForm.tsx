import React, { useState } from 'react';
import {
  Goal,
  GoalType,
  GradeGoal,
  VolumeGoal,
  StrengthGoal,
  ProjectGoal,
  CompGoal,
  RehabGoal,
  isGradeGoal,
  isVolumeGoal,
  isStrengthGoal,
  isProjectGoal,
  isCompGoal,
  isRehabGoal,
} from '../../types';
import { useStore } from '../../context/StoreContext';
import { grades, cn } from '../../utils';
import { Button } from '../ui/Button';
import {
  X,
  Target,
  Dumbbell,
  BarChart3,
  Mountain,
  Trophy,
  HeartPulse,
} from 'lucide-react';

interface GoalFormProps {
  onClose: () => void;
  editGoal?: Goal;
}

const TYPE_OPTIONS: { id: GoalType; label: string; icon: React.ReactNode }[] = [
  { id: 'grade', label: 'Grade', icon: <Target className="w-5 h-5" /> },
  { id: 'volume', label: 'Volume', icon: <BarChart3 className="w-5 h-5" /> },
  { id: 'strength', label: 'Strength', icon: <Dumbbell className="w-5 h-5" /> },
  { id: 'project', label: 'Project', icon: <Mountain className="w-5 h-5" /> },
  { id: 'comp', label: 'Comp', icon: <Trophy className="w-5 h-5" /> },
  { id: 'rehab', label: 'Rehab', icon: <HeartPulse className="w-5 h-5" /> },
];

export const GoalForm: React.FC<GoalFormProps> = ({ onClose, editGoal }) => {
  const { addGoal, updateGoal } = useStore();

  const [goalType, setGoalType] = useState<GoalType>(editGoal?.type || 'grade');
  const [notes, setNotes] = useState(editGoal?.notes || editGoal?.description || '');
  const [deadline, setDeadline] = useState(editGoal?.deadline || editGoal?.targetDate || '');

  // Grade
  const [targetGrade, setTargetGrade] = useState(
    editGoal && isGradeGoal(editGoal) ? editGoal.targetGrade : 'V5',
  );
  const [discipline, setDiscipline] = useState<'boulder' | 'sport' | 'trad'>(
    editGoal && isGradeGoal(editGoal) ? editGoal.discipline : 'boulder',
  );

  // Volume
  const [volumeCount, setVolumeCount] = useState(
    editGoal && isVolumeGoal(editGoal) ? editGoal.targetCount : 8,
  );
  const [volumeUnit, setVolumeUnit] = useState<'sessions' | 'hours' | 'climbs'>(
    editGoal && isVolumeGoal(editGoal) ? editGoal.unit : 'sessions',
  );
  const [volumeWindow, setVolumeWindow] = useState<'weekly' | 'monthly' | 'block'>(
    editGoal && isVolumeGoal(editGoal) ? editGoal.window : 'monthly',
  );

  // Strength
  const [metric, setMetric] = useState<StrengthGoal['metric']>(
    editGoal && isStrengthGoal(editGoal) ? editGoal.metric : 'maxHang',
  );
  const [targetKg, setTargetKg] = useState(
    editGoal && isStrengthGoal(editGoal) ? editGoal.targetKg ?? 20 : 20,
  );
  const [durationSec, setDurationSec] = useState(
    editGoal && isStrengthGoal(editGoal) ? editGoal.durationSec ?? 10 : 10,
  );
  const [customLabel, setCustomLabel] = useState(
    editGoal && isStrengthGoal(editGoal) ? editGoal.customLabel ?? '' : '',
  );

  // Project
  const [routeName, setRouteName] = useState(
    editGoal && isProjectGoal(editGoal) ? editGoal.routeName : '',
  );
  const [projectCrag, setProjectCrag] = useState(
    editGoal && isProjectGoal(editGoal) ? editGoal.crag ?? '' : '',
  );
  const [projectGrade, setProjectGrade] = useState(
    editGoal && isProjectGoal(editGoal) ? editGoal.grade ?? '' : '',
  );

  // Comp
  const [compName, setCompName] = useState(
    editGoal && isCompGoal(editGoal) ? editGoal.compName : '',
  );
  const [compDate, setCompDate] = useState(
    editGoal && isCompGoal(editGoal) ? editGoal.date : '',
  );
  const [placementTarget, setPlacementTarget] = useState(
    editGoal && isCompGoal(editGoal) ? editGoal.placementTarget ?? '' : '',
  );

  // Rehab
  const [injury, setInjury] = useState(
    editGoal && isRehabGoal(editGoal) ? editGoal.injury : '',
  );
  const [phase, setPhase] = useState<RehabGoal['phase']>(
    editGoal && isRehabGoal(editGoal) ? editGoal.phase : 'sub-acute',
  );
  const [clearedBy, setClearedBy] = useState(
    editGoal && isRehabGoal(editGoal) ? editGoal.clearedBy ?? '' : '',
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const common = {
      notes: notes || undefined,
      deadline: deadline || undefined,
    };

    let goalData: Omit<Goal, 'id' | 'createdAt' | 'status'>;
    switch (goalType) {
      case 'grade': {
        const g: Omit<GradeGoal, 'id' | 'createdAt' | 'status'> = {
          ...common,
          type: 'grade',
          targetGrade,
          discipline,
        };
        goalData = g;
        break;
      }
      case 'volume': {
        const g: Omit<VolumeGoal, 'id' | 'createdAt' | 'status'> = {
          ...common,
          type: 'volume',
          targetCount: volumeCount,
          unit: volumeUnit,
          window: volumeWindow,
        };
        goalData = g;
        break;
      }
      case 'strength': {
        const g: Omit<StrengthGoal, 'id' | 'createdAt' | 'status'> = {
          ...common,
          type: 'strength',
          metric,
          targetKg: targetKg || undefined,
          durationSec:
            metric === 'oneArmHang' || metric === 'maxHang' ? durationSec || undefined : undefined,
          customLabel: metric === 'custom' ? customLabel || undefined : undefined,
        };
        goalData = g;
        break;
      }
      case 'project': {
        const g: Omit<ProjectGoal, 'id' | 'createdAt' | 'status'> = {
          ...common,
          type: 'project',
          routeName,
          crag: projectCrag || undefined,
          grade: projectGrade || undefined,
        };
        goalData = g;
        break;
      }
      case 'comp': {
        const g: Omit<CompGoal, 'id' | 'createdAt' | 'status'> = {
          ...common,
          type: 'comp',
          compName,
          date: compDate,
          placementTarget: placementTarget || undefined,
        };
        goalData = g;
        break;
      }
      case 'rehab': {
        const g: Omit<RehabGoal, 'id' | 'createdAt' | 'status'> = {
          ...common,
          type: 'rehab',
          injury,
          phase,
          clearedBy: clearedBy || undefined,
        };
        goalData = g;
        break;
      }
    }

    if (editGoal) {
      updateGoal({ ...editGoal, ...goalData } as Goal);
    } else {
      addGoal(goalData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end justify-center z-50">
      <div className="bg-stone-900 w-full max-w-md rounded-t-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-stone-900 border-b border-stone-800 p-4 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">{editGoal ? 'Edit Goal' : 'New Goal'}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-800 rounded-lg"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-stone-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-5">
          <div>
            <label className="text-xs text-stone-400 block mb-2">GOAL TYPE</label>
            <div className="grid grid-cols-3 gap-2">
              {TYPE_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setGoalType(opt.id)}
                  className={cn(
                    'p-3 rounded-lg border flex flex-col items-center gap-1 transition-colors text-xs font-medium',
                    goalType === opt.id
                      ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                      : 'bg-stone-800 border-stone-700 text-stone-400 hover:border-stone-600',
                  )}
                  aria-pressed={goalType === opt.id}
                >
                  {opt.icon}
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

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
                  <div className="flex-1 text-center text-3xl font-bold text-amber-500">
                    {targetGrade}
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
                <label className="text-xs text-stone-400 block mb-2">DISCIPLINE</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['boulder', 'sport', 'trad'] as const).map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDiscipline(d)}
                      className={cn(
                        'py-2 px-3 rounded-lg border text-sm font-medium capitalize',
                        discipline === d
                          ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                          : 'bg-stone-800 border-stone-700 text-stone-400',
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {goalType === 'volume' && (
            <>
              <div>
                <label className="text-xs text-stone-400 block mb-2">TARGET COUNT</label>
                <input
                  type="number"
                  min={1}
                  value={volumeCount}
                  onChange={e => setVolumeCount(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-xs text-stone-400 block mb-2">UNIT</label>
                <select
                  value={volumeUnit}
                  onChange={e => setVolumeUnit(e.target.value as typeof volumeUnit)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="sessions">sessions</option>
                  <option value="hours">hours</option>
                  <option value="climbs">climbs</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-stone-400 block mb-2">WINDOW</label>
                <select
                  value={volumeWindow}
                  onChange={e => setVolumeWindow(e.target.value as typeof volumeWindow)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="weekly">weekly</option>
                  <option value="monthly">monthly</option>
                  <option value="block">block</option>
                </select>
              </div>
            </>
          )}

          {goalType === 'strength' && (
            <>
              <div>
                <label className="text-xs text-stone-400 block mb-2">METRIC</label>
                <select
                  value={metric}
                  onChange={e => setMetric(e.target.value as StrengthGoal['metric'])}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="maxHang">Max hang</option>
                  <option value="weightedPullup">Weighted pull-up</option>
                  <option value="oneArmHang">One-arm hang</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              {metric === 'custom' && (
                <div>
                  <label className="text-xs text-stone-400 block mb-2">CUSTOM LABEL</label>
                  <input
                    type="text"
                    value={customLabel}
                    onChange={e => setCustomLabel(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white"
                    placeholder="e.g. Campus rung 1-4-7"
                  />
                </div>
              )}
              <div>
                <label className="text-xs text-stone-400 block mb-2">TARGET WEIGHT (kg)</label>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={targetKg}
                  onChange={e => setTargetKg(parseFloat(e.target.value) || 0)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
              {(metric === 'maxHang' || metric === 'oneArmHang') && (
                <div>
                  <label className="text-xs text-stone-400 block mb-2">HANG DURATION (s)</label>
                  <input
                    type="number"
                    min={1}
                    value={durationSec}
                    onChange={e => setDurationSec(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              )}
            </>
          )}

          {goalType === 'project' && (
            <>
              <div>
                <label className="text-xs text-stone-400 block mb-2">ROUTE NAME</label>
                <input
                  type="text"
                  value={routeName}
                  onChange={e => setRouteName(e.target.value)}
                  required
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white"
                  placeholder="e.g. Biographie"
                />
              </div>
              <div>
                <label className="text-xs text-stone-400 block mb-2">CRAG (optional)</label>
                <input
                  type="text"
                  value={projectCrag}
                  onChange={e => setProjectCrag(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-xs text-stone-400 block mb-2">GRADE (optional)</label>
                <input
                  type="text"
                  value={projectGrade}
                  onChange={e => setProjectGrade(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white"
                  placeholder="e.g. 5.15a"
                />
              </div>
            </>
          )}

          {goalType === 'comp' && (
            <>
              <div>
                <label className="text-xs text-stone-400 block mb-2">COMP NAME</label>
                <input
                  type="text"
                  value={compName}
                  onChange={e => setCompName(e.target.value)}
                  required
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-xs text-stone-400 block mb-2">DATE</label>
                <input
                  type="date"
                  value={compDate}
                  onChange={e => setCompDate(e.target.value)}
                  required
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-xs text-stone-400 block mb-2">
                  PLACEMENT TARGET (optional)
                </label>
                <input
                  type="text"
                  value={placementTarget}
                  onChange={e => setPlacementTarget(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white"
                  placeholder="e.g. Top 10"
                />
              </div>
            </>
          )}

          {goalType === 'rehab' && (
            <>
              <div>
                <label className="text-xs text-stone-400 block mb-2">INJURY</label>
                <input
                  type="text"
                  value={injury}
                  onChange={e => setInjury(e.target.value)}
                  required
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white"
                  placeholder="e.g. A2 pulley"
                />
              </div>
              <div>
                <label className="text-xs text-stone-400 block mb-2">PHASE</label>
                <select
                  value={phase}
                  onChange={e => setPhase(e.target.value as RehabGoal['phase'])}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="acute">Acute</option>
                  <option value="sub-acute">Sub-acute</option>
                  <option value="return-to-climb">Return to climb</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-stone-400 block mb-2">CLEARED BY (optional)</label>
                <input
                  type="text"
                  value={clearedBy}
                  onChange={e => setClearedBy(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white"
                  placeholder="e.g. Dr. Smith"
                />
              </div>
            </>
          )}

          <div>
            <label className="text-xs text-stone-400 block mb-2">NOTES (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white resize-none"
              rows={2}
            />
          </div>

          {goalType !== 'comp' && (
            <div>
              <label className="text-xs text-stone-400 block mb-2">DEADLINE (optional)</label>
              <input
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
          )}

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
