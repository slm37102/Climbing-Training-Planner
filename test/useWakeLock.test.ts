import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useWakeLock } from '../hooks/useWakeLock';

interface FakeSentinel {
  released: boolean;
  release: ReturnType<typeof vi.fn>;
  addEventListener: ReturnType<typeof vi.fn>;
}

function makeFakeSentinel(): FakeSentinel {
  const sentinel: FakeSentinel = {
    released: false,
    release: vi.fn(async () => { sentinel.released = true; }),
    addEventListener: vi.fn(),
  };
  return sentinel;
}

describe('useWakeLock', () => {
  let originalWakeLock: PropertyDescriptor | undefined;

  beforeEach(() => {
    originalWakeLock = Object.getOwnPropertyDescriptor(navigator, 'wakeLock');
  });

  afterEach(() => {
    if (originalWakeLock) {
      Object.defineProperty(navigator, 'wakeLock', originalWakeLock);
    } else {
      delete (navigator as Navigator & { wakeLock?: unknown }).wakeLock;
    }
  });

  it('reports unsupported when navigator.wakeLock is absent', () => {
    // Ensure not present
    delete (navigator as Navigator & { wakeLock?: unknown }).wakeLock;
    const { result } = renderHook(() => useWakeLock(true));
    expect(result.current.supported).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('requests a wake lock when active and releases on unmount', async () => {
    const sentinel = makeFakeSentinel();
    const request = vi.fn(async () => sentinel);
    Object.defineProperty(navigator, 'wakeLock', {
      value: { request },
      configurable: true,
      writable: true,
    });

    const { result, unmount } = renderHook(() => useWakeLock(true));
    expect(result.current.supported).toBe(true);

    // let the microtask in the effect resolve
    await Promise.resolve();
    await Promise.resolve();

    expect(request).toHaveBeenCalledWith('screen');

    unmount();
    expect(sentinel.release).toHaveBeenCalled();
  });

  it('does not request when inactive', () => {
    const request = vi.fn();
    Object.defineProperty(navigator, 'wakeLock', {
      value: { request },
      configurable: true,
      writable: true,
    });
    renderHook(() => useWakeLock(false));
    expect(request).not.toHaveBeenCalled();
  });

  it('swallows NotAllowedError without setting error', async () => {
    const err = Object.assign(new Error('nope'), { name: 'NotAllowedError' });
    const request = vi.fn(async () => { throw err; });
    Object.defineProperty(navigator, 'wakeLock', {
      value: { request },
      configurable: true,
      writable: true,
    });

    const { result } = renderHook(() => useWakeLock(true));
    await Promise.resolve();
    await Promise.resolve();
    expect(result.current.error).toBeNull();
  });

  it('releases sentinel when active flips to false', async () => {
    const sentinel = makeFakeSentinel();
    const request = vi.fn(async () => sentinel);
    Object.defineProperty(navigator, 'wakeLock', {
      value: { request },
      configurable: true,
      writable: true,
    });

    const { rerender } = renderHook(
      ({ active }) => useWakeLock(active),
      { initialProps: { active: true } },
    );
    await Promise.resolve();
    await Promise.resolve();
    expect(request).toHaveBeenCalledTimes(1);

    rerender({ active: false });
    expect(sentinel.release).toHaveBeenCalled();
  });
});
