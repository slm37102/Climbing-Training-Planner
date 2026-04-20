import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCountdown } from '../hooks/useCountdown';

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Anchor performance.now() to the fake timers so time math matches
    // the interval/raf ticks.
    let base = 0;
    vi.spyOn(performance, 'now').mockImplementation(() => base + Date.now());
    base = -Date.now(); // make initial performance.now() ≈ 0
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('starts at full duration when not running', () => {
    const { result } = renderHook(() =>
      useCountdown({ durationMs: 5000, running: false }),
    );
    expect(result.current.remainingMs).toBe(5000);
    expect(result.current.elapsedMs).toBe(0);
  });

  it('counts down using timestamps, not tick count', () => {
    // Force hidden so the hook uses the 250ms interval path (rAF is not
    // driven by fake timers in jsdom).
    Object.defineProperty(document, 'hidden', { value: true, configurable: true });

    const { result } = renderHook(() =>
      useCountdown({ durationMs: 5000, running: true }),
    );

    act(() => { vi.advanceTimersByTime(2000); });
    expect(result.current.remainingMs).toBeLessThanOrEqual(3000);
    expect(result.current.remainingMs).toBeGreaterThanOrEqual(2800);

    act(() => { vi.advanceTimersByTime(10000); });
    expect(result.current.remainingMs).toBe(0);
  });

  it('fires onComplete exactly once when remaining hits zero', () => {
    Object.defineProperty(document, 'hidden', { value: true, configurable: true });
    const onComplete = vi.fn();
    renderHook(() =>
      useCountdown({ durationMs: 1000, running: true, onComplete }),
    );

    act(() => { vi.advanceTimersByTime(2000); });
    expect(onComplete).toHaveBeenCalledTimes(1);

    act(() => { vi.advanceTimersByTime(5000); });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('pauses and resumes from the same remaining time', () => {
    Object.defineProperty(document, 'hidden', { value: true, configurable: true });
    const { result, rerender } = renderHook(
      ({ running }) => useCountdown({ durationMs: 5000, running }),
      { initialProps: { running: true } },
    );

    act(() => { vi.advanceTimersByTime(2000); });
    const beforePause = result.current.remainingMs;

    rerender({ running: false });
    act(() => { vi.advanceTimersByTime(10000); });
    // Still paused -> remaining unchanged.
    expect(result.current.remainingMs).toBe(beforePause);

    rerender({ running: true });
    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.remainingMs).toBeLessThan(beforePause);
  });

  it('resets when resetKey changes', () => {
    Object.defineProperty(document, 'hidden', { value: true, configurable: true });
    const { result, rerender } = renderHook(
      ({ key }) => useCountdown({ durationMs: 5000, running: true, resetKey: key }),
      { initialProps: { key: 1 } },
    );

    act(() => { vi.advanceTimersByTime(3000); });
    expect(result.current.remainingMs).toBeLessThanOrEqual(2000);

    rerender({ key: 2 });
    expect(result.current.remainingMs).toBe(5000);
  });
});
