import React from 'react';
import { cn, TimeRange } from '../../utils';

interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}

const options: { value: TimeRange; label: string }[] = [
  { value: 'week', label: '7 Days' },
  { value: 'month', label: '4 Weeks' },
  { value: 'quarter', label: '3 Months' }
];

export const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="flex bg-stone-800 rounded-lg p-1 border border-stone-700">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
            value === opt.value
              ? "bg-amber-500 text-stone-900"
              : "text-stone-400 hover:text-stone-200"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};
