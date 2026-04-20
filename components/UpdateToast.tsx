import React from 'react';
import { RefreshCw, X } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from './ui/Button';

export const UpdateToast: React.FC = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(error) {
      // eslint-disable-next-line no-console
      console.error('SW registration error', error);
    },
  });

  if (!needRefresh) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 top-3 z-50 mx-auto max-w-md px-4"
    >
      <div className="rounded-xl border border-stone-700 bg-stone-900 shadow-lg p-3 flex items-center gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
          <RefreshCw size={16} />
        </div>
        <p className="flex-1 text-stone-100 text-sm">New version available</p>
        <Button
          variant="primary"
          onClick={() => updateServiceWorker(true)}
          className="text-xs py-1.5 px-3"
        >
          Refresh
        </Button>
        <button
          type="button"
          aria-label="Dismiss update notification"
          onClick={() => setNeedRefresh(false)}
          className="text-stone-500 hover:text-stone-300 flex-shrink-0"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};
