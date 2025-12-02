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
        total_time INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS sections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workout_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('warmup','cooldown','traditional','superset','circuit')),
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

    currentDbVersion = 1;
    if (currentDbVersion >= DATABASE_VERSION) return;
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
