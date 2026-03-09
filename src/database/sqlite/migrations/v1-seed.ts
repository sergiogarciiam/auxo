// Seed data for development (v1)
// Sample workouts with exercises for testing

export const v1Seed = `
  -- Create independent sections
  INSERT INTO sections (name, type, prepare_time, rest_exercise, rest_group) VALUES
    ('Warm up', 'warmup', 10, 0, 0),
    ('Strength', 'traditional', 10, 60, 90),
    ('Circuit', 'circuit', 10, 15, 60),
    ('Cooldown', 'cooldown', 10, 0, 0),
    ('Superset Strength', 'superset', 10, 45, 60);

  -- Create independent exercises
  INSERT INTO exercises (name, reps, time_seconds, weight, sets) VALUES
    ('Jumping Jacks', NULL, 30, NULL, 1),
    ('Arm Circles', NULL, 30, NULL, 1),
    ('Squats', 12, NULL, NULL, 3),
    ('Push Ups', 10, NULL, NULL, 3),
    ('Bent Over Row', 12, NULL, NULL, 3),
    ('Burpees', NULL, 45, NULL, 3),
    ('Mountain Climbers', NULL, 30, NULL, 3),
    ('Jump Lunges', NULL, 30, NULL, 3),
    ('Stretch Hamstrings', NULL, 60, NULL, 1),
    ('Child Pose', NULL, 60, NULL, 1),
    ('Dumbbell Squats', 12, NULL, 10, 3),
    ('Lunges', 12, NULL, NULL, 3),
    ('Plank Row', 10, NULL, 10, 3),
    ('Forward Fold', NULL, 60, NULL, 1),
    ('Cat-Cow Stretch', NULL, 60, NULL, 1);

  -- Create workouts
  INSERT INTO workouts (name, position) VALUES
    ('Full Body Beginner', 0),
    ('Circuit Blast', 1),
    ('Full Body Superset', 2);

  -- Link sections to workouts
  INSERT INTO workout_sections (workout_id, section_id, position) VALUES
    (1, 1, 0),  -- Full Body Beginner -> Warm up
    (1, 2, 1),  -- Full Body Beginner -> Strength
    (2, 3, 0),  -- Circuit Blast -> Circuit
    (2, 4, 1),  -- Circuit Blast -> Cooldown
    (3, 5, 0),  -- Full Body Superset -> Superset Strength
    (3, 4, 1);  -- Full Body Superset -> Cooldown

  -- Link exercises to sections
  INSERT INTO section_exercises (section_id, exercise_id, position) VALUES
    (1, 1, 0),   -- Warm up -> Jumping Jacks
    (1, 2, 1),   -- Warm up -> Arm Circles
    (2, 3, 0),   -- Strength -> Squats
    (2, 4, 1),   -- Strength -> Push Ups
    (2, 5, 2),   -- Strength -> Bent Over Row
    (3, 6, 0),   -- Circuit -> Burpees
    (3, 7, 1),   -- Circuit -> Mountain Climbers
    (3, 8, 2),   -- Circuit -> Jump Lunges
    (4, 9, 0),   -- Cooldown -> Stretch Hamstrings
    (4, 10, 1),  -- Cooldown -> Child Pose
    (5, 11, 0),  -- Superset -> Dumbbell Squats
    (5, 4, 1),   -- Superset -> Push Ups
    (5, 12, 2),  -- Superset -> Lunges
    (5, 13, 3),  -- Superset -> Plank Row
    (4, 14, 2),  -- Cooldown -> Forward Fold (added to Cooldown reuse)
    (4, 15, 3);  -- Cooldown -> Cat-Cow Stretch
`;
