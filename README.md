# Auxo: Strength Training

Create structured workouts with blocks, exercises, sets, reps, and rest intervals, then run them seamlessly during your training sessions.

Built with **Expo SDK 54**, **React Native 0.81**, **TypeScript**, **NativeWind/Tailwind**, **Zustand**, and **expo-sqlite**.

![Feature Graphic](/assets/images/feature-graphic.jpg)

## Table of Contents

- [Why Auxo?](#why-auxo)
- [Features](#features)
  - [Workout Management](#workout-management)
  - [Flexible Workout Structure](#flexible-workout-structure)
  - [Exercise Configuration](#exercise-configuration)
  - [Live Workout Execution](#live-workout-execution)
  - [Offline-First Database](#offline-first-database)
  - [UI & Personalization](#ui--personalization)
  - [Settings](#settings)
- [Screenshots](#screenshots)
- [Demo](#demo)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Development](#development)
- [Build with EAS](#build-with-eas)
- [Project Structure](#project-structure)
- [Database](#database)
- [Status](#status)
- [Contributing](#contributing)
- [Changelog](#changelog)
- [Acknowledgements](#acknowledgements)
- [License](#license)

## Why Auxo?

Most workout trackers focus on logging sets and reps. Auxo focuses on **structured training sessions**.

Workouts are built from **blocks** that represent different training methods such as warmups, traditional strength work, supersets, circuits, and cooldowns. Once a workout is created, Auxo automatically generates an execution plan and guides you through the session with timers, rest periods, notifications, sounds, and progress tracking.

The goal is to reduce friction during training so you can spend less time managing your workout and more time exercising.

## Features

### Workout Management

- Create, edit, delete, and reorder workouts via drag-and-drop.
- Organize workouts into structured blocks.

### Flexible Workout Structure

A **block** is a group of exercises executed using a specific training methodology.

Auxo supports six block types:

- **Warmup** – prepare for training.
- **Cooldown** – recovery and mobility work.
- **Traditional** – standard straight sets.
- **Superset** – two exercises performed back-to-back.
- **Circuit** – multiple exercises repeated for rounds.
- **Flexible** – choose exercises dynamically during the workout.

### Exercise Configuration

- **Simple mode** – one configuration applied to every set.
- **Complex mode** – customize each set individually.
- Repetition-based exercises.
- Time-based exercises.

### Live Workout Execution

- Automatically generated workout execution plan.
- Exercise and rest intervals combined into a guided flow.
- Timer, haptics, and beep sounds.
- Progress tracking throughout the workout.
- Flexible exercise selection during active sessions.
- Modify weight and reps while training.
- Changes are persisted immediately.
- Confetti celebration on completion.
- Background timer support.
- Local notifications to stay on track.

### Offline-First Database

- All data stored locally using SQLite.
- No account required.
- Full offline support.
- Schema migrations with version tracking.
- Development database seeding with example workouts.

### UI & Personalization

- Light and dark themes.
- System theme support.
- NativeWind styling with CSS variables.
- Lucide and Ionicons icon sets.
- Snackbar/toast feedback messages.

### Settings

- Theme selection (system, light, dark).
- Weight unit selection (kg/lb).
- Notification preferences.
- Report an issue shortcut.

## Screenshots

| Workouts list                               | Workout form                               | Block form                                     |
| ------------------------------------------- | ------------------------------------------ | ---------------------------------------------- |
| ![](/assets/images/phone/workouts-list.png) | ![](/assets/images/phone/workout-form.png) | ![](/assets/images/phone/block-form.png) |

| Workout progress                           | Flexible workout                               |
| ------------------------------------------ | ---------------------------------------------- |
| ![](/assets/images/phone/main-workout.png) | ![](/assets/images/phone/flexible-workout.png) |

## Demo

![Workout Demo](/assets/demo.gif)

## Tech Stack

| Layer              | Technology                                  |
| ------------------ | ------------------------------------------- |
| Framework          | Expo SDK 54                                 |
| UI                 | React Native 0.81, NativeWind, Tailwind CSS |
| Navigation         | Expo Router                                 |
| State Management   | Zustand + React Context                     |
| Database           | expo-sqlite (SQLite)                        |
| Icons              | lucide-react-native, @expo/vector-icons     |
| Drag & Drop        | react-native-draggable-flatlist             |
| Testing            | Vitest + jsdom                              |
| Linting            | ESLint + Prettier                           |
| Build & Deployment | EAS Build                                   |

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI

### Installation

```bash
git clone https://github.com/sergiogarciiam/auxo.git
cd auxo
npm install
```

### Run the App

```bash
npm start
```

Then press:

```text
a → Android
i → iOS
w → Web
```

## Development

### Run Tests

```bash
npm test
```

### Run Tests with UI Dashboard

```bash
npm run test:ui
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Format Code

```bash
npm run format
```

### Run Linter

```bash
npm run lint
```

## Build with EAS

### Development Build

```bash
npm run build:development
```

### Internal Preview Build

```bash
npm run build:preview
```

### Production Build

```bash
npm run build:production
```

### Submit to Store

```bash
npm run submit:production
```

### Submit to Store

```bash
npm run submit:production
```

## Project Structure

```text
src/
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── workout-form.tsx
│   ├── block-form.tsx
│   ├── main-workout.tsx
│   └── settings.tsx
│
├── components/
│   ├── exercise-card/
│   ├── main-workout/
│   └── ui/
│
├── database/sqlite/
│   ├── migrations/
│   ├── workout.ts
│   ├── block.ts
│   └── exercise.ts
│
├── hooks/
│   ├── base/
│   ├── main-workout/
│   └── other/
│
├── stores/
│   ├── useWorkoutStore.ts
│   ├── useStartWorkoutStore.ts
│   └── useSnackbarStore.ts
│
├── types/
├── utils/
└── global.css
```

### Key Directories

| Directory         | Purpose                             |
| ----------------- | ----------------------------------- |
| `app`             | Expo Router screens and navigation  |
| `components`      | Reusable UI components              |
| `database/sqlite` | SQLite access layer and migrations  |
| `hooks`           | Custom React hooks                  |
| `stores`          | Zustand state management            |
| `utils`           | Business logic and helper functions |
| `types`           | TypeScript definitions              |

## Database

Auxo uses SQLite through `expo-sqlite`.

### Features

- Local-first storage.
- Foreign key constraints.
- Cascade deletes.
- Versioned schema migrations.
- Automatic migration execution on startup.

### Migration Strategy

Database versions are tracked using:

```sql
PRAGMA user_version;
```

During development (`__DEV__`):

- Database is reset automatically.
- Seed data is reloaded.
- Four sample workouts are inserted.

### Main Tables

| Table     | Purpose                 |
| --------- | ----------------------- |
| workouts  | Workout definitions     |
| blocks    | Workout sections        |
| exercises | Exercise configurations |
| settings  | User preferences        |

## Status

🚧 Active development

Planned features:

- Workout history.
- Personal records tracking.
- Exercise library.
- Workout duplication improvements.
- Export and backup options.

## Contributing

Contributions, bug reports, and feature requests are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Open a pull request.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for release history.

## Acknowledgements

- `assets/beep.wav` from https://freesound.org/s/124904/ (Attribution 3.0)
- `assets/double-beep.wav` from https://freesound.org/s/124907/ (Attribution 3.0)

## License

This project is licensed under the [MIT License](./LICENSE.md).
