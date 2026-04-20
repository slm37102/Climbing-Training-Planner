import React from 'react';
import { Activity } from 'lucide-react';
import { cn } from '../utils';
import { readinessBand } from '../utils/readiness';

interface ReadinessPillProps {
  score?: number;
  onClick: () => void;
}

export const ReadinessPill: React.FC<ReadinessPillProps> = ({ score, onClick }) => {
  if (score == null) {
    return (
      <button
        onClick={onClick}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-colors"
        aria-label="Readiness check-in"
      >
        <Activity className="w-3.5 h-3.5" />
        Check in
      </button>
    );
  }

  const band = readinessBand(score);
  const cls =
    band === 'green'
      ? 'border-green-500/40 bg-green-500/10 text-green-300 hover:bg-green-500/20'
      : band === 'amber'
      ? 'border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
      : 'border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20';

  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors',
        cls
      )}
      aria-label={`Readiness ${score} of 10 (${band})`}
      title="Update readiness"
    >
      <Activity className="w-3.5 h-3.5" />
      Readiness {score}/10
    </button>
  );
};
