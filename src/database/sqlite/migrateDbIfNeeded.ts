import { SQLiteDatabase } from "expo-sqlite";
import { v1Migration } from "./migrations/v1";
import { v1Seed } from "./migrations/v1-seed";

const DATABASE_VERSION = 1;

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  // Get current database version
  const result = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );
  let currentDbVersion = result?.user_version ?? 0;

  // In dev mode, reset the database on each launch
  if (__DEV__) {
    await db.execAsync(`
      PRAGMA foreign_keys = OFF;
      DROP TABLE IF EXISTS exercises;
      DROP TABLE IF EXISTS blocks;
      DROP TABLE IF EXISTS workouts;
      DROP TABLE IF EXISTS user_settings;
      PRAGMA foreign_keys = ON;
      PRAGMA user_version = 0;
    `);

    currentDbVersion = 0;
  }

  // If the database is up to date, no need to migrate
  if (currentDbVersion >= DATABASE_VERSION) return;

  // v0 → v1
  if (currentDbVersion === 0) {
    try {
      await db.execAsync(v1Migration);

      // Load seed data in dev mode
      if (__DEV__) {
        await db.execAsync(v1Seed);
      }

      currentDbVersion = 1;
    } catch (error) {
      console.error("Migration v1 failed:", error);
      throw new Error("Failed to migrate database to v1");
    }
  }

  // If the database is up to date, no need to continue
  if (currentDbVersion >= DATABASE_VERSION) {
    await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
    return;
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
