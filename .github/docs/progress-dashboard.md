# Progress Dashboard

## Status: 🔲 Not Started
## Clarification: ✅ CLARIFIED

## Decisions Made
| Question | Answer |
|----------|--------|
| Priority Metrics | Grades Sent, Consistency, Strength Gains |
| Default View | Monthly (4-week rolling) |
| Charts | Stacked bars (by grade), Line graphs, Calendar heatmap |
| Comparisons | vs Last Period + vs Personal Best |
| Complexity | Minimal default, expandable to Moderate |

## Overview
Visualize training data to help climbers track improvement and consistency. Show grades sent, training frequency, and trends over time.

## Requirements

### Key Metrics
| Metric | Description | Visualization |
|--------|-------------|---------------|
| Grades Sent | Highest grade sent, distribution | Bar chart by grade |
| Training Consistency | Sessions per week/month | Calendar heatmap or streak |
| Volume | Total climbs, attempts | Line chart over time |
| Session Duration | Average time training | Stat card |
| RPE Trends | Average difficulty over time | Line chart |

### Time Ranges
- [ ] Weekly view
- [ ] Monthly view (default)
- [ ] Quarterly view
- [ ] Custom date range

### Filters
- [ ] By workout type (Boulder, Sport, Hangboard, etc.)
- [ ] By location (if tracking gyms)
- [ ] Sent vs. Attempted

## UI Design

### Layout (Mobile-First)
```
┌─────────────────────────┐
│  Progress    [Monthly▼] │
├─────────────────────────┤
│ ┌─────────┐ ┌─────────┐ │
│ │Sessions │ │ Climbs  │ │
│ │   12    │ │   47    │ │
│ └─────────┘ └─────────┘ │
├─────────────────────────┤
│    Grade Distribution   │
│  ▃▅▇█▇▅▃                │
│ V0 V2 V4 V6 V8          │
├─────────────────────────┤
│   Training Calendar     │
│  □□■□■■□ (heatmap)      │
├─────────────────────────┤
│   Recent Sessions       │
│  • Jan 28 - Limit...    │
│  • Jan 26 - Volume...   │
└─────────────────────────┘
```

### Components Needed
- `StatCard` - Single metric with label
- `GradeChart` - Bar chart of grades
- `CalendarHeatmap` - Training consistency
- `TrendLine` - RPE or volume over time

## Technical Approach

### Data Aggregation
```typescript
// Aggregate from sessions
const getProgressStats = (sessions: SessionLog[], range: DateRange) => {
  const filtered = sessions.filter(s => inRange(s.date, range));
  return {
    totalSessions: filtered.length,
    totalClimbs: filtered.reduce((sum, s) => sum + s.climbs.length, 0),
    gradeDistribution: countByGrade(filtered),
    avgRpe: average(filtered.map(s => s.rpe)),
    avgDuration: average(filtered.map(s => s.durationMinutes)),
  };
};
```

### Chart Library Options
1. **Recharts** - React-native, good docs, ~45kb
2. **Chart.js + react-chartjs-2** - Feature-rich, ~60kb
3. **Custom SVG** - Lightweight, full control
4. **Nivo** - Beautiful but larger bundle

**Recommendation:** Start with custom SVG for simple charts, add library if needed.

## Implementation Steps

1. [ ] Create data aggregation utilities
2. [ ] Build `StatCard` component
3. [ ] Build simple grade bar chart (SVG)
4. [ ] Build calendar heatmap
5. [ ] Add time range selector
6. [ ] Integrate into Progress page
7. [ ] Add trend calculations

## Files to Modify
- `pages/Progress.tsx` - Main dashboard
- New: `components/stats/StatCard.tsx`
- New: `components/stats/GradeChart.tsx`
- New: `components/stats/CalendarHeatmap.tsx`
- New: `utils/stats.ts` - Aggregation functions

## Data Available
From `SessionLog`:
- `date`, `startTime`, `endTime`
- `durationMinutes`
- `rpe` (1-10)
- `climbs[]` with grade, attempts, sent
- `workoutId` (link to workout type)

## Future Enhancements
- Compare periods (this month vs last month)
- Personal records tracking
- Export data as CSV
- Share progress images
