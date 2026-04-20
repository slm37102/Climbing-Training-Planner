import { describe, it, expect } from 'vitest';
import { buildSessionsCsv } from '../utils/csvExport';
import type { SessionLog } from '../types';

const baseSession = (overrides: Partial<SessionLog> = {}): SessionLog => ({
  id: 's1',
  workoutId: null,
  date: '2024-01-15',
  startTime: 0,
  durationMinutes: 60,
  rpe: 7,
  notes: '',
  skinCondition: 'Good',
  sleepQuality: 'Good',
  climbs: [],
  ...overrides,
});

describe('buildSessionsCsv', () => {
  it('emits the correct header row', () => {
    const csv = buildSessionsCsv([]);
    expect(csv.split('\n')[0]).toBe(
      'sessionId,date,workoutName,durationMin,rpe,notes,climbId,grade,attempts,sent,location,routeName,crag'
    );
  });

  it('emits a single row with blank climb fields when session has no climbs', () => {
    const csv = buildSessionsCsv([baseSession({ id: 'sess-empty', notes: 'rest day' })]);
    const lines = csv.split('\n');
    expect(lines).toHaveLength(2);
    expect(lines[1]).toBe('sess-empty,2024-01-15,,60,7,rest day,,,,,,,');
  });

  it('expands multiple climbs into multiple rows per session', () => {
    const csv = buildSessionsCsv([
      baseSession({
        id: 'sA',
        climbs: [
          { id: 'c1', grade: 'V4', attempts: 2, sent: true, timestamp: 0, location: 'gym' },
          { id: 'c2', grade: 'V5', attempts: 4, sent: false, timestamp: 0, location: 'outdoor', routeName: 'Slab', crag: 'Bishop' },
        ],
      }),
    ]);
    const lines = csv.split('\n');
    expect(lines).toHaveLength(3);
    expect(lines[1]).toBe('sA,2024-01-15,,60,7,,c1,V4,2,true,gym,,');
    expect(lines[2]).toBe('sA,2024-01-15,,60,7,,c2,V5,4,false,outdoor,Slab,Bishop');
  });

  it('escapes commas, quotes, and newlines', () => {
    const csv = buildSessionsCsv([
      baseSession({
        id: 'sX',
        notes: 'hard, crimpy session',
        climbs: [
          { id: 'c1', grade: 'V4', attempts: 1, sent: true, timestamp: 0, routeName: 'say "hi"', crag: 'line\nbreak' },
        ],
      }),
    ]);
    const lines = csv.split('\n');
    // newline inside quoted field means CSV has more raw "lines" than logical rows;
    // check the first logical data row starts correctly and contains the escaped values.
    expect(csv).toContain('"hard, crimpy session"');
    expect(csv).toContain('"say ""hi"""');
    expect(csv).toContain('"line\nbreak"');
    // header + 1 logical row; newline inside quoted field splits into 2 raw lines
    expect(lines.length).toBe(3);
  });

  it('handles multiple sessions in order', () => {
    const csv = buildSessionsCsv([
      baseSession({ id: 's1', date: '2024-01-01' }),
      baseSession({
        id: 's2',
        date: '2024-01-02',
        climbs: [{ id: 'c1', grade: 'V3', attempts: 1, sent: true, timestamp: 0 }],
      }),
    ]);
    const lines = csv.split('\n');
    expect(lines).toHaveLength(3);
    expect(lines[1].startsWith('s1,2024-01-01')).toBe(true);
    expect(lines[2].startsWith('s2,2024-01-02')).toBe(true);
  });
});
