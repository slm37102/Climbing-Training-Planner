import React from 'react';
import { ArrowLeft, Info, BookOpen } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import {
  GRADE_SYSTEMS,
  GRADE_SYSTEM_LABELS,
  GradeSystem,
} from '../utils/grades';
import { glossaryList } from '../data/glossary';

interface SettingsProps {
  onBack: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const { settings, updateSettings } = useStore();

  const handleChange = (value: GradeSystem) => {
    updateSettings({ defaultGradeSystem: value });
  };

  return (
    <div className="pb-20 space-y-6">
      <header className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 -ml-2 text-stone-400 hover:text-stone-200"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-stone-100">Settings</h1>
      </header>

      <section className="bg-stone-800 rounded-xl border border-stone-700 p-4 space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-stone-200 uppercase tracking-wide">
            Preferred Grade System
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Used for logging and displaying grades by default.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {GRADE_SYSTEMS.map(sys => (
            <label
              key={sys}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                settings.defaultGradeSystem === sys
                  ? 'border-amber-500 bg-amber-500/10'
                  : 'border-stone-700 bg-stone-900/40 hover:border-stone-600'
              }`}
            >
              <input
                type="radio"
                name="gradeSystem"
                value={sys}
                checked={settings.defaultGradeSystem === sys}
                onChange={() => handleChange(sys)}
                className="accent-amber-500"
              />
              <div className="flex-1">
                <div className="text-stone-100 font-medium">{sys}</div>
                <div className="text-xs text-stone-500">
                  {GRADE_SYSTEM_LABELS[sys]}
                </div>
              </div>
            </label>
          ))}
        </div>

        <div className="flex gap-2 text-xs text-stone-500 bg-stone-900/50 p-3 rounded-lg border border-stone-700/50">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>
            Conversions between systems are approximate. Boulder ↔ sport
            (V/Font ↔ YDS/French) mappings are especially rough and should
            be treated as rough guides.
          </p>
        </div>
      </section>

      <section className="bg-stone-800 rounded-xl border border-stone-700 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-semibold text-stone-200 uppercase tracking-wide">
            Glossary
          </h2>
        </div>
        <p className="text-xs text-stone-500">
          Training jargon translated to plain English. Terms are also
          available as inline tooltips throughout the app.
        </p>
        <dl className="divide-y divide-stone-700/60">
          {glossaryList().map(entry => (
            <div key={entry.term} className="py-2">
              <dt className="text-sm font-medium text-amber-300">{entry.term}</dt>
              <dd className="text-xs text-stone-400 mt-0.5 leading-relaxed">
                {entry.short}
                {entry.long && (
                  <span className="block text-stone-500 mt-1">{entry.long}</span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
};
