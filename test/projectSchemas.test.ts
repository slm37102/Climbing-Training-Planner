import { describe, it, expect } from 'vitest';
import { ProjectSchema, parseProjects } from '../schemas';
import type { Project } from '../types';

const valid: Project = {
  id: 'p1',
  name: 'Midnight Lightning',
  discipline: 'boulder',
  status: 'projecting',
  grade: 'V8',
  crag: 'Camp 4',
  beta: 'Undercling, big move to the diamond.',
  attempts: 3,
  createdAt: '2024-03-01T00:00:00.000Z',
};

describe('ProjectSchema', () => {
  it('parses a valid project', () => {
    const r = ProjectSchema.safeParse(valid);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.name).toBe('Midnight Lightning');
      expect(r.data.status).toBe('projecting');
      expect(r.data.attempts).toBe(3);
    }
  });

  it('defaults status to projecting when missing', () => {
    const { status: _status, ...rest } = valid;
    const r = ProjectSchema.safeParse(rest);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.status).toBe('projecting');
    }
  });

  it('rejects missing required name', () => {
    const r = ProjectSchema.safeParse({
      id: 'p2',
      discipline: 'sport',
      createdAt: '2024-01-01T00:00:00Z',
    });
    expect(r.success).toBe(false);
  });

  it('rejects empty name string', () => {
    const r = ProjectSchema.safeParse({
      ...valid,
      name: '',
    });
    expect(r.success).toBe(false);
  });

  it('rejects unknown discipline', () => {
    const r = ProjectSchema.safeParse({
      ...valid,
      discipline: 'highball',
    });
    expect(r.success).toBe(false);
  });

  it('rejects unknown status', () => {
    const r = ProjectSchema.safeParse({
      ...valid,
      status: 'in_progress',
    });
    expect(r.success).toBe(false);
  });

  it('rejects negative attempts', () => {
    const r = ProjectSchema.safeParse({
      ...valid,
      attempts: -1,
    });
    expect(r.success).toBe(false);
  });

  it('preserves unknown passthrough fields', () => {
    const r = ProjectSchema.safeParse({
      ...valid,
      futureField: 'hello',
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect((r.data as unknown as { futureField: string }).futureField).toBe('hello');
    }
  });
});

describe('parseProjects helper', () => {
  it('returns valid projects and skips invalid ones', () => {
    const out = parseProjects([
      valid,
      { id: 'bad', discipline: 'boulder' }, // missing name & createdAt
      { ...valid, id: 'p3', name: 'Dreamtime', grade: 'V15' },
    ]);
    expect(out).toHaveLength(2);
    expect(out.map((p) => p.id).sort()).toEqual(['p1', 'p3']);
  });

  it('returns empty array for empty input', () => {
    expect(parseProjects([])).toEqual([]);
  });

  it('fills default status for docs missing it', () => {
    const { status: _status, ...rest } = valid;
    const out = parseProjects([rest]);
    expect(out).toHaveLength(1);
    expect(out[0].status).toBe('projecting');
  });
});
