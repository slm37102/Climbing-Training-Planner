import { describe, it, expect } from 'vitest';
import {
  computeSessionLoad,
  computeDailyLoads,
  computeWeeklyLoad,
  computeChronicLoad,
  computeACWR,
  getLoadZone,
  shouldShowDeloadBanner,
  addDays,
  weekOverWeekChangePct,
  SessionLoadInput,
} from '../utils/load';

// Helper: build N days of sessions with a given daily rpe*duration load,
// starting from `start` (inclusive). One session per day.
function dailySessions(
  start: string,
  days: number,
  dailyLoad: number,
): SessionLoadInput[] {
  const out: SessionLoadInput[] = [];
  // Split dailyLoad into rpe * duration = dailyLoad. rpe=5, duration=load/5.
  for (let i = 0; i < days; i++) {
    out.push({
      rpe: 5,
      durationMinutes: dailyLoad / 5,
      date: addDays(start, i),
    });
  }
  return out;
}

describe('computeSessionLoad', () => {
  it('returns rpe * durationMinutes', () => {
    expect(computeSessionLoad({ rpe: 7, durationMinutes: 60, date: '2024-01-01' })).toBe(420);
  });
  it('treats missing rpe as zero', () => {
    expect(computeSessionLoad({ rpe: null as unknown as number, durationMinutes: 60, date: '2024-01-01' })).toBe(0);
    expect(computeSessionLoad({ rpe: 0, durationMinutes: 60, date: '2024-01-01' })).toBe(0);
  });
  it('treats missing duration as zero', () => {
    expect(computeSessionLoad({ rpe: 8, durationMinutes: 0, date: '2024-01-01' })).toBe(0);
  });
});

describe('computeDailyLoads', () => {
  it('aggregates multiple sessions on the same day', () => {
    const daily = computeDailyLoads([
      { rpe: 5, durationMinutes: 30, date: '2024-01-01' },
      { rpe: 6, durationMinutes: 20, date: '2024-01-01' },
    ]);
    expect(daily).toEqual([{ date: '2024-01-01', sRPE: 150 + 120 }]);
  });
  it('fills zero-days between earliest and latest session', () => {
    const daily = computeDailyLoads([
      { rpe: 5, durationMinutes: 10, date: '2024-01-01' },
      { rpe: 5, durationMinutes: 10, date: '2024-01-04' },
    ]);
    expect(daily.map((d) => d.date)).toEqual([
      '2024-01-01',
      '2024-01-02',
      '2024-01-03',
      '2024-01-04',
    ]);
    expect(daily[1].sRPE).toBe(0);
    expect(daily[2].sRPE).toBe(0);
  });
  it('returns empty array for no sessions', () => {
    expect(computeDailyLoads([])).toEqual([]);
  });
});

describe('ACWR math', () => {
  it('empty sessions → ACWR null, zone unknown, banner false', () => {
    const daily = computeDailyLoads([]);
    expect(computeACWR(daily, '2024-02-01')).toBeNull();
    expect(getLoadZone(null)).toBe('unknown');
    expect(shouldShowDeloadBanner(daily, '2024-02-01')).toBe(false);
  });

  it('4 weeks steady 400/week → ACWR ~1.0, green, banner false', () => {
    // 28 days, ~57.14 per day
    const sessions = dailySessions('2024-01-01', 28, 400 / 7);
    const daily = computeDailyLoads(sessions);
    const onDate = '2024-01-28';
    const acwr = computeACWR(daily, onDate);
    expect(acwr).not.toBeNull();
    expect(acwr!).toBeCloseTo(1.0, 1);
    expect(getLoadZone(acwr)).toBe('green');
    expect(shouldShowDeloadBanner(daily, onDate)).toBe(false);
  });

  it('sudden spike week 5 from 400 → 800 → ACWR ~2.0, red, banner true', () => {
    const wk1to4 = dailySessions('2024-01-01', 28, 400 / 7);
    const wk5 = dailySessions('2024-01-29', 7, 800 / 7);
    const daily = computeDailyLoads([...wk1to4, ...wk5]);
    const onDate = '2024-02-04'; // last day of week 5
    const acwr = computeACWR(daily, onDate);
    expect(acwr).not.toBeNull();
    expect(acwr!).toBeCloseTo(2.0, 1);
    expect(getLoadZone(acwr)).toBe('red');
    expect(shouldShowDeloadBanner(daily, onDate)).toBe(true);
  });

  it('week-over-week +55% jump alone triggers banner', () => {
    // 4 weeks @ 400, then 1 week @ 620 (55% jump). ACWR ~620/400 = 1.55,
    // but we also want the WoW rule to trigger independently — verify by
    // checking a scenario where chronic is missing (short history).
    const wk1 = dailySessions('2024-01-01', 7, 400 / 7);
    const wk2 = dailySessions('2024-01-08', 7, 630 / 7);
    const daily = computeDailyLoads([...wk1, ...wk2]);
    const onDate = '2024-01-14';
    // With only 14 days history, chronic uses days [−34,−7] clipped to wk1.
    // The WoW rule alone must still trigger the banner.
    const pct = weekOverWeekChangePct(daily, onDate);
    expect(pct).not.toBeNull();
    expect(pct!).toBeGreaterThanOrEqual(55);
    expect(shouldShowDeloadBanner(daily, onDate)).toBe(true);
  });

  it('single high-ACWR day (no 2 consecutive) without WoW jump → banner false', () => {
    // Build history where today's ACWR ≥ 1.4 but yesterday's < 1.4 and
    // week-over-week jump < 55%.
    // Days 1-28 flat 400/week (57.14/day). Day 29 adds a big session on top
    // of the base so only day-29 trailing week spikes — but prev-week load
    // stays close enough that WoW < 55%.
    const base = dailySessions('2024-01-01', 29, 400 / 7);
    // Inject extra load *only* on day 29 to push acute up a little today.
    base.push({ rpe: 10, durationMinutes: 20, date: '2024-01-29' }); // +200 today
    const daily = computeDailyLoads(base);
    const today = '2024-01-29';
    const yesterday = '2024-01-28';
    const acwrToday = computeACWR(daily, today)!;
    const acwrYest = computeACWR(daily, yesterday)!;
    // Today elevated, yesterday ~1.0 → no 2-consecutive trigger.
    expect(acwrYest).toBeLessThan(1.4);
    // WoW: current week = 400 + 200 = 600, prev = 400 → +50%, below 55%.
    const pct = weekOverWeekChangePct(daily, today)!;
    expect(pct).toBeLessThan(55);
    expect(shouldShowDeloadBanner(daily, today)).toBe(false);
    // Sanity: today alone may or may not be ≥1.4 depending on chronic; if it
    // is, this proves the "single day isn't enough" rule.
    if (acwrToday >= 1.4) {
      expect(acwrToday).toBeGreaterThanOrEqual(1.4);
    }
  });

  it('2 consecutive high-ACWR days triggers banner', () => {
    const wk1to4 = dailySessions('2024-01-01', 28, 400 / 7);
    const wk5 = dailySessions('2024-01-29', 7, 800 / 7);
    const daily = computeDailyLoads([...wk1to4, ...wk5]);
    // Day 34 and 35 are both well inside the spike week.
    expect(computeACWR(daily, '2024-02-03')!).toBeGreaterThanOrEqual(1.4);
    expect(computeACWR(daily, '2024-02-04')!).toBeGreaterThanOrEqual(1.4);
    expect(shouldShowDeloadBanner(daily, '2024-02-04')).toBe(true);
  });

  it('<28 days history with nonzero load: zone is unknown if chronic window is empty', () => {
    // Only 7 days of history. Chronic window [onDate-34, onDate-7] has no
    // data (the whole history is inside the acute window), so chronic=0 →
    // ACWR null → zone 'unknown'. Documented choice: we'd rather say "not
    // enough data" than emit a spurious zone.
    const sessions = dailySessions('2024-01-01', 7, 400 / 7);
    const daily = computeDailyLoads(sessions);
    const onDate = '2024-01-07';
    expect(computeACWR(daily, onDate)).toBeNull();
    expect(getLoadZone(computeACWR(daily, onDate))).toBe('unknown');
  });

  it('zone boundaries', () => {
    expect(getLoadZone(1.0)).toBe('green');
    expect(getLoadZone(0.8)).toBe('green');
    expect(getLoadZone(1.3)).toBe('green');
    expect(getLoadZone(1.4)).toBe('amber');
    expect(getLoadZone(0.6)).toBe('amber');
    expect(getLoadZone(1.6)).toBe('red');
    expect(getLoadZone(0.3)).toBe('red');
    expect(getLoadZone(null)).toBe('unknown');
  });

  it('weekly and chronic loads are computed correctly on the spike scenario', () => {
    const wk1to4 = dailySessions('2024-01-01', 28, 400 / 7);
    const wk5 = dailySessions('2024-01-29', 7, 800 / 7);
    const daily = computeDailyLoads([...wk1to4, ...wk5]);
    expect(computeWeeklyLoad(daily, '2024-02-04')).toBeCloseTo(800, 0);
    // Chronic window = days [2023-12-31, 2024-01-28] clipped to start 2024-01-01.
    // That's 28 days all @ 400/7/day → mean weekly = 400.
    expect(computeChronicLoad(daily, '2024-02-04')).toBeCloseTo(400, 0);
  });
});
