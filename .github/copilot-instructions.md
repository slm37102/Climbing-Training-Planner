# Copilot Instructions for Climbing Training Planner

## Important: Communication Guidelines
- **Always ask clarifying questions** before implementing features or making significant changes
- When requirements are ambiguous, confirm understanding before writing code
- For complex features, propose an approach first and wait for approval
- Create separate markdown files in `.github/docs/` if detailed documentation is needed for a feature

## Git Workflow
- **Commit and push at every milestone** - After completing a feature, fix, or significant change
- Use conventional commit messages: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`
- `main` branch is production - do not push directly without completing work
- Create feature branches for larger changes, then merge to main

## Project Overview
A mobile-first React climbing training app ("Climbing Training Planner") built with Vite + TypeScript. The primary goal is to let climbers schedule their training week and immediately see today's workout when opening the app. Secondary features include session tracking, climb logging, and progress monitoring.

## Architecture

### State Management
- **Single global store** via React Context in [context/StoreContext.tsx](../context/StoreContext.tsx)
- **Firebase Firestore** for data persistence with real-time sync
- Access state via `useStore()` hook - never prop-drill store data
- Store provides both state and action methods (e.g., `addWorkout`, `startSession`)
- All actions are async and write directly to Firestore

### Authentication
- **Firebase Auth** via [context/AuthContext.tsx](../context/AuthContext.tsx)
- Supports Email/Password and Google Sign-In
- Access via `useAuth()` hook - provides `user`, `loading`, `signInWithEmail`, `signInWithGoogle`, `logout`
- App requires authentication - shows [Login.tsx](../pages/Login.tsx) when not signed in

### Firestore Data Structure
```
users/{userId}/
  ├── workouts/{workoutId}     # Workout templates
  ├── schedule/{scheduleId}    # Scheduled workouts by date
  ├── sessions/{sessionId}     # Completed session logs
  └── meta/settings            # User settings + activeSessionId
```
- Real-time sync via `onSnapshot` listeners
- New users are seeded with default workouts on first login

### Navigation Pattern
- No router library - manual view switching via `AppView` enum in [types.ts](../types.ts)
- `currentView` state in [App.tsx](../App.tsx) controls which page renders
- Pages receive `onNavigate` callback to switch views

### Core Data Types (see [types.ts](../types.ts))
- `Workout` - Reusable workout templates with optional `TimerConfig` for interval training
- `ScheduledWorkout` - Links a workout to a date (supports multiple per day)
- `SessionLog` - Completed training session with RPE, notes, and climb logs
- `ClimbLog` - Individual climb attempts with grade, attempts, and send status

## UI Conventions

### Styling
- **Tailwind CSS** with custom stone/amber color palette
- Use `cn()` from [utils.ts](../utils.ts) (combines `clsx` + `tailwind-merge`) for conditional classes
- Mobile-first: max-width `max-w-md`, bottom navigation with safe-area padding

### Components
- UI primitives in `components/ui/` - currently only [Button.tsx](../components/ui/Button.tsx)
- Button variants: `primary` (amber), `secondary`, `danger`, `ghost`, `outline`
- Icons from `lucide-react` - import individual icons

### Layout Structure
- [Layout.tsx](../components/Layout.tsx) provides bottom nav and content wrapper
- Pages render inside `<main>` with `pb-20` for nav clearance
- Active session indicator: pulsing amber "Play" button in nav

## Key Patterns

### Adding New Workouts
```typescript
const { addWorkout } = useStore();
addWorkout({
  name: 'My Workout',
  type: WorkoutType.BOULDER,
  description: '...',
  durationMinutes: 60,
  steps: ['Step 1', 'Step 2'],
  timerConfig: undefined // or TimerConfig for hangboard
});
```

### Session Flow
1. `startSession(workoutId)` creates `SessionLog`, sets `activeSessionId`
2. [SessionTracker.tsx](../pages/SessionTracker.tsx) renders when `activeSessionId` exists
3. User logs climbs, uses rest/interval timers
4. `endSession(id)` calculates duration, clears `activeSessionId`

### Date Handling
- All dates stored as ISO strings `YYYY-MM-DD`
- Use `formatDate(date)` from utils for consistency
- Week starts Monday (hardcoded in Planner)

## Development

```bash
npm install        # Install dependencies
npm run dev        # Start dev server at localhost:3000
npm run build      # Production build
```

### Testing
- **Vitest** + **React Testing Library** for unit and component tests
- **Playwright** for E2E tests
- Tests in `test/` directory, E2E in `e2e/` directory
- Firebase mocked in [test/setup.ts](../test/setup.ts)
```bash
npm test           # Run all tests once
npm run test:watch # Watch mode for development
npm run test:coverage # Run with coverage report
npm run test:e2e   # Run Playwright E2E tests
npm run test:e2e:ui # Run E2E with interactive UI
```

### CI/CD
- GitHub Actions runs tests and type-check on push/PR to `main`
- Workflow: [.github/workflows/ci.yml](workflows/ci.yml)
- **Hosting**: Netlify (auto-deploys from `main` branch)
- **Pre-commit hook**: Runs `npm test` before each commit (husky)

## File Organization
- `pages/` - Full-page views (Dashboard, Planner, WorkoutLibrary, SessionTracker, Progress)
- `components/` - Reusable components and layout
- `context/` - Global state (single store pattern)
- Root `types.ts` and `utils.ts` for shared code

## Feature Roadmap

### Planner / Calendar
- Weekly view primary (monthly optional later)
- Multiple workouts per day ✅
- Template weekly program with daily tweaks
- Periodized training structure: Macrocycles → Mesocycles → Microcycles

### Workout Library (Exercises)
- Exercise fields: name, description, steps, target duration, difficulty (not all required)
- Examples: yoga, max hang, no hang, limit boulder, footwork
- Progressive overload: track weight/volume increases over time
- **Categories** (show grouped, expandable):
  - Antagonist & Stabilizer Training
  - Core Training
  - Limit-Strength Exercises
  - Power Training
  - Strength/Power-Endurance Training
  - Local/Generalized Aerobic Training

### Timers
- Rest timers + Interval timers (hangboard) ✅
- Audio cues (not just vibration)
- Customizable timer presets per workout

### Progress Dashboard
- Key metrics: grades sent, training consistency
- Monthly view default with toggleable time ranges
- Goal tracking (e.g., "send V6 by March")

### Multi-Device Sync ✅
- **Firebase** (Firestore + Auth) - free tier sufficient for <5 users
- Config in [firebase.ts](../firebase.ts), Auth context in [context/AuthContext.tsx](../context/AuthContext.tsx)
- Email/Google authentication implemented
- Real-time sync across devices via Firestore onSnapshot listeners
- Data stored per-user under `users/{userId}/` collections
