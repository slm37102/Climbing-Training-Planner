// Pulley-pop / finger-injury self-triage flow.
//
// This is GENERAL CLIMBING COMMUNITY GUIDANCE — not medical advice. The flow
// helps a climber decide whether to seek urgent care or begin a conservative
// self-managed rehab phase. All outcomes end with a disclaimer pointing the
// user to a specialist.

export type TriageOutcome =
  | 'see-doctor-now'
  | 'likely-strain-start-acute'
  | 'minor-monitor';

export interface TriageAnswer {
  label: string;
  /** ID of the next question, or undefined if this answer is terminal. */
  next?: string;
  outcome?: TriageOutcome;
}

export interface TriageQuestion {
  id: string;
  text: string;
  answers: TriageAnswer[];
}

export const TRIAGE_DISCLAIMER =
  'This is general climbing community guidance, not medical advice. Consult a sports physician or hand specialist before returning to climbing.';

export const PULLEY_TRIAGE_STEPS: TriageQuestion[] = [
  {
    id: 'pop',
    text: 'Did you hear or feel an audible "pop" in the finger when the injury happened?',
    answers: [
      { label: 'Yes — I heard/felt a pop', outcome: 'see-doctor-now' },
      { label: 'No', next: 'rom' },
      { label: 'Not sure', next: 'rom' },
    ],
  },
  {
    id: 'rom',
    text: 'Can you fully bend and straighten the finger without sharp pain?',
    answers: [
      { label: 'Yes, mostly pain-free', next: 'swelling' },
      { label: 'Only partly — sharp pain at end range', outcome: 'see-doctor-now' },
      { label: 'No, I can\'t bend it fully', outcome: 'see-doctor-now' },
    ],
  },
  {
    id: 'swelling',
    text: 'Is there visible swelling or bruising at the base of the finger (A2 pulley area)?',
    answers: [
      { label: 'Yes, obvious swelling or bruising', outcome: 'likely-strain-start-acute' },
      { label: 'Mild puffiness or tenderness', outcome: 'likely-strain-start-acute' },
      { label: 'None at all', next: 'crimpPain' },
    ],
  },
  {
    id: 'crimpPain',
    text: 'What does it feel like to crimp bodyweight-only on a large, comfortable edge?',
    answers: [
      { label: 'Severe or sharp pain', outcome: 'see-doctor-now' },
      { label: 'Mild pain or tightness', outcome: 'likely-strain-start-acute' },
      { label: 'No pain at all', outcome: 'minor-monitor' },
    ],
  },
];

export interface TriageOutcomeCopy {
  headline: string;
  body: string;
  disclaimer: string;
}

export const TRIAGE_OUTCOME_COPY: Record<TriageOutcome, TriageOutcomeCopy> = {
  'see-doctor-now': {
    headline: 'See a specialist promptly',
    body:
      'Your answers suggest this could be a higher-grade pulley injury or another structural issue — a pop, inability to fully flex the finger, or severe pain on light load all warrant a proper hands-on assessment. Do not self-treat or "work through" this. Rest from climbing and get imaging (ultrasound or MRI) via a sports physician or hand specialist before doing any loaded rehab.',
    disclaimer: TRIAGE_DISCLAIMER,
  },
  'likely-strain-start-acute': {
    headline: 'Likely a low-grade strain — start the acute phase',
    body:
      'Your answers are consistent with a lower-grade pulley strain: some soreness or mild swelling, but you can still use the finger. The climbing-community-standard starting point is the acute phase — full rest from climbing, gentle range-of-motion, and an early specialist check-in. Progress to sub-acute only once pain has clearly settled. Any worsening, popping, or inability to bend the finger means stop and get assessed.',
    disclaimer: TRIAGE_DISCLAIMER,
  },
  'minor-monitor': {
    headline: 'Minor — monitor closely',
    body:
      'Nothing here flags an obvious pulley injury, but finger tweaks can still evolve. Back off crimping for a few days, avoid sudden max efforts, and re-test with easy climbing. If pain, swelling, or weakness appears in the next days — especially when crimping — stop and get it checked. When in doubt, a brief visit to a hand-savvy physio is always cheaper than a torn pulley.',
    disclaimer: TRIAGE_DISCLAIMER,
  },
};
