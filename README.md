<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Climbing Training Planner

Plan, log, and review climbing sessions with a focused training dashboard. The app provides structured workouts, session tracking, and progress summaries to help climbers stay consistent and measure improvements over time.

## Features

- **Structured training blocks** with suggested session types and descriptions.
- **Session tracker** for logging climbs, attempts, and sends.
- **Progress dashboard** with training volume, sends, and streak metrics.
- **Visual summaries** including calendar heatmaps and stats cards.
- **Authentication + cloud sync** via Firebase.

## Tech Stack

- React + TypeScript
- Vite
- Firebase (Auth + Firestore)
- Recharts for data visualization

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- npm

### Install

```bash
npm install
```

### Run the app

```bash
npm run dev
```

Then open the URL printed in the terminal (typically `http://localhost:5173`).

## Scripts

- `npm run dev` — start the development server
- `npm run build` — build for production
- `npm run preview` — preview the production build locally
- `npm run test` — run unit tests
- `npm run test:e2e` — run end-to-end tests with Playwright

## Project Structure

- `pages/` — top-level screens (Dashboard, Session Tracker, Progress, etc.)
- `components/` — reusable UI and data visualization components
- `context/` — app state, authentication, and data providers
- `utils.ts` — helper utilities for stats and calculations

## Notes

Firebase configuration is defined in `firebase.ts`. If you plan to point the app at your own Firebase project, update that file with your project settings.
