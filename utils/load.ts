// Training-load math: session-RPE (Foster 1995) + acute:chronic workload
// ratio (Gabbett 2016, Windt & Gabbett 2019 uncoupled variant).
//
// All dates are ISO `YYYY-MM-DD` strings. We never construct local-tz Date
// objects for arithmetic — always UTC — so banners don't flicker across
// timezone boundaries.

export interface SessionLoadInput {
  rpe: number;
  durationMinutes: number;
  date: string;
}

export interface LoadPoint {
  date: string;
  sRPE: number;
}

export type LoadZone = 'green' | 'amber' | 'red' | 'unknown';

// ---------- date helpers ----------
const parseISO = (s: string): Date => new Date(s + 'T00:00:00Z');
const toISO = (d: Date): string => d.toISOString().split('T')[0];

export const addDays = (iso: string, n: number): string => {
  const d = parseISO(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return toISO(d);
};

const daysBetween = (a: string, b: string): number => {
  const ms = parseISO(b).getTime() - parseISO(a).getTime();
  return Math.round(ms / 86_400_000);
};

// ---------- core computations ----------

/** Foster session-RPE: load = rpe (1-10) * duration (min). */
export function computeSessionLoad(s: SessionLoadInput): number {
  if (!s || !s.rpe || !s.durationMinutes) return 0;
  if (s.rpe <= 0 || s.durationMinutes <= 0) return 0;
  return s.rpe * s.durationMinutes;
}

/**
 * Aggregate sessions per day and fill zero-days between the earliest and
 * latest session so downstream rolling windows can index by position.
 */
export function computeDailyLoads(sessions: SessionLoadInput[]): LoadPoint[] {
  if (!sessions || sessions.length === 0) return [];
  const byDate = new Map<string, number>();
  for (const s of sessions) {
    if (!s?.date) continue;
    const load = computeSessionLoad(s);
    if (load <= 0) continue;
    byDate.set(s.date, (byDate.get(s.date) ?? 0) + load);
  }
  if (byDate.size === 0) return [];
  const dates = Array.from(byDate.keys()).sort();
  const start = dates[0];
  const end = dates[dates.length - 1];
  const span = daysBetween(start, end);
  const out: LoadPoint[] = [];
  for (let i = 0; i <= span; i++) {
    const d = addDays(start, i);
    out.push({ date: d, sRPE: byDate.get(d) ?? 0 });
  }
  return out;
}

const sumWindow = (
  daily: LoadPoint[],
  fromISO: string,
  toISO_: string,
): { sum: number; daysWithData: number } => {
  let sum = 0;
  let daysWithData = 0;
  for (const p of daily) {
    if (p.date >= fromISO && p.date <= toISO_) {
      sum += p.sRPE;
      daysWithData++;
    }
  }
  return { sum, daysWithData };
};

/** Sum of sRPE over the 7-day window ending on (and including) onDate. */
export function computeWeeklyLoad(daily: LoadPoint[], onDate: string): number {
  if (!daily || daily.length === 0) return 0;
  const { sum } = sumWindow(daily, addDays(onDate, -6), onDate);
  return sum;
}

/**
 * Chronic load = mean weekly load over the 28 days preceding the acute
 * window (Windt & Gabbett 2019 "uncoupled" ACWR — avoids double-counting
 * the acute week inside its own denominator).
 *
 * Window: [onDate-34, onDate-7]. If fewer than 28 days of history are
 * available we scale by whatever is available (≥ 1 day).
 */
export function computeChronicLoad(daily: LoadPoint[], onDate: string): number {
  if (!daily || daily.length === 0) return 0;
  const windowEnd = addDays(onDate, -7);
  const windowStart = addDays(onDate, -34);
  // Clip window to available history.
  const earliest = daily[0].date;
  const effectiveStart = windowStart > earliest ? windowStart : earliest;
  if (effectiveStart > windowEnd) return 0;
  const { sum } = sumWindow(daily, effectiveStart, windowEnd);
  const days = daysBetween(effectiveStart, windowEnd) + 1;
  if (days <= 0) return 0;
  // Convert daily sum to a weekly mean: sum / (days/7).
  return (sum * 7) / days;
}

/** ACWR = acute (7d) / chronic (mean weekly). null if chronic is 0. */
export function computeACWR(
  daily: LoadPoint[],
  onDate: string,
): number | null {
  if (!daily || daily.length === 0) return null;
  const chronic = computeChronicLoad(daily, onDate);
  if (chronic <= 0) return null;
  const acute = computeWeeklyLoad(daily, onDate);
  return acute / chronic;
}

/**
 * Zone mapping (Gabbett "sweet spot" / "danger zone"):
 *   green  : 0.8 – 1.3
 *   amber  : 1.3 – 1.5 or 0.5 – 0.8
 *   red    : > 1.5 or < 0.5
 *   unknown: null (insufficient history — chronic == 0)
 */
export function getLoadZone(acwr: number | null): LoadZone {
  if (acwr === null || Number.isNaN(acwr)) return 'unknown';
  if (acwr > 1.5 || acwr < 0.5) return 'red';
  if (acwr > 1.3 || acwr < 0.8) return 'amber';
  return 'green';
}

/**
 * Banner trigger: ACWR ≥ 1.4 for 2+ consecutive days, OR week-over-week
 * load jump ≥ 55%. Either condition is enough — they each flag a risky
 * training pattern on their own (Gabbett 2016; Hulin et al. 2014).
 */
export function shouldShowDeloadBanner(
  daily: LoadPoint[],
  onDate: string,
): boolean {
  if (!daily || daily.length === 0) return false;
  const today = computeACWR(daily, onDate);
  const yesterday = computeACWR(daily, addDays(onDate, -1));
  const twoHighDays =
    today !== null && yesterday !== null && today >= 1.4 && yesterday >= 1.4;

  const currentWeek = computeWeeklyLoad(daily, onDate);
  const prevWeek = computeWeeklyLoad(daily, addDays(onDate, -7));
  const bigJump =
    prevWeek > 0 && (currentWeek - prevWeek) / prevWeek >= 0.55;

  return twoHighDays || bigJump;
}

/** % week-over-week change for UI copy. Null if no prior week. */
export function weekOverWeekChangePct(
  daily: LoadPoint[],
  onDate: string,
): number | null {
  const curr = computeWeeklyLoad(daily, onDate);
  const prev = computeWeeklyLoad(daily, addDays(onDate, -7));
  if (prev <= 0) return null;
  return ((curr - prev) / prev) * 100;
}
