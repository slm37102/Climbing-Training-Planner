import type { ExerciseLog, ExercisePillar } from '../types';

export interface OverloadTarget {
  load?: string;
  sets?: number;
  reps?: number;
  edge?: number;
  notes: string;
}

/**
 * Compute a progressive-overload prescription for the next session based on
 * the last ExerciseLog and the pillar classification. Rules follow the
 * issue #10 table:
 *
 *  | Pillar        | RPE ≤ 7                      | RPE 8        | RPE ≥ 9                       |
 *  |---------------|------------------------------|--------------|-------------------------------|
 *  | MaxHang       | +5 kg OR −1 mm edge          | +2.5 kg      | Hold load, +1 set             |
 *  | Repeaters     | +2.5 kg                      | Hold         | Reduce 1 set                  |
 *  | LimitBoulder  | Try harder problem           | Hold         | More rest, fewer attempts     |
 *  | NoHangs       | +5% BW                       | Hold         | Hold — frequency work         |
 *  | default       | +5% load                     | Hold         | Hold, consider deload         |
 */
export function computeOverload(
  lastLog: ExerciseLog,
  pillar?: ExercisePillar
): OverloadTarget {
  const rpe = lastLog.rpe ?? 7;
  const lastWeight = lastLog.addedWeight;
  const lastEdge = lastLog.edgeDepth;
  const lastSets = lastLog.completedSets;
  const lastReps = lastLog.completedReps;

  const p: ExercisePillar = pillar ?? 'Other';

  if (p === 'MaxHang') {
    if (rpe <= 7) {
      if (lastWeight != null) {
        return {
          load: `${lastWeight + 5}`,
          sets: lastSets,
          reps: lastReps,
          edge: lastEdge,
          notes: `+5 kg (or drop 1 mm edge) — last RPE ${rpe} was submaximal`,
        };
      }
      if (lastEdge != null) {
        return {
          sets: lastSets,
          reps: lastReps,
          edge: Math.max(1, lastEdge - 1),
          notes: `-1 mm edge — last RPE ${rpe} was submaximal`,
        };
      }
      return { sets: lastSets, reps: lastReps, notes: '+5 kg or −1 mm edge — push the stimulus' };
    }
    if (rpe === 8) {
      return {
        load: lastWeight != null ? `${lastWeight + 2.5}` : undefined,
        sets: lastSets,
        reps: lastReps,
        edge: lastEdge,
        notes: '+2.5 kg — small bump, RPE 8 is the sweet spot',
      };
    }
    // rpe >= 9
    return {
      load: lastWeight != null ? `${lastWeight}` : undefined,
      sets: lastSets + 1,
      reps: lastReps,
      edge: lastEdge,
      notes: 'Hold load, +1 set — RPE was high, build volume instead',
    };
  }

  if (p === 'Repeaters') {
    if (rpe <= 7) {
      return {
        load: lastWeight != null ? `${lastWeight + 2.5}` : undefined,
        sets: lastSets,
        reps: lastReps,
        edge: lastEdge,
        notes: '+2.5 kg — endurance gains need a small load bump',
      };
    }
    if (rpe === 8) {
      return {
        load: lastWeight != null ? `${lastWeight}` : undefined,
        sets: lastSets,
        reps: lastReps,
        edge: lastEdge,
        notes: 'Hold load — RPE 8 is the target',
      };
    }
    return {
      load: lastWeight != null ? `${lastWeight}` : undefined,
      sets: Math.max(1, lastSets - 1),
      reps: lastReps,
      edge: lastEdge,
      notes: '-1 set — RPE was high, reduce volume',
    };
  }

  if (p === 'LimitBoulder') {
    if (rpe <= 7) {
      return {
        sets: lastSets,
        reps: lastReps,
        notes: 'Try a harder problem — last session felt submaximal',
      };
    }
    if (rpe === 8) {
      return {
        sets: lastSets,
        reps: lastReps,
        notes: 'Hold — repeat the same problem / grade',
      };
    }
    return {
      sets: lastSets,
      reps: Math.max(1, lastReps - 1),
      notes: 'More rest, fewer attempts — RPE was high',
    };
  }

  if (p === 'NoHangs') {
    if (rpe <= 7) {
      const bump = lastWeight != null ? lastWeight * 1.05 : undefined;
      return {
        load: bump != null ? `${Math.round(bump * 10) / 10}` : undefined,
        sets: lastSets,
        reps: lastReps,
        edge: lastEdge,
        notes: '+5% bodyweight load — NoHangs tolerate frequent small bumps',
      };
    }
    if (rpe === 8) {
      return {
        load: lastWeight != null ? `${lastWeight}` : undefined,
        sets: lastSets,
        reps: lastReps,
        edge: lastEdge,
        notes: 'Hold — RPE 8 is the target',
      };
    }
    return {
      load: lastWeight != null ? `${lastWeight}` : undefined,
      sets: lastSets,
      reps: lastReps,
      edge: lastEdge,
      notes: 'Hold — NoHangs are frequency work, don\'t chase load on hard days',
    };
  }

  // default (Power, Endurance, Antagonist, Other)
  if (rpe <= 7) {
    const bump = lastWeight != null ? lastWeight * 1.05 : undefined;
    return {
      load: bump != null ? `${Math.round(bump * 10) / 10}` : undefined,
      sets: lastSets,
      reps: lastReps,
      notes: '+5% load — submaximal last session',
    };
  }
  if (rpe === 8) {
    return {
      load: lastWeight != null ? `${lastWeight}` : undefined,
      sets: lastSets,
      reps: lastReps,
      notes: 'Hold — RPE 8 is the sweet spot',
    };
  }
  return {
    load: lastWeight != null ? `${lastWeight}` : undefined,
    sets: lastSets,
    reps: lastReps,
    notes: 'Hold — consider a deload next week',
  };
}

/**
 * Heuristic name → pillar mapping. Intentionally permissive: we prefer any
 * classification over `Other` so the UI can show meaningful hints.
 */
export function inferPillarFromName(name: string): ExercisePillar {
  const n = (name || '').toLowerCase();

  if (/\bno[\s-]?hang/.test(n)) return 'NoHangs';
  if (/repeater|7\s*[\/x:]\s*3|7\s*on\s*3\s*off/.test(n)) return 'Repeaters';
  if (/max\s*hang|\bmvc\b|heavy\s*hang/.test(n)) return 'MaxHang';
  if (/limit\s*boulder|project|4x4|bouldering\s*4/.test(n)) return 'LimitBoulder';
  if (/campus|power|dyno|plyo|pogo/.test(n)) return 'Power';
  if (/arc\b|aerobic|endurance|continuous|capacity|route\s*laps|circuit/.test(n)) return 'Endurance';
  if (/antagonist|push[\s-]?up|press|row|scap|rotator|y[\s-]?t[\s-]?w|band|shoulder/.test(n)) return 'Antagonist';

  return 'Other';
}

/**
 * Did the current log exceed the prescribed overload target?
 * Triggers PR flagging. Any one of load/edge/sets/reps exceeded counts.
 * - load: numeric string → greater is better
 * - edge: smaller edge is harder, so current < target counts as exceeded
 * - sets/reps: greater is better
 */
export function didExceedTarget(
  current: ExerciseLog,
  target: OverloadTarget
): boolean {
  if (target.load != null && current.addedWeight != null) {
    const t = parseFloat(target.load);
    if (!isNaN(t) && current.addedWeight > t) return true;
  }
  if (target.edge != null && current.edgeDepth != null) {
    if (current.edgeDepth < target.edge) return true;
  }
  if (target.sets != null && current.completedSets > target.sets) return true;
  if (
    target.reps != null &&
    current.completedReps > target.reps &&
    // Require at least as many sets so more reps in fewer sets isn't a PR.
    (target.sets == null || current.completedSets >= target.sets)
  ) {
    return true;
  }
  return false;
}
