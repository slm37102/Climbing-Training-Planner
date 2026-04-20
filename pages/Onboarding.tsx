import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { cn } from '../utils';
import { listGrades } from '../utils/grades';
import type { OnboardingProfile } from '../types';
import type { GradeSystem } from '../utils/grades';

export interface OnboardingAnswers {
  profile: OnboardingProfile;
  defaultGradeSystem: GradeSystem;
}

interface OnboardingProps {
  onComplete: (answers: OnboardingAnswers | null) => void;
  initialDisplayName?: string;
}

type GradePreference = 'V' | 'Font' | 'Both';

const GOALS: { id: NonNullable<OnboardingProfile['primaryGoal']>; label: string; hint: string }[] = [
  { id: 'fun', label: 'Just have fun', hint: 'Climb when I feel like it' },
  { id: 'plateau', label: 'Break a plateau', hint: 'Get structured and progress' },
  { id: 'project', label: 'Send a project', hint: 'Peak for a specific route / boulder' },
  { id: 'compete', label: 'Compete', hint: 'Prep for a comp' },
  { id: 'injury', label: 'Return from injury', hint: 'Conservative rebuild' },
];

const INJURY_OPTIONS: { id: NonNullable<OnboardingProfile['injuryHistory']>; label: string }[] = [
  { id: 'none', label: 'No significant injuries' },
  { id: 'finger_past', label: 'Past finger injury (healed)' },
  { id: 'shoulder_past', label: 'Past shoulder injury (healed)' },
  { id: 'managing', label: 'Currently managing an injury' },
];

const TOTAL_STEPS = 7;

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, initialDisplayName }) => {
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState(initialDisplayName ?? '');
  const [gradePref, setGradePref] = useState<GradePreference>('V');
  const [topBoulder, setTopBoulder] = useState<string>('V2');
  const [topRope, setTopRope] = useState<string>('5.10a');
  const [primaryGoal, setPrimaryGoal] = useState<OnboardingProfile['primaryGoal']>();
  const [frequency, setFrequency] = useState<number>(3);
  const [injuryHistory, setInjuryHistory] = useState<OnboardingProfile['injuryHistory']>('none');
  const [equipment, setEquipment] = useState({ hangboard: false, board: false, freeWeights: false });

  const boulderGradesV = listGrades('V');
  const boulderGradesFont = listGrades('Font');
  const ropeGradesYDS = listGrades('YDS');

  const canGoNext = (): boolean => {
    if (step === 4) return !!primaryGoal;
    return true;
  };

  const goNext = () => {
    if (step < TOTAL_STEPS) setStep(step + 1);
    else finish();
  };
  const goBack = () => { if (step > 1) setStep(step - 1); };

  const finish = () => {
    const defaultGradeSystem: GradeSystem = gradePref === 'Font' ? 'Font' : 'V';
    const profile: OnboardingProfile = {
      displayName: displayName.trim() || undefined,
      topBoulderGrade: topBoulder || undefined,
      topRopeGrade: topRope || undefined,
      primaryGoal,
      frequencyPerWeek: frequency,
      injuryHistory,
      equipment,
    };
    onComplete({ profile, defaultGradeSystem });
  };

  const boulderList = gradePref === 'Font' ? boulderGradesFont : boulderGradesV;

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col">
      <header className="flex items-center justify-between px-5 pt-6 pb-3">
        <div className="text-sm text-stone-400">Step {step} of {TOTAL_STEPS}</div>
        <button
          type="button"
          onClick={() => onComplete(null)}
          className="text-xs text-stone-400 hover:text-amber-400 underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:ring-offset-2 focus:ring-offset-stone-900 rounded px-2 py-1 flex items-center gap-1"
          aria-label="Skip onboarding"
        >
          <X className="w-3 h-3" /> Skip
        </button>
      </header>

      <div className="px-5">
        <div className="h-1 w-full bg-stone-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 transition-all"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      <main className="flex-1 px-5 py-8 max-w-md w-full mx-auto">
        {step === 1 && (
          <section>
            <h1 className="text-2xl font-bold mb-2">What should we call you?</h1>
            <p className="text-stone-400 text-sm mb-6">Optional — leave blank to skip.</p>
            <label htmlFor="displayName" className="sr-only">Display name</label>
            <input
              id="displayName"
              autoFocus
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className="w-full bg-stone-800 border border-stone-700 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </section>
        )}

        {step === 2 && (
          <section>
            <h1 className="text-2xl font-bold mb-2">Preferred grade system</h1>
            <p className="text-stone-400 text-sm mb-6">We'll default your log to this.</p>
            <fieldset className="space-y-3">
              <legend className="sr-only">Grade system</legend>
              {(['V', 'Font', 'Both'] as GradePreference[]).map((val) => (
                <label
                  key={val}
                  className={cn(
                    'flex items-center gap-3 p-4 border rounded-lg cursor-pointer',
                    'focus-within:ring-2 focus-within:ring-amber-500',
                    gradePref === val ? 'border-amber-500 bg-amber-500/10' : 'border-stone-700 bg-stone-800'
                  )}
                >
                  <input
                    type="radio"
                    name="gradeSystem"
                    value={val}
                    checked={gradePref === val}
                    onChange={() => setGradePref(val)}
                    className="accent-amber-500"
                  />
                  <span className="font-medium">
                    {val === 'V' ? 'V-Scale (boulder)' : val === 'Font' ? 'Fontainebleau' : 'Both (V default)'}
                  </span>
                </label>
              ))}
            </fieldset>
          </section>
        )}

        {step === 3 && (
          <section>
            <h1 className="text-2xl font-bold mb-2">Your current top grades</h1>
            <p className="text-stone-400 text-sm mb-6">Rough is fine — you can change this anytime.</p>
            <div className="space-y-4">
              <div>
                <label htmlFor="topBoulder" className="block text-sm text-stone-300 mb-1">Top boulder grade</label>
                <select
                  id="topBoulder"
                  value={topBoulder}
                  onChange={(e) => setTopBoulder(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {boulderList.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="topRope" className="block text-sm text-stone-300 mb-1">Top rope grade</label>
                <select
                  id="topRope"
                  value={topRope}
                  onChange={(e) => setTopRope(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {ropeGradesYDS.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>
          </section>
        )}

        {step === 4 && (
          <section>
            <h1 className="text-2xl font-bold mb-2">Your primary goal</h1>
            <p className="text-stone-400 text-sm mb-6">Pick the one that fits best right now.</p>
            <div className="grid grid-cols-1 gap-3">
              {GOALS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setPrimaryGoal(g.id)}
                  className={cn(
                    'text-left p-4 rounded-lg border transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-amber-500',
                    primaryGoal === g.id
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-stone-700 bg-stone-800 hover:border-stone-500'
                  )}
                  aria-pressed={primaryGoal === g.id}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{g.label}</span>
                    {primaryGoal === g.id && <Check className="w-4 h-4 text-amber-400" />}
                  </div>
                  <div className="text-xs text-stone-400 mt-1">{g.hint}</div>
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 5 && (
          <section>
            <h1 className="text-2xl font-bold mb-2">Training frequency</h1>
            <p className="text-stone-400 text-sm mb-6">How many days per week can you train?</p>
            <div className="flex items-center justify-between gap-4">
              <label htmlFor="frequency" className="sr-only">Days per week</label>
              <input
                id="frequency"
                type="range"
                min={2}
                max={6}
                step={1}
                value={frequency}
                onChange={(e) => setFrequency(Number(e.target.value))}
                className="flex-1 accent-amber-500"
              />
              <div className="text-2xl font-bold w-12 text-right text-amber-400">{frequency}×</div>
            </div>
            <div className="flex justify-between text-xs text-stone-500 mt-2 px-1">
              <span>2</span><span>3</span><span>4</span><span>5</span><span>6</span>
            </div>
          </section>
        )}

        {step === 6 && (
          <section>
            <h1 className="text-2xl font-bold mb-2">Injury history</h1>
            <p className="text-stone-400 text-sm mb-6">Helps us avoid recommending anything risky.</p>
            <div className="space-y-3">
              {INJURY_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setInjuryHistory(opt.id)}
                  className={cn(
                    'w-full text-left p-4 rounded-lg border transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-amber-500',
                    injuryHistory === opt.id
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-stone-700 bg-stone-800 hover:border-stone-500'
                  )}
                  aria-pressed={injuryHistory === opt.id}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{opt.label}</span>
                    {injuryHistory === opt.id && <Check className="w-4 h-4 text-amber-400" />}
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 7 && (
          <section>
            <h1 className="text-2xl font-bold mb-2">Equipment access</h1>
            <p className="text-stone-400 text-sm mb-6">What do you have regular access to?</p>
            <div className="space-y-3">
              {([
                { key: 'hangboard', label: 'Hangboard' },
                { key: 'board', label: 'Training board (MoonBoard / Kilter / Tension)' },
                { key: 'freeWeights', label: 'Free weights' },
              ] as const).map((item) => (
                <label
                  key={item.key}
                  className="flex items-center justify-between p-4 rounded-lg border border-stone-700 bg-stone-800 cursor-pointer focus-within:ring-2 focus-within:ring-amber-500"
                >
                  <span className="font-medium">{item.label}</span>
                  <input
                    type="checkbox"
                    checked={equipment[item.key]}
                    onChange={(e) => setEquipment({ ...equipment, [item.key]: e.target.checked })}
                    className="w-5 h-5 accent-amber-500"
                    aria-label={item.label}
                  />
                </label>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="px-5 pb-8 pt-2 max-w-md w-full mx-auto flex items-center gap-3">
        <Button
          variant="secondary"
          onClick={goBack}
          disabled={step === 1}
          aria-label="Previous step"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button
          variant="primary"
          onClick={goNext}
          disabled={!canGoNext()}
          className="flex-1"
          aria-label={step === TOTAL_STEPS ? 'Finish onboarding' : 'Next step'}
        >
          {step === TOTAL_STEPS ? 'Finish' : 'Next'}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </footer>
    </div>
  );
};

export default Onboarding;
