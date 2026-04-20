// Staged rehab guidance for a generic A2-pulley strain.
//
// This is GENERAL CLIMBING COMMUNITY GUIDANCE — not medical advice. Content
// is drawn from publicly-available climbing rehab resources (Lattice
// Training, Hooper's Beta, Esther Smith, Dr. Volker Schöffl summaries) and
// intentionally kept qualitative. No specific weights, reps, or hang times
// are prescribed: individual injuries vary and loading decisions belong to a
// sports physician or hand specialist, not an app.
import type { RehabGoal } from '../types';

export interface RehabProtocol {
  phase: RehabGoal['phase'];
  title: string;
  /** Human-readable timeline, e.g. "Days 0–7". Individual recovery varies. */
  durationGuideline: string;
  goals: string[];
  /** What to do during this phase. */
  dos: string[];
  /** What to avoid during this phase. */
  donts: string[];
  /** One-liner describing allowed climbing load. */
  climbingLoad: string;
}

export const REHAB_DISCLAIMER =
  'This is general climbing community guidance, not medical advice. Consult a sports physician or hand specialist before returning to climbing.';

export const REHAB_PROTOCOLS: RehabProtocol[] = [
  {
    phase: 'acute',
    title: 'Acute — protect & calm down',
    durationGuideline: 'Days 0–7 (approximate)',
    goals: [
      'Reduce pain and swelling',
      'Protect the healing pulley from re-injury',
      'Preserve gentle finger range of motion',
    ],
    dos: [
      'Rest from climbing entirely',
      'Ice for short intervals if it feels soothing (optional)',
      'Gentle pain-free range-of-motion: slow fist open/close',
      'Keep the rest of your body moving — cardio, legs, core without grip',
      'Book an appointment with a hand-savvy physio or sports doctor',
    ],
    donts: [
      'No crimping of any kind',
      'No hangboarding or campus board',
      'No pull-ups on rungs or fingers',
      'Do not push into sharp pain during ROM',
      'Avoid "testing" the finger by pulling hard on holds',
    ],
    climbingLoad: 'No climbing. Full rest from finger loading.',
  },
  {
    phase: 'sub-acute',
    title: 'Sub-acute — reintroduce load',
    durationGuideline: 'Weeks 2–6 (approximate)',
    goals: [
      'Gradually reintroduce controlled finger load',
      'Rebuild tendon/pulley tolerance in open-hand grips',
      'Stay well below the pain threshold (aim for ≤ 3/10)',
    ],
    dos: [
      'Submaximal hangs on a large, deep edge, open-hand, bodyweight only, short holds',
      'Easy open-hand climbing on big holds (jugs, big slopers)',
      'H-tape the affected finger for support',
      'Antagonist & shoulder work to stay training',
      'Stop immediately if pain climbs above a mild ache',
    ],
    donts: [
      'No crimping (half or full)',
      'No dynos, lock-offs on small holds, or campus moves',
      'No maximal hangs or added weight',
      'No bouldering at your limit',
      'Do not progress load if pain > 3/10 during or next day',
    ],
    climbingLoad:
      'Very easy climbing on big open-hand holds only, well below your max grade.',
  },
  {
    phase: 'return-to-climb',
    title: 'Return to climb — progressive loading',
    durationGuideline: 'Weeks 6+ (approximate; full remodeling can take months)',
    goals: [
      'Progressively rebuild crimp tolerance',
      'Restore confidence on steeper and harder terrain',
      'Return to full training without flare-ups',
    ],
    dos: [
      'Gradually add load: edge size, hang time, then intensity — one variable at a time',
      'Keep H-taping for crimp-heavy sessions for the first few months',
      'Reintroduce half-crimp cautiously before any full-crimp',
      'Track pain daily on a 0–10 scale; back off if it trends up',
      'Check in with your physio before adding campus / max hangs',
    ],
    donts: [
      'No campus board or full-crimp max efforts for ~3 months',
      'No sudden jumps in intensity, volume, or edge size',
      'No ignoring warning signs — sharp, pinpoint pain means stop',
      'Do not skip warm-ups; always ramp in',
      'Do not compare your timeline to anyone else\'s',
    ],
    climbingLoad:
      'Progressive return to full climbing. Avoid campus and hard crimps for ~3 months.',
  },
];
