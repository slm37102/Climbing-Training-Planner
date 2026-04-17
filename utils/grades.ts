// Grade system conversions.
//
// IMPORTANT: Climbing grade conversions between boulder (V / Font) and
// sport (YDS / French / UIAA) systems are inherently approximate. There
// is no authoritative 1:1 mapping, and many V-grades span a range of
// Font / sport values. The table below picks a single canonical
// equivalent per row — typically the most commonly cited mid-value.
// When a V row maps to a range (e.g. V3 ≈ 6A or 6A+), we store the
// most common single value (6A). Cross-discipline (V↔YDS/French) is
// especially fuzzy; consumers should treat conversions as rough.
//
// Table covers V0..V17 (18 rows). Where uncertain we lean to the
// conservative / lower-end value.

export type GradeSystem = 'V' | 'Font' | 'YDS' | 'French' | 'UIAA';

export interface GradeRow {
  rank: number;
  V: string;
  Font: string;
  YDS: string;
  French: string;
  UIAA: string;
}

export const GRADE_TABLE: GradeRow[] = [
  { rank: 0,  V: 'V0',  Font: '4',   YDS: '5.9',   French: '5b',  UIAA: 'V+'   },
  { rank: 1,  V: 'V1',  Font: '5',   YDS: '5.10a', French: '5c',  UIAA: 'VI-'  },
  { rank: 2,  V: 'V2',  Font: '5+',  YDS: '5.10c', French: '6a',  UIAA: 'VI+'  },
  { rank: 3,  V: 'V3',  Font: '6A',  YDS: '5.10d', French: '6a+', UIAA: 'VII-' },
  { rank: 4,  V: 'V4',  Font: '6B',  YDS: '5.11b', French: '6b',  UIAA: 'VII'  },
  { rank: 5,  V: 'V5',  Font: '6C',  YDS: '5.11d', French: '6c',  UIAA: 'VII+' },
  { rank: 6,  V: 'V6',  Font: '7A',  YDS: '5.12a', French: '6c+', UIAA: 'VIII-'},
  { rank: 7,  V: 'V7',  Font: '7A+', YDS: '5.12b', French: '7a',  UIAA: 'VIII' },
  { rank: 8,  V: 'V8',  Font: '7B',  YDS: '5.12c', French: '7a+', UIAA: 'VIII+'},
  { rank: 9,  V: 'V9',  Font: '7C',  YDS: '5.12d', French: '7b',  UIAA: 'IX-'  },
  { rank: 10, V: 'V10', Font: '7C+', YDS: '5.13b', French: '7b+', UIAA: 'IX'   },
  { rank: 11, V: 'V11', Font: '8A',  YDS: '5.13c', French: '7c',  UIAA: 'IX+'  },
  { rank: 12, V: 'V12', Font: '8A+', YDS: '5.13d', French: '7c+', UIAA: 'X-'   },
  { rank: 13, V: 'V13', Font: '8B',  YDS: '5.14a', French: '8a',  UIAA: 'X'    },
  { rank: 14, V: 'V14', Font: '8B+', YDS: '5.14b', French: '8a+', UIAA: 'X+'   },
  { rank: 15, V: 'V15', Font: '8C',  YDS: '5.14c', French: '8b',  UIAA: 'XI-'  },
  { rank: 16, V: 'V16', Font: '8C+', YDS: '5.14d', French: '8b+', UIAA: 'XI'   },
  { rank: 17, V: 'V17', Font: '9A',  YDS: '5.15a', French: '8c',  UIAA: 'XI+'  },
];

const normalise = (s: string): string => s.trim();

export function gradeRank(value: string, system: GradeSystem): number {
  if (!value) return -1;
  const v = normalise(value);
  const row = GRADE_TABLE.find(r => r[system] === v);
  return row ? row.rank : -1;
}

export function convertGrade(
  value: string,
  from: GradeSystem,
  to: GradeSystem
): string | null {
  const rank = gradeRank(value, from);
  if (rank < 0) return null;
  const row = GRADE_TABLE.find(r => r.rank === rank);
  return row ? row[to] : null;
}

export function compareGrades(
  a: string,
  sysA: GradeSystem,
  b: string,
  sysB: GradeSystem
): number {
  const ra = gradeRank(a, sysA);
  const rb = gradeRank(b, sysB);
  return ra - rb;
}

export function listGrades(system: GradeSystem): string[] {
  return GRADE_TABLE.map(r => r[system]);
}

export const GRADE_SYSTEMS: GradeSystem[] = ['V', 'Font', 'YDS', 'French', 'UIAA'];

export const GRADE_SYSTEM_LABELS: Record<GradeSystem, string> = {
  V: 'V-Scale (Boulder)',
  Font: 'Fontainebleau (Boulder)',
  YDS: 'YDS (Sport, US)',
  French: 'French (Sport)',
  UIAA: 'UIAA',
};
