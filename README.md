# Auxo: Strength Training

Create structured workouts with blocks, exercises, sets, reps, and rest intervals, then run them seamlessly during your training sessions.

Built with **Expo SDK 54**, **React Native 0.81**, **TypeScript**, **NativeWind/Tailwind**, **Zustand**, and **expo-sqlite**.

![Feature Graphic](/assets/images/feature-graphic.jpg)

## Features

### Workout Management
- Create, edit, delete and reorder workouts via drag-and-drop.
- Each workout contains **blocks** (groups of exercises).

### Block Types
Six block types to structure your training:
- **Warmup** / **Cooldown** – prepare and recover.
- **Traditional** – standard straight-set format.
- **Superset** – two exercises performed back-to-back.
- **Circuit** – all exercises in sequence, repeated for rounds.
- **Flexible** – pick which exercises to do on the fly during the workout (e.g. "Gym Free Pick").

### Exercise Configuration
- **Simple mode** – single rep/weight/time values applied to all sets.
- **Complex mode** – individual values per set.
- Supports reps-based and time-based exercises.
- Drag-and-drop reordering within blocks.

### Live Workout Execution
- Start a workout and follow the auto-generated **execution plan** (exercise steps + rest intervals).
- **Timer, haptics, and beep sounds** guide you through each step.
- **Progress bar** shows advancement through the workout.
- **Flexible blocks** let you select exercises during the session.
- **Adjust reps and weight live** – changes persist to the database.
- **Confetti celebration** when you finish.
- **Background timer + notifications** keep you on track even when the app is in the background.

### Database & Offline
- **Offline-first** – all data stored locally in SQLite via `expo-sqlite`.
- Schema **migrations** with version tracking (`PRAGMA user_version`).
- Development mode resets and re-seeds the database on each launch with 4 example workouts.

### UI & Theming
- **Light and dark themes** (system-aware by default, switch in settings).
- Built with **NativeWind** (Tailwind CSS for React Native) and CSS variables.
- Ionicons and Lucide icons.
- Snackbar/toast notifications for feedback.

### Settings
- Theme toggle (system / light / dark).
- Weight unit (kg / lb).
- Notification preferences.
- Report an issue (opens GitHub).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Expo SDK 54 |
| UI | React Native 0.81, NativeWind, Tailwind |
| Navigation | Expo Router (file-based) |
| State | Zustand + React Context |
| Database | expo-sqlite (SQLite) |
| Icons | lucide-react-native, @expo/vector-icons |
| Drag & Drop | react-native-draggable-flatlist |
| Testing | Vitest + jsdom |
| Linting | ESLint + Prettier |
| Build | EAS Build (dev / preview / production) |

## Getting Started

### Prerequisites
- Node.js
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

### Run the app

```bash
git clone <repo-url>
cd auxo
npm install
npm start
```

Press `a` for Android, `i` for iOS, or `w` for web.

### Run tests and linter

```bash
npm test          # Vitest unit tests
npm run test:ui   # Vitest with UI dashboard
npm run lint      # ESLint
```

### Build with EAS

```bash
eas build --profile development    # Dev build with dev client
eas build --profile preview        # Internal distribution
eas build --profile production     # App store submission
```

## Project Structure

```
src/
├── app/                  # Expo Router screens (file-based routing)
│   ├── _layout.tsx       # Root layout: providers, theme, SQLite, navigation
│   ├── index.tsx         # Home – workout list with drag-and-drop
│   ├── workout-form.tsx  # Create / edit workout
│   ├── block-form.tsx    # Create / edit block
│   ├── main-workout.tsx  # Live workout execution
│   └── settings.tsx      # Theme, units, notifications
├── components/           # Reusable UI components
│   ├── exercise-card/    # Exercise editing (simple + complex config)
│   ├── main-workout/     # Workout execution components
│   └── ui/               # shadcn-style primitives
├── database/sqlite/      # SQLite setup, migrations, CRUD
│   ├── migrations/       # Schema versions + dev seed data
│   ├── workout.ts        # Workout CRUD queries
│   ├── block.ts          # Block CRUD queries
│   └── exercise.ts       # Exercise CRUD queries
├── hooks/                # Custom hooks
│   ├── base/             # CRUD hooks, settings
│   ├── main-workout/     # Timer, app state, navigation
│   └── other/            # Deletion, lifecycle, dialogs, theme
├── stores/               # Zustand stores
│   ├── useWorkoutStore.ts      # Workout editing state
│   ├── useStartWorkoutStore.ts # Active workout execution state
│   └── useSnackbarStore.ts     # Snackbar queue
├── types/                # TypeScript types
├── utils/                # Validation, planning, formatting, transformations
└── global.css            # Tailwind + CSS variables (light/dark)
```

## Database

SQLite database managed via `expo-sqlite` with schema migrations in `src/database/sqlite/migrations/`.

- Migration version tracked with `PRAGMA user_version`.
- In development (`__DEV__`), the database is reset and re-seeded on every launch with 4 sample workouts (see `v1-seed.ts`).
- Tables: `workouts`, `blocks`, `exercises`, `settings` – all with foreign keys and cascade deletes.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for release history.

## Acknowledgements

- [assets/beep.wav](assets/beep.wav) from https://freesound.org/s/124904/ – License: Attribution 3.0.
- [assets/double-beep.wav](assets/double-beep.wav) from https://freesound.org/s/124907/ – License: Attribution 3.0.
