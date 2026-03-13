// Migration v1: Initial database schema
// Creates workouts, blocks, and exercises tables with indexes and timestamps

export const v1Migration = `
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS workouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    position INTEGER NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
  );

  CREATE TABLE IF NOT EXISTS blocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workout_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('warmup','cooldown','traditional','superset','circuit')),
    prepare_time INTEGER DEFAULT 0,
    rest_exercise INTEGER DEFAULT 0,
    rest_group INTEGER DEFAULT 0,
    position INTEGER NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
    FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    block_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    reps INTEGER,
    time_seconds INTEGER,
    weight REAL,
    sets INTEGER,
    position INTEGER NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
    FOREIGN KEY (block_id) REFERENCES blocks(id) ON DELETE CASCADE
  );

  CREATE TABLE user_settings (
    theme VARCHAR(10) DEFAULT 'system',
    weight_unit VARCHAR(2) DEFAULT 'kg',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Indexes for performance
  CREATE INDEX IF NOT EXISTS idx_blocks_workout_id ON blocks(workout_id);
  CREATE INDEX IF NOT EXISTS idx_exercises_block_id ON exercises(block_id);
  CREATE INDEX IF NOT EXISTS idx_workouts_position ON workouts(position);
  CREATE INDEX IF NOT EXISTS idx_blocks_position ON blocks(position);
  CREATE INDEX IF NOT EXISTS idx_exercises_position ON exercises(position);
`;
