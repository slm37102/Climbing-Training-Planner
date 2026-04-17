import { HangboardProtocol } from '../types';

// Seed catalog of hangboard protocols. Kept as a local constant for P0 scope.
// TODO: Migrate to a global Firestore collection (e.g. `/protocols`) in a
// future PR so content updates ship without an app release and so users can
// share custom protocols.
export const HANGBOARD_PROTOCOLS: HangboardProtocol[] = [
  {
    id: 'maxhangs-lopez',
    name: 'MaxHangs (Lopez)',
    aka: ['Max Hangs', 'Lopez Max'],
    pillar: 'MaxStrength',
    edgeRecommendation: { mm: [15, 18, 20], prefer: 20 },
    loadPrescription: 'addedWeight',
    loadHint: '80–100% MVC',
    work: 10,
    rest: 180,
    reps: 1,
    sets: 4,
    restBetweenSets: 180,
    frequencyPerWeek: 2,
    source: {
      title: 'Progression in finger strength training',
      author: 'Eva López-Rivera (2014)'
    },
    rationale:
      'Short, heavy hangs recruit maximum motor units and drive pure finger strength gains on a fixed edge.',
    contraindications: []
  },
  {
    id: 'minedge-lopez',
    name: 'MinEdge (Lopez)',
    aka: ['Minimum Edge', 'Lopez Min-Edge'],
    pillar: 'MaxStrength',
    edgeRecommendation: { mm: [6, 8, 10, 12], prefer: 10 },
    loadPrescription: 'minEdge',
    loadHint: 'Bodyweight on the smallest edge you can hold for the full work interval',
    work: 10,
    rest: 180,
    reps: 1,
    sets: 4,
    restBetweenSets: 180,
    frequencyPerWeek: 2,
    source: {
      title: 'Progression in finger strength training',
      author: 'Eva López-Rivera (2014)'
    },
    rationale:
      'Bodyweight alternative to MaxHangs — progresses by shrinking the edge instead of adding load. Ideal when added-weight setups are unavailable or for crimp-specific work.',
    contraindications: []
  },
  {
    id: 'repeaters-7-3',
    name: '7/3 Repeaters (RCTM)',
    aka: ['7:3 Repeaters', 'Anderson Repeaters'],
    pillar: 'Endurance',
    edgeRecommendation: { mm: [18, 20], prefer: 20 },
    loadPrescription: 'addedWeight',
    work: 7,
    rest: 3,
    reps: 6,
    sets: 6,
    restBetweenSets: 120,
    frequencyPerWeek: 2,
    source: {
      title: 'The Rock Climber\u2019s Training Manual',
      author: 'Mike & Mark Anderson (2014)'
    },
    rationale:
      'Classic strength-endurance protocol. Short on-off cycles build the ability to hold hard moves through long sequences.',
    contraindications: []
  },
  {
    id: 'horst-10s',
    name: '10-s Hangs (Horst)',
    aka: ['Horst Max Hangs'],
    pillar: 'MaxStrength',
    edgeRecommendation: { mm: [20], prefer: 20 },
    loadPrescription: 'addedWeight',
    work: 10,
    rest: 150,
    reps: 1,
    sets: 5,
    restBetweenSets: 150,
    frequencyPerWeek: 2,
    source: {
      title: 'Training for Climbing (3rd ed.)',
      author: 'Eric Hörst (2016)'
    },
    rationale:
      'Five near-maximal 10-second hangs with full recovery. A slightly higher-volume variant of max-strength hangs popularized by Hörst.',
    contraindications: []
  },
  {
    id: 'density-hang',
    name: 'Density Hang',
    aka: ['Density Hangs'],
    pillar: 'Endurance',
    edgeRecommendation: { mm: [20], prefer: 20 },
    loadPrescription: 'bodyweight',
    work: 25,
    rest: 60,
    reps: 1,
    sets: 4,
    restBetweenSets: 60,
    frequencyPerWeek: 1,
    source: {
      title: 'Lattice Training — density hangs',
      author: 'Lattice Training'
    },
    rationale:
      'Longer sub-maximal holds build tissue tolerance and aerobic capacity in the forearms — a lower-intensity complement to max-strength work.',
    contraindications: []
  },
  {
    id: 'no-hangs-abrahamsson',
    name: 'No-Hangs (Abrahamsson)',
    aka: ['No Hangs', 'Pick-up Hangs'],
    pillar: 'Frequency',
    edgeRecommendation: { mm: [20], prefer: 20 },
    loadPrescription: 'addedWeight',
    loadHint: '30–70% BW via kettlebell, plate, or loading pin',
    work: 10,
    rest: 60,
    reps: 2,
    sets: 1,
    restBetweenSets: 60,
    frequencyPerWeek: 7,
    source: {
      title: 'The no-hang finger training method',
      author: 'Emil Abrahamsson / Lattice Training'
    },
    rationale:
      'Floor-based, low-stress loading you can do daily. Great for building tendon resilience and squeezing volume into rest days without taxing the CNS.',
    contraindications: []
  }
];

/** Build a ready-to-save Workout payload from a protocol. */
export function protocolToWorkoutInput(protocol: HangboardProtocol) {
  const loadLabel =
    protocol.loadPrescription === 'addedWeight'
      ? `added weight${protocol.loadHint ? ` (${protocol.loadHint})` : ''}`
      : protocol.loadPrescription === 'minEdge'
      ? `minimum edge${protocol.loadHint ? ` (${protocol.loadHint})` : ''}`
      : 'bodyweight';

  const prescription = `${protocol.work}s on / ${protocol.rest}s off × ${protocol.reps} rep${
    protocol.reps === 1 ? '' : 's'
  } × ${protocol.sets} set${protocol.sets === 1 ? '' : 's'}`;

  const description = `${protocol.rationale ?? ''}\n\nPrescription: ${prescription} at ${loadLabel}. ${protocol.frequencyPerWeek}×/week.\n\nSource: ${protocol.source.title} — ${protocol.source.author}`.trim();

  const steps = [
    'Warm up 10 min easy climbing + pulling',
    `Setup edge at ${protocol.edgeRecommendation.prefer}mm`,
    `Execute: ${protocol.reps}×${protocol.sets} @ ${protocol.work}s on / ${protocol.rest}s off (rest ${protocol.restBetweenSets}s between sets)`,
    'Cool down and record load / edge used'
  ];

  // Rough duration estimate in minutes (warmup + work + rest + cooldown).
  const totalWorkSec =
    protocol.sets * (protocol.reps * protocol.work + (protocol.reps - 1) * protocol.rest) +
    (protocol.sets - 1) * protocol.restBetweenSets;
  const durationMinutes = Math.max(20, Math.round(totalWorkSec / 60) + 20);

  return {
    name: protocol.name,
    description,
    steps,
    durationMinutes,
    timerConfig: {
      workSeconds: protocol.work,
      restSeconds: protocol.rest,
      reps: protocol.reps,
      sets: protocol.sets,
      restBetweenSetsSeconds: protocol.restBetweenSets
    }
  };
}
