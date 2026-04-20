import type { SessionLog, ClimbLog } from '../types';

const HEADER = [
  'sessionId',
  'date',
  'workoutName',
  'durationMin',
  'rpe',
  'notes',
  'climbId',
  'grade',
  'attempts',
  'sent',
  'location',
  'routeName',
  'crag',
];

const escapeField = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const sessionFields = (s: SessionLog & { workoutName?: string }): string[] => [
  escapeField(s.id),
  escapeField(s.date),
  escapeField((s as { workoutName?: string }).workoutName ?? ''),
  escapeField(s.durationMinutes),
  escapeField(s.rpe),
  escapeField(s.notes ?? ''),
];

const climbFields = (c: ClimbLog): string[] => [
  escapeField(c.id),
  escapeField(c.grade),
  escapeField(c.attempts),
  escapeField(c.sent ? 'true' : 'false'),
  escapeField(c.location ?? ''),
  escapeField(c.routeName ?? ''),
  escapeField(c.crag ?? ''),
];

const emptyClimbFields = (): string[] => ['', '', '', '', '', '', ''];

export function buildSessionsCsv(sessions: SessionLog[]): string {
  const rows: string[] = [HEADER.join(',')];

  for (const session of sessions) {
    const sFields = sessionFields(session);
    if (!session.climbs || session.climbs.length === 0) {
      rows.push([...sFields, ...emptyClimbFields()].join(','));
    } else {
      for (const climb of session.climbs) {
        rows.push([...sFields, ...climbFields(climb)].join(','));
      }
    }
  }

  return rows.join('\n');
}
