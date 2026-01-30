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
| ✅ Progress Dashboard | Stats, grade chart, heatmap, time ranges | Jan 2026 |

---

## Planned Features (by Priority)

| # | Feature | Status | Clarified? | Doc |
|---|---------|--------|------------|-----|
| 1 | Audio Cues for Timers | 🔲 | ✅ | [audio-cues-timers.md](audio-cues-timers.md) |
| 2 | Timer Presets | 🔲 | ❓ | [timer-presets.md](timer-presets.md) |
| 3 | Goal Tracking | 🔲 | ❓ | [goal-tracking.md](goal-tracking.md) |
| 4 | Periodization / Weekly Templates | 🔲 | ❓ | [periodization-training.md](periodization-training.md) |

---

## Clarification Questions

### Audio Cues for Timers
- [x] Sound type: **Beeps only** (simple tones)
- [x] When to play: **Phase transitions + Rep/Set completion**
- [x] Default: **On by default**
- [x] Volume: **System volume only**
- [x] Rest timer: **Beep when done**

### Progress Dashboard
- [x] Priority metrics: **Grades Sent, Consistency, Strength Gains**
- [x] Default view: **Monthly (4-week rolling)**
- [x] Chart types: **Stacked bars by grade, Line graphs, Calendar heatmap**
- [x] Comparisons: **vs Last Period + vs Personal Best**
- [x] Complexity: **Minimal default, expand to see more**

### Periodization / Weekly Templates
- [ ] Full periodization or just weekly templates?
- [ ] Auto-apply templates or manual?
- [ ] Mesocycle/phase tracking importance?

### Timer Presets
- [ ] Number of rest timer presets needed?
- [ ] Pre-loaded interval presets (7/3 Repeaters, etc.)?
- [ ] Per-workout rest timer defaults?

### Goal Tracking
- [ ] Types of goals you set?
- [ ] Hard deadlines or soft reminders?
- [ ] Auto-detect goal completion?

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
