import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { LoadPoint, weekOverWeekChangePct } from '../utils/load';

interface DeloadBannerProps {
  daily: LoadPoint[];
  onDate: string;
  onSwapTomorrow: () => void;
}

// NOTE: Dismissal is local component state (P0). Opens again on reload /
// remount — acceptable because safety messaging should err on the side of
// showing, and the user will also see the chart on the Progress tab.
// A future iteration can persist `loadBannerDismissedDate` to UserSettings.
export const DeloadBanner: React.FC<DeloadBannerProps> = ({
  daily,
  onDate,
  onSwapTomorrow,
}) => {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const pct = weekOverWeekChangePct(daily, onDate);
  const pctText = pct === null ? null : Math.round(pct);

  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-amber-50 border border-amber-300 text-amber-800 p-4 rounded-xl shadow-lg"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-1">Heads up — heavy training week</h3>
          <p className="text-xs leading-relaxed">
            {pctText !== null && pctText > 0
              ? <>Your training load jumped ~<strong>{pctText}%</strong> this week. </>
              : <>Your recent training load is elevated. </>}
            Sustaining this for 2+ weeks is associated with elevated injury risk
            (Gabbett 2016). Consider a skill / mobility day tomorrow.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={onSwapTomorrow}
              className="bg-amber-800 text-amber-50 text-xs font-medium px-3 py-1.5 rounded-md hover:bg-amber-900 transition-colors"
            >
              Swap tomorrow's workout
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="text-amber-800 text-xs font-medium px-3 py-1.5 rounded-md hover:bg-amber-100 transition-colors"
            >
              Not now
            </button>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss banner"
          className="text-amber-700 hover:text-amber-900"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
