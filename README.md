# Auxo: Strength Training

Create structured workouts with blocks, exercises, sets, reps, and rest intervals, then run them seamlessly during your training sessions.

## Features

- Create, update and delete workouts.
- Create, update and delete blocks inside workouts.
- Create, update and delete exercises inside blocks.
- Start a workout with automatic generation of the workout, notifications and a progress bar.
- Offline-first local database (SQLite) with schema migrations and development seed data.

## Try the Code

If you’d like to run or modify the app locally:

### Run code

1. Clone this repository.
2. Install dependencies: `npm install`.
3. Start the Metro/Expo dev server: `npm run start`

### Run tests and linter

- Run unit tests (vitest): `npm test`
- Lint and format as configured in the repo (see `eslint.config.js`, `tsconfig.json`).

### Notes
- The app uses an internal SQLite database. In development the DB is reset and seeded on each launch to provide example workouts.
- Migrations are implemented in `src/database/sqlite/migrateDbIfNeeded.ts` and per-version files live under `src/database/sqlite/migrations/`.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for release history.


## Acknowledgements

- [assets/beep.wav](assets/beep.wav) from https://freesound.org/s/124904/ - License: Attribution 3.0.
- [assets/double-beep.wav](assets/double-beep.wav) from https://freesound.org/s/124907/ - License: Attribution 3.0.