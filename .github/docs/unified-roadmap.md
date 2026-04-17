# Unified Roadmap — Climbing Training Planner

**Status:** Draft · synthesized from two research passes on 2026-04-17.
**Sources:**
- Technical research: `session-state/.../research/how-to-improve-the-application.md`
- Content/UX research: `session-state/.../research/climbing-app-content-ux.md`

This doc is the single source of truth for *what* to build and *why*. For **live status** (completed / in-progress / shipped dates) see [roadmap.md](roadmap.md). Individual feature details live in per-feature docs in this folder (`.github/docs/`) and as GitHub issues.

---

## Product thesis

Climbers don't need another log — they need an **integrated plan + log + project loop** that turns recorded sessions into coaching prompts. The target user is the **plateaued V3–V8 intermediate** (persona "Sam" in the content research). Everything ships for her first; beginners (Alex), outdoor projecters (Jo), comp youth (Maya), and injury-returns (Kai) are addressed by persona-tagged templates and a feature ramp, not by separate apps.

The three bets:
1. **Auto-prescription, not just logging.** Every session shows what to do next, with a citation-backed reason.
2. **Safety built-in.** ACWR, deload, injury flags, pulley-pop guidance — never paywalled.
3. **Works at the gym.** Offline-first, Wake Lock, fast tap-level logging, timers accurate in background tabs.

---

## Architecture principles (from tech research)

- **Firebase rules + App Check** are prerequisites for any production data. Issue #3.
- **Config via env vars** so dev/staging/prod are separable. Issue #6.
- **Drop the CDN-loaded Tailwind + esm.sh importmap** in `index.html` — they bypass bundling and risk duplicate React instances.
- **Split `StoreContext`** into state + actions, memoize handlers, consider TanStack Query for caching.
- **Lazy-load pages** via `React.lazy` and add a router for deep links + back-button.
- **Validate Firestore reads with Zod** — the current `doc.data() as Workout` cast is unsafe.
- **Enable Firestore `persistentLocalCache`** + register a service worker (`vite-plugin-pwa`) — the gym has no signal.
- **Wake Lock** during sessions; timestamp-based timer math (never `+1` accumulation).

## Content principles (from UX research)

- **Three taps to log a send.** If a climber can't log between attempts without killing rest, they won't log at all.
- **Progressive-overload prompt** on every exercise with prior data. This is the single feature that converts "log" into "coach."
- **Persona-matched templates** at onboarding — no blank Dashboard ever again.
- **Grade systems are first-class.** International users need Font/YDS/French day one.
- **Never lecture.** Deload/load warnings always offer an actionable alternative.
- **Never gate safety** behind a paywall.

---

## Information architecture

Five tabs, each with a one-sentence job-to-be-done:

| Tab | JTBD | Primary content |
|---|---|---|
| **Dashboard** | What do I do *today*, am I ready? | Readiness pill · today's workout · overload hint · active goal · optional load warning |
| **Plan** | Shape my week/block. | Week view default; macro/meso editor (advanced, hidden from P1) |
| **Session** | Log fast, right now. | Full-screen when active |
| **Library** | Pick an exercise / workout / plan. | Three sub-tabs: Plans · Workouts · Exercises |
| **Stats** | Am I making progress? | Grade pyramid · finger strength / BW · load + ACWR · goals |

Add later: **Beta Book** (projecter journal), **Coach Mode** (read-only share), **Quick Log** FAB.

---

## Consolidated roadmap

### P0 — ship in order

| # | Area | Issue | Depends on |
|---|---|---|---|
| 1 | Security | Firestore rules ([#3](https://github.com/slm37102/Climbing-Training-Planner/issues/3)) | — |
| 2 | Security | Env-var Firebase config ([#6](https://github.com/slm37102/Climbing-Training-Planner/issues/6)) | — |
| 3 | Correctness | `crypto.randomUUID` IDs ([#5](https://github.com/slm37102/Climbing-Training-Planner/issues/5)) | — |
| 4 | Correctness | Grade ranking / V10 ordering ([#4](https://github.com/slm37102/Climbing-Training-Planner/issues/4)) | — |
| 5 | Content | Grade-system preference + conversion (V/Font/YDS/French/UIAA) | #4 |
| 6 | Content | 7 seeded training-plan templates (+ `TrainingPlan` entity, `phase` field) | — |
| 7 | Content | Hangboard protocol as first-class entity | — |
| 8 | Content / UX | Onboarding wizard → auto-assign plan | #5, #6 |
| 9 | UX | Pre-session readiness check-in | — |
| 10 | Content | Progressive-overload prompts on active workout | — |
| 11 | Content / Safety | Training load + ACWR chart + deload banner | — |

### P1 — next quarter

- Firestore offline persistence + `vite-plugin-pwa` manifest + install prompt.
- Wake Lock + timestamp-based timers; audio context always available.
- Replace Tailwind CDN + esm.sh importmap; real Vite build of Tailwind.
- Split `StoreContext` (state/actions); wrap actions in `useCallback`.
- Lazy-load pages; add React Router; wrap in `ErrorBoundary`.
- Exercise catalog: cues + common mistakes + video links; target ~50 canonical exercises.
- Beta Book / Project entity (attempts, high-point, conditions, video).
- Goal templates beyond grade sends (volume, strength, project, comp, rehab).
- Indoor vs outdoor fields on `ClimbLog` (route name, crag, rock, temp, humidity, send style).
- Post-injury protocols + rehab-aware scheduling; pulley-pop first-aid modal.
- Glossary + inline tooltips (RPE, ACWR, repeater, MVC, ARC, sRPE).
- Coach-share CSV export (persona P4 Maya).
- Zod validation on Firestore reads.

### P2 — differentiators

- Crag/route DB integration (Mountain Project / TheCrag / 27Crags).
- Finger strength ÷ BW benchmark chart vs. Lattice published bands.
- Time-to-send projection model for active projects.
- Partner session sharing + coach seat.
- Board integrations (Moonboard / Kilter / Tension) via deep link / API.
- Voice-note beta capture with auto-transcript.
- Board-angle logging + problem tags.

### Always in progress

- Accessibility: `aria-label` on icon-only buttons, `focus-visible` styles, contrast audit, minimum 12 px text.
- Storybook for `Button`, `GoalCard`, `StatCard`, readiness pill, grade picker.
- `eslint-plugin-jsx-a11y` + `eslint-plugin-react-hooks` in pre-commit.

---

## Ethical red lines

- **Never** gate load warnings, ACWR, injury flags, pulley-rupture first aid behind a paywall.
- **Never** sell climb-location data; crag protection & Indigenous-site sensitivity matters.
- **Never** default to public profiles for minors (persona P4).
- **No leaderboards by raw grade** — it incentivizes sandbagging, ego sends, and injury.

---

## Personas (reference)

| Persona | Grade | Goal | Default template | Status in app today |
|---|---|---|---|---|
| Alex — gym newcomer | VB–V2 | Have fun | Just Climb | Poorly served: shown max-hang protocols |
| **Sam — plateaued intermediate** (**primary**) | V3–V5 | Break plateau | Break V5 / RCTM 12 wk | Partly served: templates missing |
| Jo — outdoor projecter | V6–V8 | Send a line by season | Send Your Project 14 wk | Unserved: no project/Beta Book |
| Maya — competitive youth | V7+ | Podium | Comp Prep 6 wk | Unserved: no coach share |
| Kai — injury return | Was V7 | Return safely | Post-Injury Wk 1–8 | Unserved: no ACWR, no rehab plan |

---

## Confidence & assumptions

- **High confidence** on the P0 technical items — all code-verified against the current tree.
- **Medium confidence** on persona mapping and ACWR thresholds (Impellizzeri 2020 critique of the original Gabbett work; directionally correct, numerically approximate).
- **Assumption:** the committed Firebase config targets a single personal project; if a separate prod project exists with rules already deployed, P0 #1/#2 only apply to the dev environment.

See the two source research reports for full citations.
