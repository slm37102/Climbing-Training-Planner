# Goal Tracking

## Status: 🔲 Not Started
## Clarification: ✅ CLARIFIED

## Decisions Made
| Question | Answer |
|----------|--------|
| Goal Types | Grade targets + Strength benchmarks |
| Deadline Style | User choice per goal (optional deadlines) |
| Auto-Detection | Fully automatic (mark complete when criteria met) |
| Progress Visibility | Everywhere (Dashboard, Progress, Session summary) |
| Goal History | Archive (hidden but viewable in "Past Goals") |

## Overview
Allow climbers to set and track goals with deadlines. Display progress toward goals in the Progress/Stats page.

## Goal Types

### Grade Goals
- "Send V6 by March 2025"
- "Flash V4 consistently"
- "Redpoint 5.12a outdoors"

### Training Goals
- "Train 4x per week for 8 weeks"
- "Complete strength phase"
- "Log 100 boulders this month"

### Strength Goals
- "Max hang +20kg on 18mm"
- "One-arm hang for 5 seconds"
- "Campus 1-4-7"

### Volume Goals
- "Climb 50 sessions this year"
- "30 days on rock"

## Data Model

### Types
```typescript
interface Goal {
  id: string;
  title: string;
  description?: string;
  type: GoalType;
  targetDate?: string;       // ISO date, optional for ongoing
  createdAt: string;
  completedAt?: string;
  status: 'active' | 'completed' | 'abandoned';
  
  // Type-specific target
  target: GradeTarget | TrainingTarget | StrengthTarget | VolumeTarget;
}

type GoalType = 'grade' | 'training' | 'strength' | 'volume';

interface GradeTarget {
  type: 'grade';
  grade: string;            // "V6", "5.12a"
  style: 'send' | 'flash' | 'onsight';
  climbType: 'boulder' | 'sport' | 'any';
  location?: 'gym' | 'outdoor' | 'any';
}

interface TrainingTarget {
  type: 'training';
  metric: 'sessions_per_week' | 'total_sessions' | 'total_climbs';
  targetValue: number;
  periodWeeks?: number;     // for "X per week for Y weeks"
}

interface StrengthTarget {
  type: 'strength';
  exerciseId?: string;      // optional link to exercise
  metric: string;           // "added_weight", "hold_time", "edge_depth"
  targetValue: number;
  unit: string;             // "kg", "seconds", "mm"
}

interface VolumeTarget {
  type: 'volume';
  metric: 'total_sessions' | 'outdoor_days' | 'total_climbs';
  targetValue: number;
  period: 'month' | 'year' | 'all_time';
}
```

### Firestore Structure
```
users/{userId}/
  └── goals/{goalId}
```

## UI Design

### Goals List (Progress Page)
```
┌─────────────────────────────────┐
│ 🎯 Goals                        │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ Send V6              ████░░ │ │
│ │ By March 15, 2025    67%    │ │
│ │ Current: V5 sent ✓          │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ Train 4x/week        ██████ │ │
│ │ 6/8 weeks complete   75%    │ │
│ │ This week: 3/4 ●●●○         │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ +20kg Max Hang       ████░░ │ │
│ │ No deadline          +15kg  │ │
│ │ 5kg to go                   │ │
│ └─────────────────────────────┘ │
│                                 │
│ [ + Add Goal ]                  │
└─────────────────────────────────┘
```

### Add Goal Modal
```
┌─────────────────────────────────┐
│ New Goal                    [×] │
├─────────────────────────────────┤
│ Goal Type:                      │
│ ○ Grade     ○ Training          │
│ ● Strength  ○ Volume            │
├─────────────────────────────────┤
│ Title: [Max Hang +20kg______]   │
│                                 │
│ Exercise: [Max Hangs ▼]         │
│ Target:   [20] kg               │
│                                 │
│ Deadline: [Optional____]        │
│ Notes:    [______________]      │
│                                 │
│ [Cancel]           [Create Goal]│
└─────────────────────────────────┘
```

### Goal Detail View
```
┌─────────────────────────────────┐
│ ← Send V6 Outdoors              │
├─────────────────────────────────┤
│ Target: V6 Send (Outdoor)       │
│ Deadline: March 15, 2025        │
│ Status: Active                  │
├─────────────────────────────────┤
│ Progress                        │
│ ████████████░░░░░░░░  67%       │
│                                 │
│ Current Max: V5                 │
│ V6 Attempts: 12                 │
│ Days to deadline: 45            │
├─────────────────────────────────┤
│ Related Sessions                │
│ • Jan 15 - V5 sent, V6 project  │
│ • Jan 12 - V6 attempts x3       │
│ • Jan 8 - V4 flash, V5 project  │
├─────────────────────────────────┤
│ [Mark Complete] [Abandon]       │
└─────────────────────────────────┘
```

## Progress Calculation

### Grade Goals
```typescript
function calculateGradeProgress(goal: Goal, sessions: SessionLog[]): number {
  const target = goal.target as GradeTarget;
  const targetGradeIndex = grades.indexOf(target.grade);
  
  // Find max grade sent matching criteria
  let maxSentIndex = 0;
  sessions.forEach(session => {
    session.climbs.forEach(climb => {
      if (climb.sent) {
        const gradeIndex = grades.indexOf(climb.grade);
        if (gradeIndex > maxSentIndex) maxSentIndex = gradeIndex;
      }
    });
  });
  
  return Math.min(100, (maxSentIndex / targetGradeIndex) * 100);
}
```

### Training Goals
```typescript
function calculateTrainingProgress(goal: Goal, sessions: SessionLog[]): number {
  const target = goal.target as TrainingTarget;
  
  if (target.metric === 'sessions_per_week') {
    // Count weeks meeting target
    const weeksComplete = countWeeksMeetingTarget(sessions, target.targetValue);
    return (weeksComplete / (target.periodWeeks || 8)) * 100;
  }
  
  if (target.metric === 'total_sessions') {
    return (sessions.length / target.targetValue) * 100;
  }
  
  return 0;
}
```

### Strength Goals
```typescript
function calculateStrengthProgress(goal: Goal, sessions: SessionLog[]): number {
  const target = goal.target as StrengthTarget;
  
  // Find max value logged for this exercise
  let maxValue = 0;
  sessions.forEach(session => {
    session.exerciseLogs?.forEach(log => {
      if (log.exerciseId === target.exerciseId) {
        const value = target.metric === 'added_weight' ? log.addedWeight : 0;
        if (value && value > maxValue) maxValue = value;
      }
    });
  });
  
  return Math.min(100, (maxValue / target.targetValue) * 100);
}
```

## Implementation Steps

### Phase 1: Basic Goals
1. [ ] Add Goal types to `types.ts`
2. [ ] Add goals state to StoreContext
3. [ ] Create goals list UI in Progress page
4. [ ] Add/edit goal modal

### Phase 2: Progress Tracking
1. [ ] Implement progress calculation functions
2. [ ] Progress bars in goal cards
3. [ ] Link sessions to goal progress

### Phase 3: Polish
1. [ ] Goal detail view
2. [ ] Notifications when goal reached
3. [ ] Goal history (completed/abandoned)
4. [ ] Goal suggestions based on history

## Files to Modify
- `types.ts` - Goal types
- `context/StoreContext.tsx` - Goals state & CRUD
- `pages/Progress.tsx` - Goals section
- New: `components/GoalCard.tsx`
- New: `components/GoalForm.tsx`

## Considerations
- Auto-detect goal completion from session logs
- Don't make goals feel like pressure
- Celebrate completions (confetti? 🎉)
- Allow editing target/deadline
- "Soft" deadlines - reminder not failure
