import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../utils';

interface StatCardProps {
  label: string;
  value: string | number;
  comparison?: {
    value: number;
    direction: 'up' | 'down' | 'same';
  };
  highlight?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, comparison, highlight }) => {
  return (
    <div className={cn(
      "bg-stone-800 p-4 rounded-xl border border-stone-700",
      highlight && "border-amber-500/50"
    )}>
      <div className="text-stone-400 text-xs mb-1 uppercase tracking-wider">{label}</div>
      <div className={cn(
        "text-2xl font-bold",
        highlight ? "text-amber-500" : "text-stone-100"
      )}>
        {value}
      </div>
      {comparison && comparison.direction !== 'same' && (
        <div className={cn(
          "text-xs mt-1 flex items-center gap-1",
          comparison.direction === 'up' ? "text-green-400" : "text-red-400"
        )}>
          {comparison.direction === 'up' ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          <span>{comparison.value}% vs last period</span>
        </div>
      )}
    </div>
  );
};
