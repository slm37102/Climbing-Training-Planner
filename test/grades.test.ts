import { describe, it, expect } from 'vitest';
import {
  convertGrade,
  gradeRank,
  compareGrades,
  listGrades,
  GRADE_TABLE,
} from '../utils/grades';

describe('grades module', () => {
  it('converts V6 to Font 7A', () => {
    expect(convertGrade('V6', 'V', 'Font')).toBe('7A');
  });

  it('converts Font 7A back to V6', () => {
    expect(convertGrade('7A', 'Font', 'V')).toBe('V6');
  });

  it('converts YDS 5.10d to a V-scale equivalent (V3)', () => {
    expect(convertGrade('5.10d', 'YDS', 'V')).toBe('V3');
  });

  it('converts Font 9A to UIAA XI+', () => {
    expect(convertGrade('9A', 'Font', 'UIAA')).toBe('XI+');
  });

  it('returns null for unknown grades', () => {
    expect(convertGrade('nonsense', 'V', 'Font')).toBeNull();
    expect(convertGrade('', 'V', 'Font')).toBeNull();
  });

  it('gradeRank increases monotonically with difficulty', () => {
    expect(gradeRank('V10', 'V')).toBeGreaterThan(gradeRank('V9', 'V'));
    expect(gradeRank('V0', 'V')).toBe(0);
    expect(gradeRank('V17', 'V')).toBe(17);
  });

  it('gradeRank returns -1 for unknown values', () => {
    expect(gradeRank('V99', 'V')).toBe(-1);
    expect(gradeRank('asdf', 'Font')).toBe(-1);
  });

  it('compareGrades returns 0 for cross-system equivalents (V10 ~ 7C+)', () => {
    expect(compareGrades('V10', 'V', '7C+', 'Font')).toBe(0);
  });

  it('compareGrades returns positive when left is harder', () => {
    expect(compareGrades('V10', 'V', 'V5', 'V')).toBeGreaterThan(0);
    expect(compareGrades('8A', 'Font', '6A', 'Font')).toBeGreaterThan(0);
  });

  it('compareGrades returns negative when left is easier', () => {
    expect(compareGrades('5.10a', 'YDS', '8a', 'French')).toBeLessThan(0);
  });

  it('listGrades returns V0..V17 for V system', () => {
    const v = listGrades('V');
    expect(v.length).toBeGreaterThanOrEqual(18);
    expect(v[0]).toBe('V0');
    expect(v[17]).toBe('V17');
  });

  it('listGrades returns same length across systems', () => {
    expect(listGrades('Font').length).toBe(GRADE_TABLE.length);
    expect(listGrades('YDS').length).toBe(GRADE_TABLE.length);
    expect(listGrades('French').length).toBe(GRADE_TABLE.length);
    expect(listGrades('UIAA').length).toBe(GRADE_TABLE.length);
  });

  it('round-trips through all systems preserving rank', () => {
    const original = 'V8';
    const font = convertGrade(original, 'V', 'Font');
    const yds = convertGrade(font!, 'Font', 'YDS');
    const french = convertGrade(yds!, 'YDS', 'French');
    const uiaa = convertGrade(french!, 'French', 'UIAA');
    const back = convertGrade(uiaa!, 'UIAA', 'V');
    expect(back).toBe(original);
  });
});
