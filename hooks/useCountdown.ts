import { useEffect, useRef, useState } from 'react';

export interface UseCountdownOptions {
  durationMs: number;
  running: boolean;
  onComplete?: () => void;
  /**
   * Change this value to force a reset of the countdown (e.g. when starting a
   * new segment with the same duration as the previous one).
   */
  resetKey?: number | string;
}

export interface UseCountdownResult {
  remainingMs: number;
  elapsedMs: number;
}

/**
 * Timestamp-based countdown hook.
 *
 * Uses `performance.now()` to compute remaining time every animation frame
 * while the tab is visible, falling back to a 250ms interval when hidden so
 * browsers that throttle background timers do not cause drift. On
 * `visibilitychange` the remaining time is recomputed immediately from the
 * anchored start timestamp so the displayed value is correct after returning
 * to the tab.
 */
export function useCountdown({
  durationMs,
  running,
  onComplete,
  resetKey,
}: UseCountdownOptions): UseCountdownResult {
  const [remainingMs, setRemainingMs] = useState(durationMs);

  const startedAtRef = useRef<number | null>(null);
  const elapsedBeforePauseRef = useRef(0);
  const completedRef = useRef(false);

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Full reset on duration / resetKey change.
  useEffect(() => {
    startedAtRef.current = null;
    elapsedBeforePauseRef.current = 0;
    completedRef.current = false;
    setRemainingMs(durationMs);
  }, [durationMs, resetKey]);

  useEffect(() => {
    if (!running) {
      if (startedAtRef.current != null) {
        elapsedBeforePauseRef.current += performance.now() - startedAtRef.current;
        startedAtRef.current = null;
      }
      return;
    }

    if (completedRef.current) return;

    if (startedAtRef.current == null) {
      startedAtRef.current = performance.now();
    }

    let rafId: number | null = null;
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let cancelled = false;

    const compute = () => {
      if (cancelled || startedAtRef.current == null) return;
      const elapsed =
        elapsedBeforePauseRef.current + (performance.now() - startedAtRef.current);
      const remaining = Math.max(0, durationMs - elapsed);
      setRemainingMs(remaining);
      if (remaining <= 0 && !completedRef.current) {
        completedRef.current = true;
        stopLoop();
        onCompleteRef.current?.();
      }
    };

    const tickRaf = () => {
      compute();
      if (!cancelled && !completedRef.current) {
        rafId = requestAnimationFrame(tickRaf);
      }
    };

    const stopLoop = () => {
      if (rafId != null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      if (intervalId != null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const startLoop = () => {
      stopLoop();
      if (cancelled || completedRef.current) return;
      if (typeof document !== 'undefined' && document.hidden) {
        // rAF is paused in hidden tabs; use a throttled interval instead.
        intervalId = setInterval(compute, 250);
      } else if (typeof requestAnimationFrame === 'function') {
        rafId = requestAnimationFrame(tickRaf);
      } else {
        intervalId = setInterval(compute, 250);
      }
    };

    const handleVisibility = () => {
      compute();
      startLoop();
    };

    startLoop();
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibility);
    }

    return () => {
      cancelled = true;
      stopLoop();
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibility);
      }
    };
  }, [running, durationMs, resetKey]);

  const elapsedMs = Math.max(0, Math.min(durationMs, durationMs - remainingMs));
  return { remainingMs, elapsedMs };
}
