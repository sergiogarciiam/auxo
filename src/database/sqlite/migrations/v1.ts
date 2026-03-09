// Migration v1: Initial database schema
// Creates workouts, sections, and exercises tables with indexes and timestamps

export const v1Migration = `
  PRAGMA foreign_keys = ON;

  -- Independent Workouts table
  CREATE TABLE IF NOT EXISTS workouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    position INTEGER NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
  );

  -- Independent Sections table (not linked to workouts)
  CREATE TABLE IF NOT EXISTS sections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('warmup','cooldown','traditional','superset','circuit')),
    prepare_time INTEGER DEFAULT 0,
    rest_exercise INTEGER DEFAULT 0,
    rest_group INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
  );

  -- Independent Exercises table (not linked to sections)
  CREATE TABLE IF NOT EXISTS exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    reps INTEGER,
    time_seconds INTEGER,
    weight REAL,
    sets INTEGER,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
  );

  -- Junction table: Workouts to Sections (many-to-many)
  CREATE TABLE IF NOT EXISTS workout_sections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workout_id INTEGER NOT NULL,
    section_id INTEGER NOT NULL,
    position INTEGER NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
    FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
    FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE,
    UNIQUE(workout_id, section_id)
  );

  -- Junction table: Sections to Exercises (many-to-many)
  CREATE TABLE IF NOT EXISTS section_exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    section_id INTEGER NOT NULL,
    exercise_id INTEGER NOT NULL,
    position INTEGER NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
    FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
    UNIQUE(section_id, exercise_id)
  );

  -- Indexes for performance
  CREATE INDEX IF NOT EXISTS idx_workout_sections_workout_id ON workout_sections(workout_id);
  CREATE INDEX IF NOT EXISTS idx_workout_sections_section_id ON workout_sections(section_id);
  CREATE INDEX IF NOT EXISTS idx_workout_sections_position ON workout_sections(position);
  CREATE INDEX IF NOT EXISTS idx_section_exercises_section_id ON section_exercises(section_id);
  CREATE INDEX IF NOT EXISTS idx_section_exercises_exercise_id ON section_exercises(exercise_id);
  CREATE INDEX IF NOT EXISTS idx_section_exercises_position ON section_exercises(position);
  CREATE INDEX IF NOT EXISTS idx_workouts_position ON workouts(position);
`;
