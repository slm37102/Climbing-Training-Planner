import React, { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '../utils';
import { Readiness } from '../types';
import { computeReadinessScore, readinessBand, ReadinessInput } from '../utils/readiness';

interface ReadinessCheckInProps {
  onSave: (readiness: Readiness) => void;
  onCancel: () => void;
  initial?: Partial<ReadinessInput>;
}

const bandClass = (band: 'green' | 'amber' | 'red') =>
  band === 'green'
    ? 'bg-green-500/20 text-green-300 border-green-500/40'
    : band === 'amber'
    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
    : 'bg-red-500/20 text-red-300 border-red-500/40';

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  hintLow: string;
  hintHigh: string;
  onChange: (v: number) => void;
}

const SliderRow: React.FC<SliderRowProps> = ({
  label, value, min, max, step = 1, suffix, hintLow, hintHigh, onChange
}) => (
  <div>
    <div className="flex justify-between items-baseline mb-1">
      <label className="text-sm text-stone-200 font-medium">{label}</label>
      <span className="text-sm text-amber-400 font-mono tabular-nums">
        {value}{suffix ? ` ${suffix}` : ''}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      className="w-full accent-amber-500"
      aria-label={label}
    />
    <div className="flex justify-between text-[10px] text-stone-500 mt-0.5">
      <span>{hintLow}</span>
      <span>{hintHigh}</span>
    </div>
  </div>
);

export const ReadinessCheckIn: React.FC<ReadinessCheckInProps> = ({ onSave, onCancel, initial }) => {
  const [sleep, setSleep]   = useState<number>(initial?.sleep  ?? 7);
  const [skin, setSkin]     = useState<number>(initial?.skin   ?? 4);
  const [energy, setEnergy] = useState<number>(initial?.energy ?? 4);
  const [stress, setStress] = useState<number>(initial?.stress ?? 2);

  const score = useMemo(
    () => computeReadinessScore({ sleep, skin, energy, stress }),
    [sleep, skin, energy, stress]
  );
  const band = readinessBand(score);

  const handleSave = () => {
    onSave({
      sleep, skin, energy, stress,
      score,
      recordedAt: Date.now(),
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Readiness check-in"
    >
      <div className="bg-stone-900 w-full max-w-sm rounded-xl border border-stone-700 p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-white">How are you feeling?</h3>
          <button onClick={onCancel} className="text-stone-500" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-between mb-4 bg-stone-800/60 rounded-lg p-3 border border-stone-700">
          <span className="text-xs text-stone-400 uppercase tracking-wider">Readiness</span>
          <span
            className={cn(
              'px-3 py-1 rounded-full text-sm font-bold border',
              bandClass(band)
            )}
          >
            {score}/10 · {band}
          </span>
        </div>

        <div className="space-y-4">
          <SliderRow
            label="Sleep" value={sleep} min={3} max={10} suffix="h"
            hintLow="3h" hintHigh="10h"
            onChange={setSleep}
          />
          <SliderRow
            label="Energy" value={energy} min={1} max={5}
            hintLow="Drained" hintHigh="Firing"
            onChange={setEnergy}
          />
          <SliderRow
            label="Skin" value={skin} min={1} max={5}
            hintLow="Shredded" hintHigh="Fresh"
            onChange={setSkin}
          />
          <SliderRow
            label="Stress" value={stress} min={1} max={5}
            hintLow="Calm" hintHigh="Frazzled"
            onChange={setStress}
          />
        </div>

        <div className="flex gap-2 mt-5">
          <Button variant="outline" className="flex-1" onClick={onCancel}>Cancel</Button>
          <Button className="flex-1" onClick={handleSave}>Save</Button>
        </div>
      </div>
    </div>
  );
};
