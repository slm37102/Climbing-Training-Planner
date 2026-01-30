# Climbing Training Planner - Roadmap

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

---

## Planned Features (by Priority)

| # | Feature | Status | Clarified? | Doc |
|---|---------|--------|------------|-----|
| 1 | Periodization / Weekly Templates | 🔲 | ❓ | [periodization-training.md](periodization-training.md) |

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

*Last updated: January 30, 2026*
