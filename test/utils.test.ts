import { describe, it, expect } from 'vitest';
import { cn, generateId, formatDate, getDayName, getDayNumber, grades, compareGrades } from '../utils';

describe('utils', () => {
  describe('cn', () => {
    it('merges class names', () => {
      expect(cn('px-2', 'py-1')).toBe('px-2 py-1');
    });

    it('handles conditional classes', () => {
      expect(cn('base', false && 'hidden', true && 'visible')).toBe('base visible');
    });

    it('merges tailwind conflicts correctly', () => {
      expect(cn('px-2', 'px-4')).toBe('px-4');
    });
  });

  describe('generateId', () => {
    it('generates unique ids', () => {
      const ids = new Set(Array.from({ length: 100 }, () => generateId()));
      expect(ids.size).toBe(100);
    });

    it('generates string ids', () => {
      expect(typeof generateId()).toBe('string');
    });

    it('generates ids of length >= 8', () => {
      for (let i = 0; i < 100; i++) {
        expect(generateId().length).toBeGreaterThanOrEqual(8);
      }
    });
  });

  describe('formatDate', () => {
    it('formats date as YYYY-MM-DD', () => {
      const date = new Date('2026-01-30T12:00:00');
      expect(formatDate(date)).toBe('2026-01-30');
    });
  });

  describe('getDayName', () => {
    it('returns short day name', () => {
      expect(getDayName('2026-01-30')).toBe('Fri');
    });
  });

  describe('getDayNumber', () => {
    it('returns day of month', () => {
      expect(getDayNumber('2026-01-30')).toBe(30);
    });
  });

  describe('grades', () => {
    it('contains V-scale grades in order', () => {
      expect(grades[0]).toBe('VB');
      expect(grades[grades.length - 1]).toBe('V17');
    });
  });

  describe('compareGrades', () => {
    it('orders V10 after V9 (not lexicographically)', () => {
      expect(compareGrades('V10', 'V9')).toBeGreaterThan(0);
      expect(compareGrades('V9', 'V10')).toBeLessThan(0);
    });

    it('returns 0 for equal grades', () => {
      expect(compareGrades('V5', 'V5')).toBe(0);
    });

    it('orders V17 above V0', () => {
      expect(compareGrades('V17', 'V0')).toBeGreaterThan(0);
    });

    it('sorts unknown grades last', () => {
      expect(compareGrades('V17', 'V99')).toBeLessThan(0);
      expect(compareGrades('V99', 'V17')).toBeGreaterThan(0);
    });
  });
});
