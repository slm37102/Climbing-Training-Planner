export interface GlossaryEntry {
  term: string;
  short: string;
  long?: string;
  link?: string;
}

// Keys are lowercase ids used by <Term id="...">. Short copy should fit in a
// tooltip (one or two sentences, plain English, coach-accurate).
export const GLOSSARY: Record<string, GlossaryEntry> = {
  rpe: {
    term: 'RPE',
    short:
      'Rate of Perceived Exertion — a 0–10 subjective rating of how hard an effort felt.',
    long:
      'RPE 1 feels trivial, 5 is moderate, 10 is a maximum effort you could not sustain. Self-reported and athlete-specific.',
  },
  srpe: {
    term: 'sRPE',
    short:
      'Session-RPE: session RPE multiplied by duration in minutes. A simple unit-of-load metric (Foster 2001).',
    long:
      'Example: 60 min at RPE 7 = 420 AU (arbitrary units). Summing daily sRPE lets you track weekly load and ACWR.',
  },
  acwr: {
    term: 'ACWR',
    short:
      'Acute:Chronic Workload Ratio — last 7-day load divided by the 28-day rolling average. 0.8–1.3 is the "sweet spot"; >1.5 raises injury risk.',
    long:
      'Popularised by Gabbett (2016). Treat as guidance, not diagnosis (Impellizzeri 2020). Sudden spikes matter more than the absolute number.',
  },
  mvc: {
    term: 'MVC',
    short:
      'Maximum Voluntary Contraction — your peak isometric pull, typically measured on a specific hangboard edge.',
    long:
      'Used as a baseline to prescribe relative hangboard loads (e.g. "hang at 80% MVC for 7s").',
  },
  arc: {
    term: 'ARC',
    short:
      'Aerobic Restoration & Capillarity — long (20–45 min) continuous easy climbing to build forearm aerobic capacity.',
    long:
      'Coined by Eric Hörst. Intensity stays below the pump threshold; goal is blood flow, not failure.',
  },
  repeater: {
    term: 'Repeater',
    short:
      'Interval hangboard protocol — classically 7s hang / 3s rest × 6 reps per set, multiple sets per edge.',
    long:
      'Targets strength-endurance. Load is set so the final rep is hard but completable with good form.',
  },
  deload: {
    term: 'Deload',
    short:
      'A planned reduction in training load — usually 40–60% of normal volume — to allow recovery and adaptation.',
    long:
      'Typically one week every 3–6 weeks, or triggered by high ACWR / persistent fatigue.',
  },
  onsight: {
    term: 'Onsight',
    short:
      'Sending a route first try with no prior information or beta from watching others.',
  },
  flash: {
    term: 'Flash',
    short:
      'Sending a route first try with prior beta (watched someone else, got tips, etc.).',
  },
  redpoint: {
    term: 'Redpoint',
    short:
      'Sending a route cleanly after previous attempts or practice on it.',
  },
  repeat: {
    term: 'Repeat',
    short:
      'Re-climbing a route you have already sent — useful for mileage, volume, or confidence.',
  },
  periodization: {
    term: 'Periodization',
    short:
      'Organising training into phases with different focuses (base, strength, power, performance) to peak at the right time.',
  },
  macrocycle: {
    term: 'Macrocycle',
    short:
      'The largest training block — typically a season or 3–12 months built around a goal trip or competition.',
  },
  mesocycle: {
    term: 'Mesocycle',
    short:
      'A medium block within a macrocycle — usually 3–6 weeks focused on one quality (e.g. max strength, power-endurance).',
  },
  microcycle: {
    term: 'Microcycle',
    short:
      'A short training block — usually one week — that structures the pattern of hard/easy days.',
  },
  hangboard: {
    term: 'Hangboard',
    short:
      'A fingerboard with edges and pockets used for isometric finger-strength training.',
  },
  'campus-board': {
    term: 'Campus board',
    short:
      'An overhanging board with horizontal rungs climbed dynamically using only the hands. Targets contact strength and power.',
  },
  'spray-wall': {
    term: 'Spray wall',
    short:
      'A steep wall covered in holds where climbers invent boulders on the fly. Used for strength, volume and project-specific training.',
  },
};

export const glossaryList = (): GlossaryEntry[] =>
  Object.values(GLOSSARY).sort((a, b) => a.term.localeCompare(b.term));
