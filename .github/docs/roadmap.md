# Climbing Training Planner - Roadmap

> **Operational status tracker.** For product strategy, personas, architecture principles, and the prioritized P0 list with linked GitHub issues, see [unified-roadmap.md](unified-roadmap.md).

## Status Legend
| Symbol | Meaning |
|--------|---------|
| ✅ | Completed |
| 🔲 | Not Started |
| 🚧 | In Progress |
| ❓ | Needs Clarification |

---

## Completed Features

| Feature | Description | Date |
|---------|-------------|------|
| ✅ Firebase Auth | Email/Password + Google Sign-In | Jan 2026 |
| ✅ Firestore Migration | Real-time sync, per-user data | Jan 2026 |
| ✅ Exercise System | Exercise types, categories, CRUD | Jan 2026 |
| ✅ SessionTracker Enhancements | Exercise checklist, progressive overload hints | Jan 2026 |
| ✅ Workout-Exercise Linking | Attach exercises to workouts | Jan 2026 |
| ✅ Multiple Workouts Per Day | Schedule multiple workouts on same date | Jan 2026 |
| ✅ Interval Timers | Hangboard protocols (work/rest/sets) | Jan 2026 |
| ✅ Rest Timers | Quick-select rest timers in session | Jan 2026 |
| ✅ Audio Cues for Timers | Web Audio API beeps for timer transitions | Jan 2026 |
| ✅ Timer Presets | Pre-loaded hangboard protocols in WorkoutForm | Jan 2026 |
| ✅ Progress Dashboard | Stats, calendar heatmap, grade profile, time ranges | Jan 2026 |
| ✅ Goal Tracking | Grade targets, strength benchmarks, auto-detection, achievements | Jan 2026 |
| ✅ Firestore Security Rules | Owner-only access via `request.auth.uid == uid` ([#16](https://github.com/slm37102/Climbing-Training-Planner/pull/16)) | Apr 2026 |
| ✅ Env-var Firebase Config | `VITE_FIREBASE_*` config; startup validation ([#17](https://github.com/slm37102/Climbing-Training-Planner/pull/17)) | Apr 2026 |
| ✅ Stable IDs + Grade Ordering | `crypto.randomUUID` + numeric grade ranking ([#15](https://github.com/slm37102/Climbing-Training-Planner/pull/15)) | Apr 2026 |
| ✅ Hangboard Protocol Entity | Science-backed protocol catalog + picker ([#18](https://github.com/slm37102/Climbing-Training-Planner/pull/18)) | Apr 2026 |
| ✅ Grade System Preference + Conversion | V / Font / YDS / French / UIAA with per-climb system ([#19](https://github.com/slm37102/Climbing-Training-Planner/pull/19)) | Apr 2026 |
| ✅ ACWR Deload Banner | Chronic/acute load chart + deload guidance ([#20](https://github.com/slm37102/Climbing-Training-Planner/pull/20)) | Apr 2026 |
| ✅ Pre-Session Readiness | Sleep / skin / energy / stress → readiness score + swap dialog ([#22](https://github.com/slm37102/Climbing-Training-Planner/pull/22)) | Apr 2026 |
| ✅ Progressive-Overload Prompts | Per-pillar overload rules surfaced in SessionTracker + Dashboard ([#23](https://github.com/slm37102/Climbing-Training-Planner/pull/23)) | Apr 2026 |
| ✅ Training Plan Templates | 7 seed plans (Just Climb, RCTM, Peaking, Undulating, Rehab, Comp, Intro) ([#24](https://github.com/slm37102/Climbing-Training-Planner/pull/24)) | Apr 2026 |
| ✅ Onboarding Wizard | 7-question flow → auto-assigned plan for persona ([#25](https://github.com/slm37102/Climbing-Training-Planner/pull/25)) | Apr 2026 |

---

## Planned Features (by Priority)

| # | Feature | Status | Clarified? | Doc |
|---|---------|--------|------------|-----|
| 1 | Periodization / Weekly Templates | 🚧 (partial — plan templates shipped; full macro/meso cycle UI pending) | ❓ | [periodization-training.md](periodization-training.md) |
| 2 | Bundle code-splitting (lazy-load pages) | 🔲 | ❓ | — |
| 3 | Offline / PWA (Firestore persistence + service worker) | 🔲 | ❓ | — |
| 4 | Wake Lock + timestamp-based timers | 🔲 | ❓ | — |
| 5 | React Router + deep links | 🔲 | ❓ | — |

---

## Clarification Questions

### Progress Dashboard ✅ IMPLEMENTED
- [x] Priority metrics: **Grades Sent, Consistency, Strength Gains**
- [x] Default view: **Monthly (4-week rolling)**
- [x] Chart types: **Stacked bars by grade, Line graphs, Calendar heatmap**
- [x] Comparisons: **vs Last Period + vs Personal Best**
- [x] Complexity: **Minimal default, expand to see more**

### Periodization / Weekly Templates
- [ ] Full periodization or just weekly templates?
- [ ] Auto-apply templates or manual?
- [ ] Mesocycle/phase tracking importance?

### Timer Presets ✅ IMPLEMENTED
- [x] Rest timer presets: **Keep current 3** (1m, 2m, 3m)
- [x] Interval presets: **Pre-loaded + user "Save as preset"**
- [x] UI: **Preset cards** showing work/rest/sets

### Goal Tracking ✅ CLARIFIED
- [x] Goal types: **Grade targets + Strength benchmarks**
- [x] Deadlines: **User choice per goal** (optional)
- [x] Auto-detection: **Fully automatic**
- [x] Visibility: **Dashboard, Progress, Session summary**
- [x] History: **Archive** (hidden but viewable)

---

## Future Ideas (Backlog)
- Offline mode / PWA caching
- Social features (share workouts)
- Export data (CSV, PDF)
- Outdoor climbing log with location
- Integration with training boards (Kilter, Tension)
- Apple Watch / wearable companion

---

## How to Use This Roadmap

1. **Before implementing a feature**: Ensure it's marked ✅ Clarified
2. **Update status** when starting work: 🔲 → 🚧
3. **Mark complete** when merged to main: 🚧 → ✅
4. **Add completion date** to Completed Features table
5. **Link PRs** in the individual feature docs

---

*Last updated: April 20, 2026 — all 11 P0 items from the unified roadmap shipped.*
