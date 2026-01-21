import { SQLiteDatabase } from "expo-sqlite";

const DATABASE_VERSION = 1;
const IS_DEV = true;

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  // Get current database version
  const result = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );
  let currentDbVersion = result?.user_version ?? 0;

  // In dev mode, reset the database on each launch
  if (IS_DEV) {
    await db.execAsync(`
    PRAGMA foreign_keys = OFF;

    DROP TABLE IF EXISTS exercises;
    DROP TABLE IF EXISTS sections;
    DROP TABLE IF EXISTS workouts;

    PRAGMA foreign_keys = ON;
    PRAGMA user_version = 0;
  `);

    currentDbVersion = 0;
    if (currentDbVersion >= DATABASE_VERSION) return;
  }

  // If the database is up to date, no need to migrate
  if (currentDbVersion >= DATABASE_VERSION) return;

  // v0 → v1
  if (currentDbVersion === 0) {
    await db.execAsync(`
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS workouts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        total_time INTEGER DEFAULT 0,
        position INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS sections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workout_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('warmup','cooldown','traditional','superset','circuit')),
        prepare_time INTEGER DEFAULT 0,
        rest_exercise INTEGER DEFAULT 0,
        rest_group INTEGER DEFAULT 0,
        position INTEGER NOT NULL,
        FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        section_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        reps INTEGER,
        time_seconds INTEGER,
        weight REAL,
        sets INTEGER,
        position INTEGER NOT NULL,
        FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
      );
    `);

    // If in dev, insert sample data so the app has two example workouts
    if (IS_DEV) {
      await db.execAsync(`
        INSERT INTO workouts (name, total_time, position) VALUES
          ('Full Body Beginner', 0, 0),
          ('Circuit Blast', 0, 1),
          ('Full Body Superset', 0, 2);


        INSERT INTO sections (workout_id, name, type, prepare_time, rest_exercise, rest_group, position) VALUES
          (1, 'Warm up', 'warmup', 10, 0, 0, 0),
          (1, 'Strength', 'traditional', 10, 60, 90, 1),
          (2, 'Circuit', 'circuit', 10, 15, 60, 0),
          (2, 'Cooldown', 'cooldown', 10, 0, 0, 1),
          (3, 'Superset Strength', 'superset', 10, 45, 60, 1),
          (3, 'Cooldown', 'cooldown', 10, 0, 0, 2);

        INSERT INTO exercises (section_id, name, reps, time_seconds, weight, sets, position) VALUES
          -- Workout 1 - Warm up
          (1, 'Jumping Jacks', NULL, 30, NULL, 1, 0),
          (1, 'Arm Circles', NULL, 30, NULL, 1, 1),
          -- Workout 1 - Strength
          (2, 'Squats', 12, NULL, NULL, 3, 0),
          (2, 'Push Ups', 10, NULL, NULL, 3, 1),
          (2, 'Bent Over Row', 12, NULL, NULL, 3, 2),
          -- Workout 2 - Circuit
          (3, 'Burpees', NULL, 45, NULL, 3, 0),
          (3, 'Mountain Climbers', NULL, 30, NULL, 3, 1),
          (3, 'Jump Lunges', NULL, 30, NULL, 3, 2),
          -- Workout 2 - Cooldown
          (4, 'Stretch Hamstrings', NULL, 60, NULL, 1, 0),
          (4, 'Child Pose', NULL, 60, NULL, 1, 1),
          -- Workout 3 - Superset Strength
          (5, 'Dumbbell Squats', 12, NULL, 10, 3, 0),
          (5, 'Push Ups', 10, NULL, NULL, 3, 1),
          (5, 'Lunges', 12, NULL, NULL, 3, 2),
          (5, 'Plank Row', 10, NULL, 10, 3, 3),
          -- Workout 3 - Cooldown
          (6, 'Forward Fold', NULL, 60, NULL, 1, 0),
          (6, 'Cat-Cow Stretch', NULL, 60, NULL, 1, 1);
      `);
    }

    currentDbVersion = 1;
    if (currentDbVersion >= DATABASE_VERSION) return;
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
