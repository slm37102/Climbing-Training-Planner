import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  WorkoutSchema,
  ScheduledWorkoutSchema,
  SessionLogSchema,
  UserSettingsSchema,
  TimerConfigSchema,
  ClimbLogSchema,
  parseDocs,
} from '../schemas';
import { WorkoutType } from '../types';

describe('schemas', () => {
  describe('TimerConfigSchema', () => {
    it('accepts a valid timer config', () => {
      const r = TimerConfigSchema.safeParse({
        workSeconds: 7,
        restSeconds: 3,
        reps: 6,
        sets: 3,
        restBetweenSetsSeconds: 180,
      });
      expect(r.success).toBe(true);
    });

    it('rejects when a required numeric field is missing', () => {
      const r = TimerConfigSchema.safeParse({
        workSeconds: 7,
        restSeconds: 3,
        reps: 6,
        sets: 3,
      });
      expect(r.success).toBe(false);
    });
  });

  describe('WorkoutSchema', () => {
    const base = {
      id: 'w1',
      name: 'Limit Bouldering',
      type: WorkoutType.BOULDER,
      description: 'Hard moves',
      durationMinutes: 90,
      steps: ['Warm up', 'Project'],
    };

    it('accepts a minimal valid workout', () => {
      const r = WorkoutSchema.safeParse(base);
      expect(r.success).toBe(true);
    });

    it('accepts a workout with nested timerConfig', () => {
      const r = WorkoutSchema.safeParse({
        ...base,
        timerConfig: { workSeconds: 7, restSeconds: 3, reps: 6, sets: 3, restBetweenSetsSeconds: 180 },
      });
      expect(r.success).toBe(true);
    });

    it('rejects when a required field is missing', () => {
      const { name: _omit, ...rest } = base;
      const r = WorkoutSchema.safeParse(rest);
      expect(r.success).toBe(false);
    });

    it('rejects an unknown WorkoutType enum value', () => {
      const r = WorkoutSchema.safeParse({ ...base, type: 'Freestyle' });
      expect(r.success).toBe(false);
    });

    it('preserves extra fields via passthrough (forward-compat)', () => {
      const r = WorkoutSchema.safeParse({ ...base, futureField: 42 });
      expect(r.success).toBe(true);
      if (r.success) {
        expect((r.data as { futureField?: number }).futureField).toBe(42);
      }
    });
  });

  describe('ScheduledWorkoutSchema', () => {
    it('accepts a valid entry', () => {
      const r = ScheduledWorkoutSchema.safeParse({
        id: 's1',
        date: '2025-02-03',
        workoutId: 'w1',
        completed: false,
      });
      expect(r.success).toBe(true);
    });

    it('rejects when completed has wrong type', () => {
      const r = ScheduledWorkoutSchema.safeParse({
        id: 's1',
        date: '2025-02-03',
        workoutId: 'w1',
        completed: 'nope',
      });
      expect(r.success).toBe(false);
    });
  });

  describe('SessionLogSchema', () => {
    const climb = {
      id: 'c1',
      grade: 'V4',
      attempts: 2,
      sent: true,
      timestamp: 1700000000000,
    };

    const base = {
      id: 'sess1',
      workoutId: 'w1',
      date: '2025-02-03',
      startTime: 1700000000000,
      durationMinutes: 60,
      rpe: 7,
      notes: '',
      skinCondition: 'Good',
      sleepQuality: 'Fair',
      climbs: [climb],
    };

    it('accepts a valid session with nested climb log', () => {
      const r = SessionLogSchema.safeParse(base);
      expect(r.success).toBe(true);
    });

    it('accepts workoutId: null (ad-hoc session)', () => {
      const r = SessionLogSchema.safeParse({ ...base, workoutId: null });
      expect(r.success).toBe(true);
    });

    it('rejects a malformed climb entry inside the array', () => {
      const r = SessionLogSchema.safeParse({
        ...base,
        climbs: [{ ...climb, attempts: 'two' }],
      });
      expect(r.success).toBe(false);
    });

    it('rejects an invalid skinCondition enum', () => {
      const r = SessionLogSchema.safeParse({ ...base, skinCondition: 'Perfect' });
      expect(r.success).toBe(false);
    });
  });

  describe('ClimbLogSchema', () => {
    it('makes gradeSystem optional', () => {
      const r = ClimbLogSchema.safeParse({
        id: 'c1',
        grade: 'V4',
        attempts: 1,
        sent: true,
        timestamp: 1,
      });
      expect(r.success).toBe(true);
    });

    it('validates gradeSystem when provided', () => {
      const r = ClimbLogSchema.safeParse({
        id: 'c1',
        grade: 'V4',
        gradeSystem: 'Martian',
        attempts: 1,
        sent: true,
        timestamp: 1,
      });
      expect(r.success).toBe(false);
    });

    it('accepts a climb with all new conditions fields', () => {
      const r = ClimbLogSchema.safeParse({
        id: 'c1',
        grade: 'V7',
        attempts: 3,
        sent: true,
        timestamp: 1,
        location: 'outdoor',
        routeName: 'The Nose',
        crag: 'Fontainebleau',
        rockType: 'sandstone',
        tempC: 8,
        humidityPct: 55,
        sendStyle: 'redpoint',
      });
      expect(r.success).toBe(true);
    });

    it('accepts a climb without any of the new conditions fields (backward-compat)', () => {
      const r = ClimbLogSchema.safeParse({
        id: 'c-legacy',
        grade: 'V3',
        attempts: 1,
        sent: false,
        timestamp: 1,
      });
      expect(r.success).toBe(true);
    });

    it('rejects an invalid location enum', () => {
      const r = ClimbLogSchema.safeParse({
        id: 'c1',
        grade: 'V4',
        attempts: 1,
        sent: true,
        timestamp: 1,
        location: 'mars',
      });
      expect(r.success).toBe(false);
    });

    it('rejects an invalid sendStyle enum', () => {
      const r = ClimbLogSchema.safeParse({
        id: 'c1',
        grade: 'V4',
        attempts: 1,
        sent: true,
        timestamp: 1,
        sendStyle: 'send-it',
      });
      expect(r.success).toBe(false);
    });

    it('rejects tempC out of plausible range', () => {
      const tooLow = ClimbLogSchema.safeParse({
        id: 'c1', grade: 'V4', attempts: 1, sent: true, timestamp: 1, tempC: -50,
      });
      const tooHigh = ClimbLogSchema.safeParse({
        id: 'c1', grade: 'V4', attempts: 1, sent: true, timestamp: 1, tempC: 100,
      });
      expect(tooLow.success).toBe(false);
      expect(tooHigh.success).toBe(false);
    });

    it('rejects humidityPct outside 0..100', () => {
      const neg = ClimbLogSchema.safeParse({
        id: 'c1', grade: 'V4', attempts: 1, sent: true, timestamp: 1, humidityPct: -1,
      });
      const over = ClimbLogSchema.safeParse({
        id: 'c1', grade: 'V4', attempts: 1, sent: true, timestamp: 1, humidityPct: 101,
      });
      expect(neg.success).toBe(false);
      expect(over.success).toBe(false);
    });
  });

  describe('UserSettingsSchema', () => {
    it('accepts minimal valid settings', () => {
      const r = UserSettingsSchema.safeParse({
        defaultGradeSystem: 'V',
        startOfWeek: 'Monday',
        weightUnit: 'kg',
      });
      expect(r.success).toBe(true);
    });

    it('rejects invalid startOfWeek', () => {
      const r = UserSettingsSchema.safeParse({
        defaultGradeSystem: 'V',
        startOfWeek: 'Friday',
        weightUnit: 'kg',
      });
      expect(r.success).toBe(false);
    });
  });

  describe('parseDocs', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    const validWorkout = {
      id: 'w1',
      name: 'Limit Bouldering',
      type: WorkoutType.BOULDER,
      description: 'Hard',
      durationMinutes: 90,
      steps: ['Warm up'],
    };

    it('returns only valid docs and warns on malformed ones', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const { id: _id, ...valid } = validWorkout;
      const docs = [
        { id: 'w1', data: () => valid },
        { id: 'bad', data: () => ({ name: 'missing fields' }) },
      ];
      const result = parseDocs(WorkoutSchema, docs, 'Workout');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('w1');
      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn.mock.calls[0][0]).toContain('Invalid Workout doc');
      expect(warn.mock.calls[0][1]).toBe('bad');
    });

    it('does not throw when every doc is malformed', () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      const docs = [
        { id: 'bad1', data: () => ({}) },
        { id: 'bad2', data: () => ({ type: 'nonsense' }) },
      ];
      expect(() => parseDocs(WorkoutSchema, docs, 'Workout')).not.toThrow();
      expect(parseDocs(WorkoutSchema, docs, 'Workout')).toEqual([]);
    });
  });
});
