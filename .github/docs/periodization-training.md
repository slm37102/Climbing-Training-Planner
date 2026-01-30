# Periodization & Training Structure

## Status: 🔲 Not Started
## Clarification: ❓ NEEDS DISCUSSION

## Overview
Implement periodized training structure allowing climbers to plan training in cycles. Support template weekly programs that can be tweaked daily.

## Concepts

### Training Hierarchy
```
Macrocycle (3-12 months)
  └── Mesocycle (3-6 weeks)
        └── Microcycle (1 week)
              └── Daily Workouts
```

### Mesocycle Phases
| Phase | Focus | Duration | Example Workouts |
|-------|-------|----------|------------------|
| Base/Volume | Aerobic capacity, technique | 3-4 weeks | ARC, easy mileage |
| Strength | Max strength, recruitment | 3-4 weeks | Max hangs, limit bouldering |
| Power | Contact strength, dynos | 2-3 weeks | Campus, powerful boulders |
| Power Endurance | Sustained difficulty | 2-3 weeks | 4x4s, linked circuits |
| Performance | Peak, send projects | 1-2 weeks | Projecting, light training |
| Rest/Deload | Recovery | 1 week | Active rest, antagonist |

## Requirements

### Template Weekly Program
- [ ] Create reusable weekly templates
- [ ] Assign workouts to days of week
- [ ] "Apply template" to current/future weeks
- [ ] Tweak individual days without breaking template

### Mesocycle Planning
- [ ] Define mesocycle with name, duration, phase type
- [ ] Assign weekly template to mesocycle
- [ ] Auto-populate schedule when mesocycle starts
- [ ] Visual indicator of current phase

### Macrocycle View (Optional/Future)
- [ ] Bird's eye view of training year
- [ ] Color-coded phases
- [ ] Goal events (competitions, trips)

## Data Model

### New Types
```typescript
interface WeeklyTemplate {
  id: string;
  name: string;
  description?: string;
  days: {
    monday?: string[];    // workoutIds
    tuesday?: string[];
    wednesday?: string[];
    thursday?: string[];
    friday?: string[];
    saturday?: string[];
    sunday?: string[];
  };
}

interface Mesocycle {
  id: string;
  name: string;
  phase: MesocyclePhase;
  startDate: string;      // ISO date
  durationWeeks: number;
  weeklyTemplateId?: string;
  notes?: string;
}

type MesocyclePhase = 
  | 'Base' 
  | 'Strength' 
  | 'Power' 
  | 'Power Endurance' 
  | 'Performance' 
  | 'Deload';
```

### Firestore Structure
```
users/{userId}/
  ├── weeklyTemplates/{templateId}
  ├── mesocycles/{mesocycleId}
  └── schedule/{scheduleId}  // existing
```

## UI Design

### Weekly Template Editor
```
┌─────────────────────────────┐
│ Template: "Strength Phase"  │
├─────────────────────────────┤
│ Mon │ Tue │ Wed │ Thu │ ... │
├─────┼─────┼─────┼─────┼─────┤
│ Max │ REST│ Vol │ REST│ Lim │
│Hangs│     │ Day │     │Bould│
└─────┴─────┴─────┴─────┴─────┘
[ + Add Workout to Day ]
```

### Mesocycle View in Planner
```
┌─────────────────────────────┐
│ Strength Phase (Week 2/4)   │
│ ████████░░░░░░░░           │
├─────────────────────────────┤
│ < Week 4, Jan 27 - Feb 2 >  │
│ ... (existing weekly view)  │
└─────────────────────────────┘
```

## Implementation Steps

### Phase 1: Weekly Templates
1. [ ] Add `WeeklyTemplate` type
2. [ ] Add templates to StoreContext
3. [ ] Create template editor UI
4. [ ] "Apply to week" functionality

### Phase 2: Mesocycles
1. [ ] Add `Mesocycle` type
2. [ ] Add mesocycles to StoreContext
3. [ ] Create mesocycle planner UI
4. [ ] Show current phase in Planner header
5. [ ] Auto-populate schedule from template

### Phase 3: Polish
1. [ ] Mesocycle progress indicator
2. [ ] Phase recommendations/guidance
3. [ ] Copy/duplicate templates

## Files to Modify
- `types.ts` - New types
- `context/StoreContext.tsx` - New state & actions
- `pages/Planner.tsx` - Integrate mesocycle display
- New: `pages/TemplateEditor.tsx` or modal
- New: `pages/MesocyclePlanner.tsx` or modal

## Considerations
- Keep simple for MVP - templates first, mesocycles later
- Don't over-engineer - climbers may just want weekly templates
- Allow flexibility - not everyone follows strict periodization
