import React, { useMemo, useState } from 'react';
import { ArrowLeft, AlertTriangle, Info, BookOpen, Ruler, Timer as TimerIcon } from 'lucide-react';
import { AppView, HangboardPillar, HangboardProtocol, WorkoutType, Workout } from '../types';
import { HANGBOARD_PROTOCOLS, protocolToWorkoutInput } from '../data/hangboardProtocols';
import { useStore } from '../context/StoreContext';
import { Button } from '../components/ui/Button';
import { cn } from '../utils';

interface HangboardPickerProps {
  onNavigate: (view: AppView) => void;
}

const PILLAR_ORDER: HangboardPillar[] = ['MaxStrength', 'Endurance', 'Frequency'];

const PILLAR_META: Record<HangboardPillar, { label: string; blurb: string }> = {
  MaxStrength: {
    label: 'Max Strength',
    blurb: 'Short, heavy hangs that drive peak finger strength.'
  },
  Endurance: {
    label: 'Endurance',
    blurb: 'Higher-volume work that builds forearm capacity and strength-endurance.'
  },
  Frequency: {
    label: 'Frequency',
    blurb: 'Low-stress protocols you can run several times per week for tendon adaptation.'
  }
};

const loadLabel = (p: HangboardProtocol): string => {
  switch (p.loadPrescription) {
    case 'addedWeight':
      return p.loadHint ? `Added weight · ${p.loadHint}` : 'Added weight';
    case 'minEdge':
      return 'Minimum edge (bodyweight)';
    case 'bodyweight':
      return 'Bodyweight';
  }
};

const prescriptionLabel = (p: HangboardProtocol) =>
  `${p.work}s on / ${p.rest}s off × ${p.reps} rep${p.reps === 1 ? '' : 's'} × ${p.sets} set${
    p.sets === 1 ? '' : 's'
  }`;

export const HangboardPicker: React.FC<HangboardPickerProps> = ({ onNavigate }) => {
  const { addWorkout } = useStore();
  const [openTooltipId, setOpenTooltipId] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const out: Record<HangboardPillar, HangboardProtocol[]> = {
      MaxStrength: [],
      Endurance: [],
      Frequency: []
    };
    for (const p of HANGBOARD_PROTOCOLS) out[p.pillar].push(p);
    return out;
  }, []);

  const handlePick = async (protocol: HangboardProtocol) => {
    const base = protocolToWorkoutInput(protocol);
    const workout: Omit<Workout, 'id'> = {
      ...base,
      type: WorkoutType.HANGBOARD
    };
    await addWorkout(workout);
    onNavigate('WORKOUTS');
  };

  return (
    <div className="p-4 space-y-5 pb-24">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onNavigate('WORKOUTS')}
          className="p-2 -ml-2 text-stone-400 hover:text-stone-100"
          aria-label="Back to library"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-stone-100">Pick a hangboard protocol</h1>
          <p className="text-xs text-stone-500">
            Science-backed templates. Picking one creates a new workout pre-filled with the correct
            timer and notes.
          </p>
        </div>
      </div>

      {PILLAR_ORDER.map(pillar => {
        const items = grouped[pillar];
        if (items.length === 0) return null;
        return (
          <section key={pillar} className="space-y-3">
            <div>
              <h2 className="text-sm uppercase tracking-wider text-amber-500 font-semibold">
                {PILLAR_META[pillar].label}
              </h2>
              <p className="text-xs text-stone-500">{PILLAR_META[pillar].blurb}</p>
            </div>

            <div className="grid gap-3">
              {items.map(p => {
                const tooltipOpen = openTooltipId === p.id;
                const hasContra = (p.contraindications?.length ?? 0) > 0;
                return (
                  <div
                    key={p.id}
                    className="bg-stone-800 rounded-xl border border-stone-700 overflow-hidden"
                  >
                    {hasContra && (
                      <div className="flex items-start gap-2 bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 text-xs text-amber-300">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold">Contraindications: </span>
                          {p.contraindications!.join('; ')}
                        </div>
                      </div>
                    )}
                    <div className="p-4 space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <h3 className="font-bold text-stone-100 leading-tight">{p.name}</h3>
                          {p.aka && p.aka.length > 0 && (
                            <p className="text-xs text-stone-500 truncate">
                              aka {p.aka.join(', ')}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setOpenTooltipId(tooltipOpen ? null : p.id)
                          }
                          className={cn(
                            'flex-shrink-0 p-1 rounded text-stone-400 hover:text-amber-400',
                            tooltipOpen && 'text-amber-400'
                          )}
                          aria-label={`Why ${p.name}?`}
                          aria-expanded={tooltipOpen}
                        >
                          <Info className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-xs text-stone-400">{loadLabel(p)}</p>

                      {tooltipOpen && p.rationale && (
                        <div
                          role="tooltip"
                          className="text-xs text-stone-300 bg-stone-900/60 border border-stone-700 rounded-lg p-3"
                        >
                          <span className="font-semibold text-amber-400">Why this protocol? </span>
                          {p.rationale}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-stone-900 border border-stone-700 text-stone-300">
                          <Ruler className="w-3 h-3" />
                          {p.edgeRecommendation.prefer}mm
                          {p.edgeRecommendation.mm.length > 1 && (
                            <span className="text-stone-500">
                              {' '}
                              ({p.edgeRecommendation.mm.join('/')})
                            </span>
                          )}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-stone-900 border border-stone-700 text-stone-300">
                          <TimerIcon className="w-3 h-3" />
                          {prescriptionLabel(p)}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-stone-900 border border-stone-700 text-stone-300">
                          {p.frequencyPerWeek}×/wk
                        </span>
                      </div>

                      <div className="flex items-start gap-1.5 text-[11px] text-stone-500">
                        <BookOpen className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span>
                          {p.source.title} — {p.source.author}
                        </span>
                      </div>

                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => handlePick(p)}
                      >
                        Use this protocol
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
};
