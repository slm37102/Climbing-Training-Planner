import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateId = () => Math.random().toString(36).substring(2, 9);

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const getDayName = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

export const getDayNumber = (dateStr: string): number => {
  const date = new Date(dateStr);
  return date.getDate();
};

export const grades = [
  'VB', 'V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10'
];

export const rpeDescriptions = [
  '1 - Effortless', '2 - Very Easy', '3 - Easy', '4 - Moderate',
  '5 - Challenging', '6 - Hard', '7 - Very Hard', '8 - Near Limit',
  '9 - Limit', '10 - Failure'
];

// Progress Stats Types and Utilities
import { SessionLog } from './types';

export type TimeRange = 'week' | 'month' | 'quarter';

export interface DateRange {
  start: Date;
  end: Date;
}

export interface ProgressStats {
  totalSessions: number;
  totalClimbs: number;
  totalSends: number;
  gradeDistribution: { grade: string; count: number }[];
  avgRpe: number | null;
  avgDuration: number | null;
  highestGrade: string | null;
  trainingDays: Set<string>;
}

export const getDateRange = (range: TimeRange): DateRange => {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date();
  
  switch (range) {
    case 'week':
      start.setDate(start.getDate() - 6);
      break;
    case 'month':
      start.setDate(start.getDate() - 27); // 4 weeks
      break;
    case 'quarter':
      start.setDate(start.getDate() - 83); // ~12 weeks
      break;
  }
  start.setHours(0, 0, 0, 0);
  
  return { start, end };
};

export const getPreviousRange = (range: TimeRange): DateRange => {
  const current = getDateRange(range);
  const durationMs = current.end.getTime() - current.start.getTime();
  
  return {
    start: new Date(current.start.getTime() - durationMs - 1),
    end: new Date(current.start.getTime() - 1)
  };
};

export const isInRange = (dateStr: string, range: DateRange): boolean => {
  const date = new Date(dateStr);
  return date >= range.start && date <= range.end;
};

export const getProgressStats = (sessions: SessionLog[], range: DateRange): ProgressStats => {
  const filtered = sessions.filter(s => isInRange(s.date, range));
  
  const totalClimbs = filtered.reduce((sum, s) => sum + s.climbs.length, 0);
  const totalSends = filtered.reduce((sum, s) => sum + s.climbs.filter(c => c.sent).length, 0);
  
  // Grade distribution
  const gradeCounts: Record<string, number> = {};
  filtered.forEach(s => {
    s.climbs.forEach(c => {
      if (c.sent) {
        gradeCounts[c.grade] = (gradeCounts[c.grade] || 0) + 1;
      }
    });
  });
  
  const gradeDistribution = grades
    .map(g => ({ grade: g, count: gradeCounts[g] || 0 }))
    .filter(d => d.count > 0);
  
  // Highest grade
  let highestGrade: string | null = null;
  for (let i = grades.length - 1; i >= 0; i--) {
    if (gradeCounts[grades[i]]) {
      highestGrade = grades[i];
      break;
    }
  }
  
  // Average RPE
  const rpeValues = filtered.map(s => s.rpe).filter(r => r > 0);
  const avgRpe = rpeValues.length > 0 
    ? Math.round(rpeValues.reduce((a, b) => a + b, 0) / rpeValues.length * 10) / 10 
    : null;
  
  // Average duration
  const durations = filtered.map(s => s.durationMinutes).filter(d => d > 0);
  const avgDuration = durations.length > 0
    ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    : null;
  
  // Training days (for heatmap)
  const trainingDays = new Set(filtered.map(s => s.date.split('T')[0]));
  
  return {
    totalSessions: filtered.length,
    totalClimbs,
    totalSends,
    gradeDistribution,
    avgRpe,
    avgDuration,
    highestGrade,
    trainingDays
  };
};

export const getComparisonChange = (current: number, previous: number): { value: number; direction: 'up' | 'down' | 'same' } => {
  if (previous === 0) return { value: 0, direction: 'same' };
  const change = ((current - previous) / previous) * 100;
  return {
    value: Math.abs(Math.round(change)),
    direction: change > 0 ? 'up' : change < 0 ? 'down' : 'same'
  };
};

export const getCalendarDays = (range: TimeRange): { date: string; dayOfWeek: number }[] => {
  const { start, end } = getDateRange(range);
  const days: { date: string; dayOfWeek: number }[] = [];
  
  const current = new Date(start);
  while (current <= end) {
    days.push({
      date: current.toISOString().split('T')[0],
      dayOfWeek: current.getDay()
    });
    current.setDate(current.getDate() + 1);
  }
  
  return days;
};

// Audio Cue System using Web Audio API
let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioContext;
};

export type AudioCueType = 'work' | 'rest' | 'setRest' | 'complete' | 'countdown' | 'restComplete';

interface BeepConfig {
  frequency: number;
  duration: number;
  count: number;
  gap: number;
}

const AUDIO_CUE_CONFIG: Record<AudioCueType, BeepConfig> = {
  work: { frequency: 880, duration: 150, count: 2, gap: 100 },      // High beeps - start work
  rest: { frequency: 440, duration: 200, count: 1, gap: 0 },        // Low beep - start rest
  setRest: { frequency: 330, duration: 300, count: 2, gap: 150 },   // Lower beeps - set rest
  complete: { frequency: 660, duration: 200, count: 3, gap: 150 },  // Triple beep - done
  countdown: { frequency: 600, duration: 100, count: 1, gap: 0 },   // Short tick - countdown
  restComplete: { frequency: 880, duration: 150, count: 3, gap: 100 } // High triple - rest timer done
};

const playBeep = (frequency: number, duration: number): Promise<void> => {
  return new Promise((resolve) => {
    const ctx = getAudioContext();
    if (!ctx) {
      resolve();
      return;
    }
    
    // Resume context if suspended (required for autoplay policy)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    // Smooth envelope to avoid clicks
    const now = ctx.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.5, now + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, now + duration / 1000);

    oscillator.start(now);
    oscillator.stop(now + duration / 1000);

    oscillator.onended = () => resolve();
  });
};

export const playAudioCue = async (type: AudioCueType): Promise<void> => {
  const config = AUDIO_CUE_CONFIG[type];
  
  for (let i = 0; i < config.count; i++) {
    await playBeep(config.frequency, config.duration);
    if (i < config.count - 1 && config.gap > 0) {
      await new Promise(resolve => setTimeout(resolve, config.gap));
    }
  }
  
  // Also vibrate if supported
  if ('vibrate' in navigator) {
    const pattern = config.count > 1 
      ? Array(config.count).fill([config.duration, config.gap]).flat().slice(0, -1)
      : [config.duration];
    navigator.vibrate(pattern);
  }
};

// Resume audio context on user interaction (needed for mobile)
export const initAudioContext = (): void => {
  const ctx = getAudioContext();
  if (ctx?.state === 'suspended') {
    ctx.resume();
  }
};
