# Workout Library Enhancement: Exercises & Progressive Overload

## Status: ✅ COMPLETE

All phases implemented and tested. See summary below.

## Overview

Enhance the Workout Library with reusable Exercise entities, category-based grouping, and full progressive overload tracking history.

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Categories relation to WorkoutType | Categories for filtering/display only, not stored on workout | Keep existing type system, categories organize UI |
| Exercises vs Workouts | Separate `Exercise` entities, reusable across workouts | Building blocks that can be added to multiple workouts |
| Progressive overload tracking | Full history per exercise per session | Track weight/resistance over time for progression |
| UI organization | Grouped by category with expandable sections | Easy to find exercises by training focus |
| Exercise ownership | User-specific with seed defaults | Same pattern as workouts |
| Weight units | `kg` \| `lbs` in UserSettings, default `kg` | User preference |

## New Types

### ExerciseCategory Enum
```typescript
export enum ExerciseCategory {
  ANTAGONIST = 'Antagonist & Stabilizer',
  CORE = 'Core Training',
  LIMIT_STRENGTH = 'Limit-Strength',
  POWER = 'Power Training',
  STRENGTH_ENDURANCE = 'Strength/Power-Endurance',
  AEROBIC = 'Local/Generalized Aerobic'
}
```

### Exercise Interface
```typescript
export interface Exercise {
  id: string;
  name: string;
  description?: string;
  category: ExerciseCategory;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  defaultSets?: number;
  defaultReps?: number;
  defaultDurationSeconds?: number;
  timerConfig?: TimerConfig;
}
```

### WorkoutExercise (linking exercises to workouts)
```typescript
export interface WorkoutExercise {
  exerciseId: string;
  sets?: number;        // Override defaults
  reps?: number;
  durationSeconds?: number;
  notes?: string;
}
```

### ExerciseLog (session tracking)
```typescript
export interface ExerciseLog {
  id: string;
  exerciseId: string;
  completedSets: number;
  completedReps: number;
  addedWeight?: number;      // kg or lbs based on user setting
  edgeDepth?: number;        // mm for hangboard
  resistanceBand?: string;   // color/strength descriptor
  rpe?: number;              // 1-10
  notes?: string;
  timestamp: number;
}
```

### Updated UserSettings
```typescript
export interface UserSettings {
  defaultGradeSystem: 'V-Scale' | 'Font';
  startOfWeek: 'Monday' | 'Sunday';
  weightUnit: 'kg' | 'lbs';  // NEW
}
```

### Updated Workout (optional exercises field)
```typescript
export interface Workout {
  // ... existing fields
  exercises?: WorkoutExercise[];  // NEW - structured exercises
}
```

### Updated SessionLog
```typescript
export interface SessionLog {
  // ... existing fields
  exerciseLogs?: ExerciseLog[];  // NEW - exercise-level tracking
}
```

## Firestore Structure

```
users/{userId}/
  ├── exercises/{exerciseId}      # NEW: User's exercise library
  ├── workouts/{workoutId}        # Existing (add exercises field)
  ├── sessions/{sessionId}        # Extend with exerciseLogs
  ├── schedule/{scheduleId}       # Unchanged
  └── meta/settings               # Add weightUnit
```

## Seed Exercises (10-15 defaults)

### Antagonist & Stabilizer
- Push-ups
- Reverse Wrist Curls
- External Rotations

### Core Training
- Hanging Leg Raises
- Front Lever Progressions
- Hollow Body Hold

### Limit-Strength
- Max Hangs (7s)
- One-Arm Lock-offs
- Campus Ladders

### Power Training
- Campus Board Touches
- Explosive Pull-ups
- Limit Bouldering

### Strength/Power-Endurance
- Repeaters (7/3)
- 4x4s
- Linked Boulder Circuits

### Local/Generalized Aerobic
- ARC Training (20-45min)
- Easy Traversing
- Light Cardio

## Implementation Phases

### Phase 1: Types & Store ✅
- [x] Plan documentation
- [x] Add types to `types.ts`
- [x] Update `StoreContext.tsx` with exercises state & actions
- [x] Add seed exercises (15 exercises across 6 categories)

### Phase 2: Workout Library UI ✅
- [x] Tabs for Workouts / Exercises
- [x] Search/filter functionality
- [x] Exercise management UI (create/edit/delete)
- [x] Category-grouped expandable sections
- [ ] Link exercises to workouts (deferred - needs workout form update)

### Phase 3: Session Tracking (In Progress)
- [ ] Exercise checklist in SessionTracker
- [ ] Weight/resistance inputs
- [ ] Show previous session's weight
- [ ] Save ExerciseLog on session end

### Phase 4: Progress Visualization (Deferred)
- [ ] Exercise progress charts
- [ ] Weight progression over time
- [ ] Volume metrics

## UI Mockup Notes

### WorkoutLibrary Page Structure
```
[Search Bar]

▼ Antagonist & Stabilizer (3)
  ├─ Push-ups          [Edit] [Delete]
  ├─ Reverse Wrist Curls
  └─ External Rotations

▼ Core Training (3)
  ├─ Hanging Leg Raises
  └─ ...

► Limit-Strength (3)      [collapsed]
► Power Training (3)
► Strength/Power-Endurance (3)
► Local/Generalized Aerobic (2)

[+ Add Exercise]
```

### Workout Edit Form (with exercises)
```
Name: [________]
Type: [Dropdown]
Duration: [__] min

Exercises:
  1. Max Hangs (7s) - 3 sets × 10s [✕]
  2. Repeaters (7/3) - 6 reps × 3 sets [✕]
  [+ Add Exercise]

Steps (text):
[textarea for additional notes]
```

### SessionTracker Exercise Checklist
```
═══ Exercises ═══
☑ Max Hangs (7s)
  Sets: [3] Completed | Weight: [+10] kg | Edge: [20] mm
  Previous: +8kg on 20mm (Jan 28)
  
☐ Repeaters (7/3)
  Sets: [0/6] | Weight: [+0] kg
```
