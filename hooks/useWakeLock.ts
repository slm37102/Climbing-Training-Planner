import { useEffect, useState } from 'react';

export interface UseWakeLockResult {
  supported: boolean;
  error: Error | null;
}

/**
 * Screen Wake Lock hook.
 *
 * Holds a `screen` wake lock while `active` is true so the display does not
 * dim or sleep during a timed training set. Browsers release sentinels when
 * the tab is hidden, so we re-acquire on `visibilitychange` -> visible if
 * `active` is still true. Swallows `NotAllowedError` (raised on insecure
 * contexts or without a user gesture) since the timer should still work
 * without the lock.
 *
 * Browser support (as of 2024): Chrome/Edge/Opera desktop + Android, Safari
 * 16.4+, Firefox behind flag. Requires a secure context (HTTPS or localhost).
 */
export function useWakeLock(active: boolean): UseWakeLockResult {
  const supported =
    typeof navigator !== 'undefined' && 'wakeLock' in navigator;
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!supported || !active) return;

    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;

    const acquire = async () => {
      try {
        const next = await (
          navigator as Navigator & { wakeLock: WakeLock }
        ).wakeLock.request('screen');
        if (cancelled) {
          next.release().catch(() => {});
          return;
        }
        sentinel = next;
        sentinel.addEventListener('release', () => {
          if (sentinel === next) sentinel = null;
        });
        setError(null);
      } catch (e) {
        const err = e as Error;
        if (err?.name !== 'NotAllowedError') {
          setError(err);
        }
      }
    };

    const handleVisibility = () => {
      if (
        !cancelled &&
        active &&
        sentinel == null &&
        document.visibilityState === 'visible'
      ) {
        acquire();
      }
    };

    acquire();
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', handleVisibility);
      if (sentinel) {
        sentinel.release().catch(() => {});
        sentinel = null;
      }
    };
  }, [active, supported]);

  return { supported, error };
}
