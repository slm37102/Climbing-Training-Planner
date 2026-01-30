# Timer Presets Per Workout

## Status: 🔲 Not Started
## Clarification: ❓ NEEDS DISCUSSION

## Overview
Allow users to customize and save timer presets for different workout types. Each workout can have its own default timer configuration.

## Current State
- `TimerConfig` exists on `Workout` and `Exercise` types
- SessionTracker uses workout's `timerConfig` for interval timer
- Rest timer has hardcoded quick-select buttons (1m, 2m, 3m)

## Requirements

### Custom Rest Timer Presets
- [ ] User-defined rest timer presets (e.g., 30s, 90s, 5min)
- [ ] Save presets globally in UserSettings
- [ ] Quick-select buttons update based on presets

### Workout-Specific Timer Defaults
- [ ] Each workout can have preferred rest duration
- [ ] Auto-start rest timer with workout's default
- [ ] Override globally in settings

### Interval Timer Presets
- [ ] Save common hangboard protocols as presets
- [ ] Quick-load preset into workout's timerConfig
- [ ] Examples: "7/3 Repeaters", "10s Max Hangs", "Density Hangs"

## Data Model

### Updated Types
```typescript
interface TimerPreset {
  id: string;
  name: string;
  type: 'rest' | 'interval';
  // Rest timer
  durationSeconds?: number;
  // Interval timer
  timerConfig?: TimerConfig;
}

interface UserSettings {
  defaultGradeSystem: 'V-Scale' | 'Font';
  startOfWeek: 'Monday' | 'Sunday';
  weightUnit: 'kg' | 'lbs';
  // NEW
  restTimerPresets: number[];  // [60, 120, 180] seconds
  intervalPresets: TimerPreset[];
  defaultRestSeconds: number;
}

interface Workout {
  // ... existing fields
  defaultRestSeconds?: number;  // NEW - workout-specific rest
}
```

### Default Interval Presets
```typescript
const DEFAULT_INTERVAL_PRESETS: TimerPreset[] = [
  {
    id: 'repeaters-7-3',
    name: '7/3 Repeaters',
    type: 'interval',
    timerConfig: { workSeconds: 7, restSeconds: 3, reps: 6, sets: 3, restBetweenSetsSeconds: 180 }
  },
  {
    id: 'max-hangs-10',
    name: '10s Max Hangs',
    type: 'interval',
    timerConfig: { workSeconds: 10, restSeconds: 0, reps: 1, sets: 5, restBetweenSetsSeconds: 180 }
  },
  {
    id: 'density-hangs',
    name: 'Density Hangs',
    type: 'interval',
    timerConfig: { workSeconds: 30, restSeconds: 30, reps: 6, sets: 1, restBetweenSetsSeconds: 0 }
  }
];
```

## UI Design

### Rest Timer Quick-Select (SessionTracker)
```
┌─────────────────────────────────┐
│ REST TIMER                      │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐│
│ │ 30s │ │ 90s │ │ 2m  │ │ 5m  ││
│ └─────┘ └─────┘ └─────┘ └─────┘│
│ [ Edit Presets... ]            │
└─────────────────────────────────┘
```

### Timer Preset Editor (Settings or Modal)
```
┌─────────────────────────────────┐
│ Rest Timer Presets              │
│ ┌─────────────────────────────┐ │
│ │ 30s    [Edit] [×]           │ │
│ │ 90s    [Edit] [×]           │ │
│ │ 2m     [Edit] [×]           │ │
│ │ 5m     [Edit] [×]           │ │
│ └─────────────────────────────┘ │
│ [ + Add Preset ]                │
├─────────────────────────────────┤
│ Interval Presets                │
│ ┌─────────────────────────────┐ │
│ │ 7/3 Repeaters   [Edit] [×]  │ │
│ │ 10s Max Hangs   [Edit] [×]  │ │
│ └─────────────────────────────┘ │
│ [ + Add Interval Preset ]       │
└─────────────────────────────────┘
```

### Workout Form - Rest Timer Selection
```
┌─────────────────────────────────┐
│ Default Rest Timer              │
│ ○ Use global default (2m)       │
│ ● Custom for this workout       │
│   └─ Duration: [___120___] sec  │
└─────────────────────────────────┘
```

## Implementation Steps

### Phase 1: Configurable Rest Presets
1. [ ] Add `restTimerPresets` to UserSettings
2. [ ] Update SessionTracker to use dynamic presets
3. [ ] Add settings UI to edit presets
4. [ ] Persist to Firestore

### Phase 2: Workout-Specific Defaults
1. [ ] Add `defaultRestSeconds` to Workout type
2. [ ] Update WorkoutForm with rest timer field
3. [ ] SessionTracker uses workout default if set

### Phase 3: Interval Presets
1. [ ] Add `intervalPresets` to UserSettings
2. [ ] Create preset selector in WorkoutForm
3. [ ] "Load from preset" in timerConfig editor
4. [ ] "Save as preset" from current config

## Files to Modify
- `types.ts` - Update UserSettings, Workout
- `context/StoreContext.tsx` - Settings persistence
- `pages/SessionTracker.tsx` - Dynamic rest buttons
- `pages/WorkoutLibrary.tsx` - WorkoutForm rest timer
- New: `components/TimerPresetEditor.tsx` or in Settings page

## Considerations
- Keep rest presets simple (just durations)
- Interval presets need full TimerConfig
- Don't overwhelm with options - sensible defaults
- Consider voice prompt for preset names
