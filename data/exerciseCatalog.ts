import { Exercise, ExerciseCategory } from '../types';

/**
 * EXERCISE_CATALOG — canonical, coach-vetted exercise reference.
 *
 * Source influences: Steve Bechtel, Eric Hörst (Training for Climbing),
 * Eva Lopez (Fingerboard Training), Lattice Training public content,
 * Power Company Climbing, Hoopers Beta.
 *
 * Conventions:
 * - IDs use the `cat-<slug>` prefix so catalog seeds are idempotent per user
 *   (re-seeding does not duplicate entries) and easy to distinguish from
 *   user-authored exercises.
 * - `videoUrl` is only populated when we have a confirmed reputable source.
 *   Do NOT invent links — omit the field when unsure.
 * - `steps` are 3–6 numbered execution cues.
 * - `cues` are 2–3 short form-correction reminders.
 * - `commonMistakes` are 2–3 things NOT to do.
 */
export const EXERCISE_CATALOG: Exercise[] = [
  // ─── Antagonist & Stabilizer ───────────────────────────────────────────────
  {
    id: 'cat-pushups',
    name: 'Push-ups',
    category: ExerciseCategory.ANTAGONIST,
    difficulty: 'Beginner',
    description: 'Classic chest/tricep/serratus balance for pulling-dominant climbers.',
    defaultSets: 3,
    defaultReps: 15,
    steps: [
      'Hands just wider than shoulders, body in one line from heel to head',
      'Brace glutes and core — no sagging hips or piked butt',
      'Lower chest to within a fist of the floor',
      'Press back up, protracting scapulae at the top'
    ],
    cues: ['Ribs down, pelvis tucked', 'Elbows ~45° from torso', 'Full lockout at top'],
    commonMistakes: ['Flaring elbows to 90°', 'Letting hips sag', 'Short range of motion']
  },
  {
    id: 'cat-face-pulls',
    name: 'Face Pulls',
    category: ExerciseCategory.ANTAGONIST,
    difficulty: 'Beginner',
    description: 'Rear-delt and mid-trap work with band or cable; essential shoulder health.',
    defaultSets: 3,
    defaultReps: 15,
    steps: [
      'Anchor a band at eye height, hold with overhand grip',
      'Step back until band is taut with arms extended',
      'Pull toward your face, leading with elbows high and wide',
      'Externally rotate at the top so thumbs point back',
      'Control the return over 2 seconds'
    ],
    cues: ['Elbows above wrists', 'Pull apart, not just back', 'Squeeze shoulder blades'],
    commonMistakes: ['Using too heavy a band (turns into a row)', 'Shrugging up with traps', 'Dropping the elbows']
  },
  {
    id: 'cat-reverse-wrist-curls',
    name: 'Reverse Wrist Curls',
    category: ExerciseCategory.ANTAGONIST,
    difficulty: 'Beginner',
    description: 'Forearm extensor strengthening; key for preventing medial elbow pain.',
    defaultSets: 3,
    defaultReps: 20,
    steps: [
      'Sit with forearm on thigh, palm facing down, light dumbbell in hand',
      'Let wrist drop below knee until fingers point at the floor',
      'Extend wrist upward as far as comfortable',
      'Lower over 2–3 seconds'
    ],
    cues: ['Isolate the wrist — forearm stays glued', 'Slow negative', 'Full ROM over load'],
    commonMistakes: ['Going too heavy and using the elbow', 'Bouncing at the bottom', 'Skipping the eccentric']
  },
  {
    id: 'cat-external-rotations',
    name: 'External Shoulder Rotation',
    category: ExerciseCategory.ANTAGONIST,
    difficulty: 'Beginner',
    description: 'Rotator cuff strength with band or light dumbbell — climbing insurance.',
    defaultSets: 3,
    defaultReps: 15,
    steps: [
      'Elbow tucked at side, bent to 90°, forearm across belly',
      'Anchor band at elbow height on the opposite side',
      'Rotate forearm outward keeping elbow pinned to ribs',
      'Pause at end range, control back over 2 seconds'
    ],
    cues: ['Elbow glued to ribs', 'Move only the forearm', 'Light weight, strict tempo'],
    commonMistakes: ['Using too much load', 'Letting the elbow drift forward', 'Rushing the eccentric']
  },
  {
    id: 'cat-scapular-pullups',
    name: 'Scapular Pull-ups',
    category: ExerciseCategory.ANTAGONIST,
    difficulty: 'Beginner',
    description: 'Teaches active shoulder engagement — the foundation of safe pulling.',
    defaultSets: 3,
    defaultReps: 10,
    steps: [
      'Dead hang from bar, arms fully extended',
      'Without bending elbows, depress and retract shoulder blades',
      'Body rises ~5–10 cm as shoulders pack down',
      'Hold 1 second, lower to full passive hang',
      'Repeat with slow tempo'
    ],
    cues: ['Chest up, shoulders away from ears', 'No elbow bend', 'Pause at the top'],
    commonMistakes: ['Shrugging up instead of pulling down', 'Bending elbows', 'Hanging passively between reps without resetting']
  },
  {
    id: 'cat-prone-ytw',
    name: 'Prone Y-T-W Raises',
    category: ExerciseCategory.ANTAGONIST,
    difficulty: 'Beginner',
    description: 'Low-load posterior chain and scapular endurance on floor or bench.',
    defaultSets: 3,
    defaultReps: 12,
    steps: [
      'Lie face-down, arms overhead forming a Y (thumbs up)',
      'Raise arms off floor, hold 2s, lower',
      'Move arms to T position, raise and hold',
      'Move to W (elbows bent, pinned to ribs), raise and hold',
      'Complete reps in each position'
    ],
    cues: ['Thumbs up throughout', 'Squeeze shoulder blades, not traps', 'Small lift, strict form'],
    commonMistakes: ['Going heavy (bodyweight is plenty)', 'Hyperextending lower back', 'Shrugging instead of retracting']
  },
  {
    id: 'cat-pike-pushups',
    name: 'Pike Push-ups',
    category: ExerciseCategory.ANTAGONIST,
    difficulty: 'Intermediate',
    description: 'Vertical pressing for overhead shoulder strength; progression to handstand push-ups.',
    defaultSets: 3,
    defaultReps: 10,
    steps: [
      'Start in downward-dog: hands shoulder-width, hips high, head between arms',
      'Lower the crown of the head toward the floor between your hands',
      'Keep elbows tracking over wrists, not flared',
      'Press back up to the starting pike position'
    ],
    cues: ['Hips stay high', 'Head leads the descent', 'Full lockout at the top'],
    commonMistakes: ['Turning it into a regular push-up', 'Flaring elbows', 'Half reps']
  },

  // ─── Core Training ─────────────────────────────────────────────────────────
  {
    id: 'cat-hollow-body',
    name: 'Hollow Body Hold',
    category: ExerciseCategory.CORE,
    difficulty: 'Beginner',
    description: 'Gymnastic isometric that teaches full-body tension — the core position of climbing.',
    defaultSets: 3,
    defaultDurationSeconds: 30,
    steps: [
      'Lie on back, arms extended overhead, legs straight',
      'Press lower back flat into the floor',
      'Lift arms, shoulders, and legs off the floor simultaneously',
      'Hold the banana shape, breathing shallowly through the ribs'
    ],
    cues: ['Lower back glued to floor', 'Squeeze glutes and quads', 'Eyes on toes'],
    commonMistakes: ['Arching the lower back', 'Holding breath', 'Bending knees to make it easier without regressing the position']
  },
  {
    id: 'cat-dragon-flag',
    name: 'Dragon Flag',
    category: ExerciseCategory.CORE,
    difficulty: 'Advanced',
    description: 'Advanced full-body lever popularized by Bruce Lee; elite anterior core strength.',
    defaultSets: 3,
    defaultReps: 5,
    steps: [
      'Lie on a sturdy bench, grip behind your head',
      'Drive shoulder blades into the bench and lift legs and hips up as one rigid unit',
      'Lower the straight body under control until almost horizontal',
      'Reverse to start without piking at the hips',
      'Breathe out on the way down'
    ],
    cues: ['Body stays one rigid plank', 'Squeeze glutes hard', 'Lower slow — 3–5 s eccentric'],
    commonMistakes: ['Piking at the hips on the descent', 'Kipping back up with momentum', 'Arching lower back under load']
  },
  {
    id: 'cat-toes-to-bar',
    name: 'Toes-to-Bar',
    category: ExerciseCategory.CORE,
    difficulty: 'Intermediate',
    description: 'Hanging compound core lift: hip flexion + shoulder control on the bar.',
    defaultSets: 3,
    defaultReps: 8,
    steps: [
      'Dead hang from bar, actively engage shoulders (no passive hang)',
      'Press arms slightly forward to tilt pelvis',
      'Bring straight legs up to touch the bar with toes',
      'Lower with control — no swinging'
    ],
    cues: ['Active shoulders throughout', 'Lead with hips, not feet', 'Controlled descent'],
    commonMistakes: ['Kipping for momentum', 'Bending knees and calling it leg raises', 'Passive shoulder hang']
  },
  {
    id: 'cat-windshield-wipers',
    name: 'Windshield Wipers',
    category: ExerciseCategory.CORE,
    difficulty: 'Advanced',
    description: 'Hanging rotational core for torque control on steep climbing.',
    defaultSets: 3,
    defaultReps: 6,
    steps: [
      'Hang from bar, raise legs to L-sit or toes-to-bar position',
      'Keeping legs together and straight, rotate them side-to-side',
      'Control the return through center',
      'Tempo: 2 seconds per side'
    ],
    cues: ['Squeeze legs together', 'Rotate from the trunk, not the knees', 'Keep shoulders packed'],
    commonMistakes: ['Dropping the legs too low', 'Using swing to reach end range', 'Soft shoulders — risk of strain']
  },
  {
    id: 'cat-anti-rotation-press',
    name: 'Pallof Press (Anti-Rotation)',
    category: ExerciseCategory.CORE,
    difficulty: 'Beginner',
    description: 'Resists rotation — trains the stability climbers need to hold swings on overhangs.',
    defaultSets: 3,
    defaultReps: 10,
    steps: [
      'Anchor a band at sternum height, stand side-on',
      'Grip band with both hands at chest, stand tall',
      'Press hands straight out until elbows lock',
      'Resist the rotational pull for 2 seconds',
      'Return under control; complete reps both sides'
    ],
    cues: ['Stay square to the front', 'Brace like you’re about to be punched', 'Slow and boring is correct'],
    commonMistakes: ['Letting torso twist toward anchor', 'Rushing the reps', 'Going too heavy and compensating with hips']
  },
  {
    id: 'cat-hanging-leg-raises',
    name: 'Hanging Leg Raises',
    category: ExerciseCategory.CORE,
    difficulty: 'Intermediate',
    description: 'Straight-leg raises from a bar — staple anterior core for climbers.',
    defaultSets: 3,
    defaultReps: 10,
    steps: [
      'Active dead hang, shoulders packed',
      'Without kipping, raise straight legs to at least 90°',
      'Pause briefly at the top',
      'Lower with control, resisting swing'
    ],
    cues: ['Legs straight, toes pointed', 'No swing — pause if needed', 'Exhale on the way up'],
    commonMistakes: ['Bent knees (regression is fine, but name it honestly)', 'Kipping', 'Dropping down fast']
  },
  {
    id: 'cat-front-lever-progression',
    name: 'Front Lever Progression',
    category: ExerciseCategory.CORE,
    difficulty: 'Advanced',
    description: 'Tuck / advanced tuck / straddle / full front lever isometric holds.',
    defaultSets: 5,
    defaultDurationSeconds: 10,
    steps: [
      'Choose progression: tuck → advanced tuck → one-leg → straddle → full',
      'From a hang, pull hips up until body is horizontal',
      'Pack shoulders and depress scapulae hard',
      'Hold max 10 s with perfect form — stop before the body breaks',
      'Rest 2–3 min between sets'
    ],
    cues: ['Straight arms, locked elbows', 'Hollow body, no arching', 'Hold quality over duration'],
    commonMistakes: ['Progressing too fast and losing position', 'Arching the lower back', 'Bent arms to cheat the lever']
  },
  {
    id: 'cat-dead-bugs',
    name: 'Dead Bugs',
    category: ExerciseCategory.CORE,
    difficulty: 'Beginner',
    description: 'Low-risk anti-extension drill that teaches bracing under limb movement.',
    defaultSets: 3,
    defaultReps: 12,
    steps: [
      'Lie on back, arms up, knees and hips at 90°',
      'Press lower back into the floor and hold',
      'Extend opposite arm and leg slowly until just above the floor',
      'Return to start without losing the flat back',
      'Alternate sides'
    ],
    cues: ['Lower back stays glued down', 'Breathe out as you extend', 'Move slow — this is a control drill'],
    commonMistakes: ['Letting the lower back arch', 'Holding breath', 'Moving too fast']
  },

  // ─── Limit-Strength ────────────────────────────────────────────────────────
  {
    id: 'cat-max-hangs-20mm',
    name: 'Max Hangs — 20 mm',
    category: ExerciseCategory.LIMIT_STRENGTH,
    difficulty: 'Intermediate',
    description: 'Short near-maximal hangs on a 20 mm edge. Classic finger-strength builder.',
    defaultSets: 5,
    defaultDurationSeconds: 10,
    timerConfig: { workSeconds: 10, restSeconds: 0, reps: 1, sets: 5, restBetweenSetsSeconds: 180 },
    pillar: 'MaxHang',
    steps: [
      'Warm up fingers with pulley and progressive loading (~15 min)',
      'Half-crimp or open-hand on a 20 mm edge',
      'Hang 7–10 s at a load you could hold for ~12 s max (RPE 8–9)',
      'Rest 3 min between sets, 5 sets total',
      'Stop the set if grip shape deteriorates'
    ],
    cues: ['Active shoulders — no passive hang', 'Lock grip shape before adding load', 'Stop before form breaks'],
    commonMistakes: ['Going to failure every set', 'Sloppy grip (half-crimp collapsing to drag)', 'Skipping warm-up'],
    videoUrl: 'https://latticetraining.com/2020/06/23/max-hangs-and-how-to-use-them/'
  },
  {
    id: 'cat-max-hangs-10mm',
    name: 'Max Hangs — 10 mm',
    category: ExerciseCategory.LIMIT_STRENGTH,
    difficulty: 'Advanced',
    description: 'Small-edge max hangs for advanced climbers with healthy, conditioned fingers.',
    defaultSets: 5,
    defaultDurationSeconds: 7,
    timerConfig: { workSeconds: 7, restSeconds: 0, reps: 1, sets: 5, restBetweenSetsSeconds: 180 },
    pillar: 'MaxHang',
    steps: [
      'Only attempt if you own solid 20 mm strength and no finger injuries',
      'Half-crimp or open-hand on 10 mm',
      'Hang 5–8 s at near-maximal load',
      'Rest 3 min between reps, 5 reps total',
      'End session the moment grip slips'
    ],
    cues: ['Quality > quantity', 'Half-crimp must stay stacked', 'Rest fully between reps'],
    commonMistakes: ['Using before fingers are ready', 'Letting crimp collapse', 'Chasing load at the cost of form']
  },
  {
    id: 'cat-no-hangs',
    name: 'No-Hangs (Pick-up Lifts)',
    category: ExerciseCategory.LIMIT_STRENGTH,
    difficulty: 'Beginner',
    description: 'Finger lifts from a block/edge on the floor — scalable, low-risk finger strength.',
    defaultSets: 5,
    defaultDurationSeconds: 7,
    pillar: 'NoHangs',
    steps: [
      'Set an edge on the floor, loaded with dumbbells or plates via sling',
      'Kneel or sit tall, one hand on edge in half-crimp',
      'Lift the load off the floor without rounding the back',
      'Hold 7–10 s, lower under control',
      'Rest 2–3 min, repeat both hands'
    ],
    cues: ['Straight arm, engaged shoulder', 'Pull vertically — no swinging', 'Lock grip shape before lifting'],
    commonMistakes: ['Rounding the back', 'Jerking load off the floor', 'Bending the arm (becomes a row)']
  },
  {
    id: 'cat-weighted-pullups',
    name: 'Weighted Pull-ups',
    category: ExerciseCategory.LIMIT_STRENGTH,
    difficulty: 'Intermediate',
    description: 'Low-rep heavy pull-ups — the classic climbing upper-body strength lift.',
    defaultSets: 4,
    defaultReps: 5,
    steps: [
      'Hang weight from belt or hold between feet',
      'Start from a full dead hang, shoulders engaged',
      'Pull chin clearly over the bar',
      'Lower over 2–3 s to full extension',
      'Rest 3 min between sets, 4×3–5 reps'
    ],
    cues: ['Full ROM — dead hang to chin over bar', 'Controlled eccentric', 'Retract scapulae before initiating pull'],
    commonMistakes: ['Kipping', 'Partial range of motion', 'Rushing the eccentric']
  },
  {
    id: 'cat-one-arm-hang-progression',
    name: 'One-Arm Hang Progression',
    category: ExerciseCategory.LIMIT_STRENGTH,
    difficulty: 'Advanced',
    description: 'Assisted one-arm hangs on a 20 mm edge using pulley or band offload.',
    defaultSets: 4,
    defaultDurationSeconds: 10,
    pillar: 'MaxHang',
    steps: [
      'Only attempt once two-arm max hangs at BW+30% for 10 s on 20 mm are solid',
      'Rig a pulley or band to offload 20–50% bodyweight',
      'Hang from one arm, 7–10 s, half-crimp',
      'Engage shoulder hard — no dangling',
      'Rest 3 min, alternate hands, 4–5 reps per hand'
    ],
    cues: ['Shoulder packed and active', 'Keep feet still — no momentum', 'Progress assistance slowly'],
    commonMistakes: ['Swinging the free arm', 'Using a dead/passive shoulder', 'Jumping to unassisted too soon']
  },
  {
    id: 'cat-campus-rung-hangs',
    name: 'Campus Rung Hangs',
    category: ExerciseCategory.LIMIT_STRENGTH,
    difficulty: 'Advanced',
    description: 'Static hangs on wooden campus rungs for advanced grip strength.',
    defaultSets: 5,
    defaultDurationSeconds: 10,
    pillar: 'MaxHang',
    steps: [
      'Choose medium rung, half-crimp grip',
      'Hang 7–10 s at high effort (RPE 8)',
      'Feet may touch floor for partial unloading',
      'Rest 3 min between reps',
      'Stop if grip shape changes'
    ],
    cues: ['Even load across fingers', 'Shoulders packed', 'Half-crimp stays stacked'],
    commonMistakes: ['Switching to drag mid-hang', 'Campusing between rungs (that’s a different drill)', 'Using if fingers are fatigued']
  },
  {
    id: 'cat-lock-offs',
    name: 'One-Arm Lock-offs',
    category: ExerciseCategory.LIMIT_STRENGTH,
    difficulty: 'Advanced',
    description: 'Isometric lock-offs at 90° and/or chin-over-bar, assisted as needed.',
    defaultSets: 3,
    defaultReps: 3,
    steps: [
      'Pull up to target angle (120°, 90°, or full lock)',
      'Hold one arm, other hand assists minimally on a second grip or foot',
      'Hold 3–5 s, lower under control',
      'Rest 2–3 min, alternate arms'
    ],
    cues: ['Shoulder locked down and back', 'Engaged lats', 'Minimal assistance from helper hand'],
    commonMistakes: ['Too much help from the second hand', 'Shrugging up', 'Rushing the descent']
  },

  // ─── Power Training ────────────────────────────────────────────────────────
  {
    id: 'cat-limit-boulders',
    name: 'Limit Boulders',
    category: ExerciseCategory.POWER,
    difficulty: 'Advanced',
    description: 'Projecting at or near max grade — the purest power + skill work.',
    defaultSets: 5,
    defaultReps: 2,
    targetDurationMinutes: 60,
    pillar: 'LimitBoulder',
    steps: [
      'Warm up thoroughly: pulse raiser + progressive bouldering (~25 min)',
      'Pick 2–4 boulders at or above flash grade (problems that take 3–20+ attempts)',
      'Give ≥4 min rest between attempts; quality moves only',
      'Session duration ~45–75 min; stop when power drops',
      'Log which moves felt limiting — strength, contact, body position'
    ],
    cues: ['Max intent every try', 'Long rests — recover fully', 'Stop when moves slow down'],
    commonMistakes: ['Too many attempts in a row', 'Getting pumped on warm-up boulders', 'Extending the session past quality']
  },
  {
    id: 'cat-campus-laddering',
    name: 'Campus Laddering',
    category: ExerciseCategory.POWER,
    difficulty: 'Advanced',
    description: '1-2-3 / 1-3-5 campus ladders on wooden rungs for contact strength + power.',
    defaultSets: 5,
    defaultReps: 2,
    pillar: 'Power',
    steps: [
      'Only for climbers with ≥2 years healthy finger training',
      'Start matched on rung 1, half-crimp',
      'Ladder up: left to 2, right to 3 (1-2-3); variants 1-3-5, 1-4-7',
      'Match on top rung, drop off with control — do NOT downclimb',
      'Rest 3–5 min between reps, 4–6 reps total'
    ],
    cues: ['Full commitment on each pull — no half-efforts', 'Dead-point the target rung', 'Stop when precision drops'],
    commonMistakes: ['Down-laddering (finger-unfriendly)', 'Doing reps when fatigued', 'Using smaller rungs too early']
  },
  {
    id: 'cat-double-dyno',
    name: 'Double Dyno',
    category: ExerciseCategory.POWER,
    difficulty: 'Advanced',
    description: 'Two-handed dynamic throws on a board or campus — full-body rate-of-force work.',
    defaultSets: 5,
    defaultReps: 2,
    pillar: 'Power',
    steps: [
      'Pick two matching holds within reach distance on a steep wall or board',
      'Set feet and generate drive from legs and hips',
      'Release and throw to a matching target, both hands simultaneously',
      'Stick the catch, then drop off controlled',
      'Rest 3 min between attempts'
    ],
    cues: ['Drive from the legs', 'Eyes to target before releasing', 'Commit fully or don’t go'],
    commonMistakes: ['Generating with arms only', 'Training when already fatigued', 'Poor crash-pad setup']
  },
  {
    id: 'cat-footless-bump',
    name: 'Footless Bump (Campus)',
    category: ExerciseCategory.POWER,
    difficulty: 'Advanced',
    description: 'Bump one hand up a rung then back down — unilateral contact-strength work.',
    defaultSets: 4,
    defaultReps: 3,
    pillar: 'Power',
    steps: [
      'Hang matched on a medium rung',
      'Bump one hand up one rung, then return to match',
      'Alternate hands, 3–5 bumps per set',
      'Rest 3 min between sets',
      'Stop once bump speed slows'
    ],
    cues: ['Short, sharp movement', 'Shoulders engaged throughout', 'Precise hand placement'],
    commonMistakes: ['Swinging feet for momentum', 'Overreaching and missing', 'Rushing between reps']
  },
  {
    id: 'cat-explosive-pullups',
    name: 'Explosive Pull-ups',
    category: ExerciseCategory.POWER,
    difficulty: 'Intermediate',
    description: 'Fast, powerful pull-ups — hands may leave the bar. Builds RFD for climbing.',
    defaultSets: 4,
    defaultReps: 5,
    pillar: 'Power',
    steps: [
      'Dead hang, engage shoulders',
      'Pull as explosively as possible — aim to clear the bar',
      'Catch and lower under control',
      'Rest 2–3 min between sets'
    ],
    cues: ['Max intent every rep', 'Full ROM', 'Stop when rep speed slows'],
    commonMistakes: ['Kipping instead of pressing', 'Crashing down hard on the negative', 'Doing them fatigued (they become regular pull-ups)']
  },

  // ─── Strength / Power-Endurance ───────────────────────────────────────────
  {
    id: 'cat-4x4s',
    name: '4×4s',
    category: ExerciseCategory.STRENGTH_ENDURANCE,
    difficulty: 'Intermediate',
    description: '4 boulders × 4 laps with short rest — the classic bouldering PE session.',
    defaultSets: 4,
    defaultReps: 4,
    targetDurationMinutes: 45,
    pillar: 'Endurance',
    steps: [
      'Pick 4 boulders you can send clean (2–3 grades below max)',
      'Climb all 4 back-to-back with minimal rest between problems',
      'Rest 3–4 min after the round',
      'Complete 4 rounds total',
      'If you fail a boulder twice, swap it down one grade'
    ],
    cues: ['Move efficiently, breathe between moves', 'Down-climb or drop off smart', 'Match the grade to the target pump'],
    commonMistakes: ['Picking boulders too hard — turns into projecting', 'Resting too long mid-round', 'Sandbagging the grades (no training effect)']
  },
  {
    id: 'cat-repeaters-7-3',
    name: 'Repeaters 7/3',
    category: ExerciseCategory.STRENGTH_ENDURANCE,
    difficulty: 'Intermediate',
    description: '7 s hang / 3 s rest × 6 reps per set. Hangboard PE staple.',
    defaultSets: 3,
    defaultReps: 6,
    timerConfig: { workSeconds: 7, restSeconds: 3, reps: 6, sets: 3, restBetweenSetsSeconds: 180 },
    pillar: 'Repeaters',
    steps: [
      'Warm up fingers thoroughly',
      'Pick a 20 mm edge and a load you can JUST complete the set on',
      '7 s hang, 3 s rest × 6 — that’s one set',
      'Rest 3 min between sets, 3–6 sets total',
      'Grade the session by how much the last rep hurts — aim for RPE 8'
    ],
    cues: ['Keep grip shape across the set', 'Controlled unload between reps', 'Stop the set if shape collapses'],
    commonMistakes: ['Going to failure every set', 'Dropping to passive hang between reps', 'Too much added weight']
  },
  {
    id: 'cat-linkups',
    name: 'Boulder Link-ups',
    category: ExerciseCategory.STRENGTH_ENDURANCE,
    difficulty: 'Intermediate',
    description: 'Chain 2–3 boulders into one long route — builds sport-climbing endurance.',
    defaultSets: 3,
    defaultReps: 1,
    pillar: 'Endurance',
    steps: [
      'Pick 2–3 boulders that finish near the start of the next',
      'Climb them in sequence without touching the ground',
      'Rest 4–6 min between link attempts',
      'Scale the total moves to ~20–40 for a PE stimulus'
    ],
    cues: ['Breathe on rests', 'Don’t over-grip between cruxes', 'Plan the sequence before you start'],
    commonMistakes: ['Picking problems that are too hard', 'Stopping to chalk excessively', 'Not respecting the rest interval between links']
  },
  {
    id: 'cat-arcing',
    name: 'ARC Training',
    category: ExerciseCategory.AEROBIC,
    difficulty: 'Beginner',
    description: '20–45 min continuous easy climbing — Aerobic Restoration & Capillarity.',
    defaultSets: 1,
    defaultDurationSeconds: 1800,
    targetDurationMinutes: 30,
    pillar: 'Endurance',
    steps: [
      'Pick terrain 3–5 grades below max — should feel very easy',
      'Climb continuously for 20–45 min, no coming off',
      'Stay relaxed: never feel a pump, never breathe hard',
      'Down-climb, traverse, link easy routes',
      'Finish when moves start feeling inefficient, not pumped'
    ],
    cues: ['If you’re pumped, it’s too hard', 'Breathe nasally throughout', 'Relaxed grip, efficient feet'],
    commonMistakes: ['Climbing too hard (becomes PE work)', 'Stopping at chains (breaks the stimulus)', 'Tensing up — defeats the purpose']
  },
  {
    id: 'cat-density-hangs',
    name: 'Density Hangs',
    category: ExerciseCategory.STRENGTH_ENDURANCE,
    difficulty: 'Intermediate',
    description: 'Long (20–40 s) repeated hangs at moderate load — dense capillary work.',
    defaultSets: 6,
    defaultDurationSeconds: 30,
    timerConfig: { workSeconds: 30, restSeconds: 30, reps: 6, sets: 1, restBetweenSetsSeconds: 0 },
    pillar: 'Endurance',
    steps: [
      'Warm up fingers',
      'Use a 20 mm edge, bodyweight or light added',
      '30 s hang / 30 s rest × 6',
      'Grip shape should be the same on rep 1 and rep 6'
    ],
    cues: ['Moderate load — you should want to continue', 'Passive unload between reps is OK', 'Stop if shape drops'],
    commonMistakes: ['Going too heavy — shape collapses', 'Skipping warm-up (long TUT = injury risk)', 'Chasing pump as the goal']
  },

  // ─── Local / Generalized Aerobic ──────────────────────────────────────────
  {
    id: 'cat-easy-traverse',
    name: 'Easy Traversing',
    category: ExerciseCategory.AEROBIC,
    difficulty: 'Beginner',
    description: 'Low-intensity wall traversing for recovery and technique work.',
    defaultSets: 1,
    defaultDurationSeconds: 1200,
    targetDurationMinutes: 20,
    pillar: 'Endurance',
    steps: [
      'Use juggy, large holds on low-angle or vertical wall',
      'Traverse continuously for 10–20 min',
      'Focus on precise footwork and silent feet',
      'Breathe nasally; never get pumped'
    ],
    cues: ['Silent feet', 'Relaxed grip', 'Steady breathing'],
    commonMistakes: ['Making it a campus traverse', 'Skipping technique focus', 'Going too hard and turning it into PE']
  },
  {
    id: 'cat-feet-on-routes',
    name: 'Feet-on Routes',
    category: ExerciseCategory.AEROBIC,
    difficulty: 'Beginner',
    description: 'Climb easy rope routes with strict foot use for aerobic base and efficiency.',
    defaultSets: 1,
    defaultDurationSeconds: 1800,
    targetDurationMinutes: 30,
    pillar: 'Endurance',
    steps: [
      'Pick routes 3–5 grades below your max',
      'Climb several routes back-to-back, resting only while rope is pulled',
      'Focus on perfect footwork and relaxed grip',
      '25–45 min total time on the wall'
    ],
    cues: ['Weight on feet, light hands', 'Quiet footwork', 'Keep breathing slow'],
    commonMistakes: ['Climbing too hard (no aerobic benefit)', 'Skipping rest between routes (flips to PE)', 'Cutting loose needlessly']
  },
  {
    id: 'cat-long-arc',
    name: 'Long ARC Session',
    category: ExerciseCategory.AEROBIC,
    difficulty: 'Intermediate',
    description: 'Extended 45–90 min ARC session — deep aerobic adaptation.',
    defaultSets: 1,
    defaultDurationSeconds: 3600,
    targetDurationMinutes: 60,
    pillar: 'Endurance',
    steps: [
      'Terrain well below max — continuous climbing without pump',
      '45–90 min total, broken into 3 × 15–30 min blocks if needed',
      'Short rests between blocks (1–2 min) to keep intensity low',
      'Stay relaxed, breathe nasally, prioritize technique'
    ],
    cues: ['Never breathe hard', 'If pumped, drop the grade', 'Keep shoulders and jaw relaxed'],
    commonMistakes: ['Turning blocks into PE intervals', 'Chasing grade at the cost of continuity', 'Skipping hydration for a long session']
  },

  // ─── Additions (wave 5) ───────────────────────────────────────────────────
  {
    id: 'cat-band-pull-aparts',
    name: 'Band Pull-Aparts',
    category: ExerciseCategory.ANTAGONIST,
    difficulty: 'Beginner',
    description: 'High-rep rear-delt and scapular retractor work with a light band. Great daily "shoulder floss" for pulling-heavy athletes.',
    defaultSets: 3,
    defaultReps: 20,
    steps: [
      'Hold a light band in both hands at shoulder height, arms extended',
      'Pull the band apart by driving elbows back and out',
      'Finish with the band touching your sternum, shoulder blades squeezed',
      'Return slowly to the starting position without losing tension'
    ],
    cues: ['Lead with the mid-back, not the hands', 'Keep ribs down — don\'t arch', 'Slow return, no snap-back'],
    commonMistakes: ['Shrugging the traps up', 'Bending elbows and turning it into a row', 'Using a band too heavy to finish all reps clean']
  },
  {
    id: 'cat-finger-extensions',
    name: 'Rubber Band Finger Extensions',
    category: ExerciseCategory.ANTAGONIST,
    difficulty: 'Beginner',
    description: 'Opens the hand against resistance to train finger extensors — the antagonists climbers almost never use directly. Key for elbow and hand joint health.',
    defaultSets: 3,
    defaultReps: 25,
    steps: [
      'Loop a dedicated finger-extension band around all five fingertips',
      'Start with fingers bunched, band slack',
      'Open the hand fully, spreading fingers against the band',
      'Close slowly over 2 seconds',
      'Both hands each set'
    ],
    cues: ['Full open — fingers splayed, not just unbunched', 'Keep wrist neutral', 'Slow eccentric'],
    commonMistakes: ['Band too stiff — thumb dominates', 'Rushing reps', 'Only doing it when pain already exists (train preventatively)']
  },
  {
    id: 'cat-hollow-rocks',
    name: 'Hollow Body Rocks',
    category: ExerciseCategory.CORE,
    difficulty: 'Intermediate',
    description: 'Dynamic progression of the hollow hold — rock back and forth while keeping the banana-shape rigid. Builds the tension reflex that transfers to steep climbing.',
    defaultSets: 3,
    defaultDurationSeconds: 30,
    steps: [
      'Start in a hollow body hold (arms overhead, legs low, lower back flat)',
      'Without losing the shape, rock head-to-toe like a rocking chair',
      'Drive the rock from the hips, not by bending at the waist',
      'Breathe shallow; maintain tension through the full range',
      'Continue smooth rocking for the target time'
    ],
    cues: ['Shape stays locked — only the whole body moves', 'Small controlled rocks, not big floppy ones', 'Lower back never leaves contact on the bottom phase'],
    commonMistakes: ['Piking at the hips to generate momentum', 'Letting arms and legs drop out of position', 'Holding breath']
  },
  {
    id: 'cat-side-plank-hip-dips',
    name: 'Side Plank with Hip Dips',
    category: ExerciseCategory.CORE,
    difficulty: 'Beginner',
    description: 'Lateral core and hip stability through a dynamic side-plank variation — the obliques and QL drive stable footwork on slabs and arêtes.',
    defaultSets: 3,
    defaultReps: 12,
    steps: [
      'Side plank on forearm, feet stacked, body in a straight line',
      'Lower the bottom hip toward the floor under control',
      'Drive back up, pressing hip above the line into a slight crunch',
      'Complete reps on one side, then switch',
      'Keep the supporting shoulder packed the whole set'
    ],
    cues: ['Elbow directly under shoulder', 'Squeeze the top oblique at the top', 'Feet stay still — the trunk does the work'],
    commonMistakes: ['Rolling forward or back out of the side-plank plane', 'Collapsing into the supporting shoulder', 'Bending at the waist instead of moving from the hip']
  },
  {
    id: 'cat-l-sit-progression',
    name: 'L-Sit Progression',
    category: ExerciseCategory.CORE,
    difficulty: 'Intermediate',
    description: 'Tucked → one-leg → full L-sit holds on parallettes, rings, or the floor. Trains hip-flexor and anterior-core strength together with shoulder depression.',
    defaultSets: 5,
    defaultDurationSeconds: 15,
    steps: [
      'Support on parallettes or the floor, arms straight, shoulders depressed',
      'Pick a level: tuck → one leg extended → full L',
      'Lift hips so the full weight is on the hands',
      'Hold 8–15 s with perfect form; stop before the shape breaks',
      'Rest 90 s between holds, 5 sets total'
    ],
    cues: ['Shoulders pressed down away from ears', 'Toes pointed, legs squeezing together', 'Posterior tilt of the pelvis'],
    commonMistakes: ['Shrugging up into the traps', 'Letting knees sag when they should be locked', 'Chasing duration at the cost of position']
  },
  {
    id: 'cat-min-edge-hangs',
    name: 'Minimum-Edge Hangs',
    category: ExerciseCategory.LIMIT_STRENGTH,
    difficulty: 'Advanced',
    description: 'Bodyweight hangs on the smallest edge you can hold for the target time. Eva López-style recruitment work for experienced, uninjured fingers.',
    defaultSets: 4,
    defaultDurationSeconds: 10,
    timerConfig: { workSeconds: 10, restSeconds: 0, reps: 1, sets: 4, restBetweenSetsSeconds: 180 },
    pillar: 'MaxHang',
    steps: [
      'Thoroughly warm up fingers with pulleys and progressive edges',
      'Find the smallest edge you can hang at bodyweight for ~10 s in half-crimp',
      'Hang 10 s; feet come off cleanly, no dabbing',
      'Rest 3 min between reps, 4–5 reps total',
      'Stop the session the moment grip shape changes'
    ],
    cues: ['Lock the grip shape before lifting feet', 'Shoulders packed and active', 'Quality over duration'],
    commonMistakes: ['Dropping the grip to drag or open mid-hang', 'Progressing edge size before the target time is solid', 'Using when fingers are pre-fatigued']
  },
  {
    id: 'cat-pinch-block-lifts',
    name: 'Pinch Block Lifts',
    category: ExerciseCategory.LIMIT_STRENGTH,
    difficulty: 'Intermediate',
    description: 'Floor pick-ups on a wooden pinch block loaded with a dumbbell — scalable limit-strength work for thumb and lumbrical-driven pinch grip.',
    defaultSets: 5,
    defaultDurationSeconds: 10,
    pillar: 'NoHangs',
    steps: [
      'Attach a dumbbell or kettlebell to a wooden pinch block via sling',
      'Stand tall, shoulder packed, arm hanging at the side',
      'Lift the block with a pinch grip — thumb on one face, fingers on the other',
      'Hold 8–10 s, lower under control',
      'Rest 2–3 min, alternate hands, 4–6 reps per hand'
    ],
    cues: ['Pinch width matches the climbing holds you care about', 'Thumb pad pressed hard, not crimped at the joint', 'Straight arm — this is a grip lift, not a row'],
    commonMistakes: ['Letting the block twist in the hand', 'Bending the elbow to cheat', 'Jumping loads too fast — thumbs injure slowly and quietly']
  },
  {
    id: 'cat-weighted-deadhangs',
    name: 'Weighted Dead Hangs',
    category: ExerciseCategory.LIMIT_STRENGTH,
    difficulty: 'Advanced',
    description: 'Two-arm max hangs with added weight on a 20 mm edge — the progression when bodyweight hangs stop feeling challenging.',
    defaultSets: 5,
    defaultDurationSeconds: 10,
    timerConfig: { workSeconds: 10, restSeconds: 0, reps: 1, sets: 5, restBetweenSetsSeconds: 180 },
    pillar: 'MaxHang',
    steps: [
      'Warm up fingers progressively (~15 min)',
      'Add weight via weight belt or vest',
      'Half-crimp or open-hand on 20 mm, hang 7–10 s at RPE 8–9',
      'Rest 3 min between reps, 5 reps total',
      'Increase load in ~2 kg steps once the top reps feel clean'
    ],
    cues: ['Lock grip shape before loading the hang', 'Shoulders engaged from the start', 'Same grip on every rep'],
    commonMistakes: ['Jumping load in large chunks', 'Hanging passively between reps', 'Chasing weight while grip quality drops']
  },
  {
    id: 'cat-board-limit-bouldering',
    name: 'Board Limit Bouldering',
    category: ExerciseCategory.POWER,
    difficulty: 'Advanced',
    description: 'Projecting limit problems on a steep symmetric board (MoonBoard, Kilter, Tension). Highest-quality stimulus for pulling power and body tension.',
    defaultSets: 6,
    defaultReps: 1,
    targetDurationMinutes: 60,
    pillar: 'LimitBoulder',
    steps: [
      'Warm up progressively on the same board — easy to medium problems',
      'Pick 1–3 problems at or slightly above flash grade',
      'Give each attempt maximum effort; rest ≥4 min between tries',
      'Cap the session at ~60 min or when pulling power visibly drops',
      'Log the move or body position that feels limiting'
    ],
    cues: ['Max intent on every pull', 'Don\'t chase a send — chase good attempts', 'Stop when moves slow down'],
    commonMistakes: ['Going back-to-back with short rests (becomes PE)', 'Climbing too many "warm-up+1" problems instead of true limit moves', 'Training it when finger recovery is incomplete']
  },
  {
    id: 'cat-deadpoint-drills',
    name: 'Dynamic Deadpoint Drills',
    category: ExerciseCategory.POWER,
    difficulty: 'Intermediate',
    description: 'Throws to a target hold timed so the hand arrives at the apex of the body\'s travel. Builds precision rate-of-force without pure campus risk.',
    defaultSets: 5,
    defaultReps: 3,
    pillar: 'Power',
    steps: [
      'On a steep wall or board, set a start hold and a clearly-defined target',
      'Engage feet and body tension, eyes locked on the target',
      'Drive explosively and release as the body reaches the deadpoint',
      'Stick the catch, lower off if needed',
      'Rest 2–3 min between reps; 4–6 sets'
    ],
    cues: ['Drive from feet and hips, not arms', 'Catch at the apex — not on the way down', 'Precise target — no flinging'],
    commonMistakes: ['Throwing too early or too late (you feel the hold rip out of the hand)', 'Tensing the grabbing arm before release', 'Ignoring foot placement']
  },
  {
    id: 'cat-plyo-pullups',
    name: 'Plyometric Pull-ups',
    category: ExerciseCategory.POWER,
    difficulty: 'Advanced',
    description: 'Clap or hand-release pull-ups on a bar — brief airborne phase. Advanced upper-body plyometric for experienced pullers only.',
    defaultSets: 4,
    defaultReps: 3,
    pillar: 'Power',
    steps: [
      'Only attempt with a strong weighted pull-up base (BW+20% for 5 clean reps)',
      'Dead hang, shoulders packed',
      'Pull as explosively as possible — release the bar briefly at the top',
      'Catch with soft elbows, lower under control',
      'Rest 3 min between sets; stop when speed drops'
    ],
    cues: ['Short contact time — in-and-out', 'Full lockout intent, not half-pull', 'Soft catch, loaded shoulders'],
    commonMistakes: ['Attempting without a solid strength base', 'Crashing down on straight arms', 'Training them when upper body is fatigued']
  },
  {
    id: 'cat-repeaters-submax',
    name: 'Sub-Max Repeaters',
    category: ExerciseCategory.STRENGTH_ENDURANCE,
    difficulty: 'Intermediate',
    description: 'Longer repeater sets (10/5 or 10/3) at moderate load — builds local forearm endurance without the max-intensity stress of 7/3s.',
    defaultSets: 4,
    defaultReps: 6,
    timerConfig: { workSeconds: 10, restSeconds: 5, reps: 6, sets: 4, restBetweenSetsSeconds: 180 },
    pillar: 'Repeaters',
    steps: [
      'Warm up fingers thoroughly',
      'Pick a 20 mm edge and a load you can complete at RPE 7',
      '10 s hang / 5 s rest × 6 — that\'s one set',
      'Rest 3 min between sets, 4–6 sets total',
      'Same grip shape on rep 1 and rep 6 — that\'s the success criterion'
    ],
    cues: ['Leave 1–2 reps in the tank per set', 'Controlled unload between reps', 'Consistent grip throughout the set'],
    commonMistakes: ['Treating it as a max session — it\'s volume work', 'Grip collapsing on the last rep', 'Skipping warm-up']
  },
  {
    id: 'cat-route-intervals',
    name: 'Route Intervals (On/Off)',
    category: ExerciseCategory.STRENGTH_ENDURANCE,
    difficulty: 'Intermediate',
    description: 'Alternating work/rest intervals on moderate routes — typical protocol: 4 min on the wall / 4 min rest × 4–6 rounds. Targets anaerobic-aerobic transition.',
    defaultSets: 5,
    defaultReps: 1,
    targetDurationMinutes: 45,
    pillar: 'Endurance',
    steps: [
      'Warm up with easy climbing and a route or two below target grade',
      'Pick routes 2–3 grades below max that take ~4 min to climb',
      'Climb one route (or traverse that duration); rest an equal period',
      'Repeat 4–6 rounds total',
      'Target a strong pump by the last round that recovers in the rest'
    ],
    cues: ['Match work duration between rounds — consistency matters', 'Shake out actively on rest, don\'t sit down', 'Scale grade down if pump doesn\'t clear'],
    commonMistakes: ['Cherry-picking routes that are too short', 'Cutting rest when tired — defeats the protocol', 'Going to complete failure early and losing the back half']
  },
  {
    id: 'cat-traverse-circuits',
    name: 'Traverse Circuits',
    category: ExerciseCategory.AEROBIC,
    difficulty: 'Beginner',
    description: 'Set traverse loops that chain back on themselves — climb for 3–8 min continuously, rest, repeat. Volume and capillarity with tight movement focus.',
    defaultSets: 4,
    defaultReps: 1,
    targetDurationMinutes: 30,
    pillar: 'Endurance',
    steps: [
      'Mark a traverse loop on a low-angle or slightly overhanging wall using easy holds',
      'Climb the loop continuously for 3–8 min per round',
      'Rest 2–3 min between rounds, 3–5 rounds total',
      'Mix in down-climbing and reversing direction for variety',
      'Stop before a real pump builds'
    ],
    cues: ['Quiet, precise feet', 'Relaxed grip — hang from the skeleton', 'Breathe through the nose'],
    commonMistakes: ['Picking holds that push intensity into PE range', 'Skipping technique focus', 'Dropping off between rounds instead of down-climbing']
  },
  {
    id: 'cat-volume-bouldering',
    name: 'Low-Intensity Volume Bouldering',
    category: ExerciseCategory.AEROBIC,
    difficulty: 'Beginner',
    description: 'High-volume session on easy-to-moderate boulders (4–6 grades below max) for technique, movement variety, and aerobic base.',
    defaultSets: 1,
    defaultDurationSeconds: 3600,
    targetDurationMinutes: 60,
    pillar: 'Endurance',
    steps: [
      'Pick problems 4–6 grades below max — none should feel hard',
      'Climb 30–60 problems over 45–90 min with minimal rest',
      'Rotate through different styles: slab, vert, overhang, slopers, crimps',
      'Focus on perfect movement; do not project',
      'Stop before pump or grip quality drops'
    ],
    cues: ['Send clean first go — no repeats when you blow a move', 'Vary styles aggressively', 'Keep transitions short'],
    commonMistakes: ['Drifting up into near-max problems', 'Taking long socializing rests', 'Turning it into a redpoint session when an easy goes unsent']
  }
];
