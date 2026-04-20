import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from './ui/Button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const SNOOZE_KEY = 'ctp.installPrompt.snoozedUntil';
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000;

export const InstallPrompt: React.FC = () => {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const snoozedUntil = Number(localStorage.getItem(SNOOZE_KEY) || '0');
    if (snoozedUntil && Date.now() < snoozedUntil) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    const installedHandler = () => {
      setVisible(false);
      setDeferred(null);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const snooze = () => {
    localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_MS));
    setVisible(false);
  };

  const install = async () => {
    if (!deferred) return;
    try {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === 'dismissed') {
        localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_MS));
      }
    } catch {
      // ignore
    } finally {
      setDeferred(null);
      setVisible(false);
    }
  };

  if (!visible || !deferred) return null;

  return (
    <div
      role="dialog"
      aria-label="Install Climbing Training Planner"
      className="fixed inset-x-0 bottom-20 z-50 mx-auto max-w-md px-4"
    >
      <div className="rounded-xl border border-stone-700 bg-stone-900 shadow-lg p-4 flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
          <Download size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-stone-100 font-semibold text-sm">
            Install Climbing Training Planner
          </p>
          <p className="text-stone-400 text-xs mt-0.5">
            Add to your home screen for faster access and offline support.
          </p>
          <div className="flex gap-2 mt-3">
            <Button variant="primary" onClick={install} className="text-xs py-1.5 px-3">
              Install
            </Button>
            <Button variant="ghost" onClick={snooze} className="text-xs py-1.5 px-3">
              Not now
            </Button>
          </div>
        </div>
        <button
          type="button"
          aria-label="Dismiss install prompt"
          onClick={snooze}
          className="text-stone-500 hover:text-stone-300 flex-shrink-0"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};
