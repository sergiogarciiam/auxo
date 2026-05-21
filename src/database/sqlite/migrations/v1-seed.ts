export const v1Seed = `
  INSERT INTO workouts (name, position) VALUES
    ('Full Body Beginner', 0),
    ('Circuit Blast', 1),
    ('Full Body Superset', 2),
    ('Gym Free Pick', 3);

  INSERT INTO blocks (workout_id, name, type, prepare_time, rest_group, position) VALUES
    (1, 'Warm up', 'warmup', 10, 0, 0),
    (1, 'Main Strength', 'traditional', 10, 90, 1),
    (1, 'Cooldown', 'cooldown', 10, 0, 2),
    (2, 'Circuit', 'circuit', 10, 60, 0),
    (2, 'Cooldown', 'cooldown', 10, 0, 1),
    (3, 'Superset Strength', 'superset', 10, 45, 0),
    (3, 'Cooldown', 'cooldown', 10, 0, 1),
    (4, 'Pick Your Exercises', 'flexible', 10, 0, 0),
    (4, 'Cool Down', 'cooldown', 5, 0, 1);

  INSERT INTO exercises (
    block_id, name, last_reps, min_reps, max_reps, time_seconds,
    weight, sets, rest_time, exercise_type, config_type, sets_data, position
  ) VALUES
    -- Workout 1: Full Body Beginner (Traditional)
    -- Block 1: Warm up
    (1, 'Jumping Jacks', NULL, NULL, NULL, 30, NULL, 1, 0, 'time', 'simple', NULL, 0),
    (1, 'Arm Circles', NULL, NULL, NULL, 30, NULL, 1, 0, 'time', 'simple', NULL, 1),

    -- Block 2: Main Strength
    (2, 'Squats', 12, 10, 12, NULL, NULL, 3, 45, 'reps', 'simple', NULL, 0),
    (2, 'Push Ups', 10, 8, 12, NULL, NULL, 3, 45, 'reps', 'simple', NULL, 1),
    (2, 'Bent Over Row', 12, 10, 12, NULL, 8, 3, 50, 'reps', 'complex',
      '[{"last_reps":12,"min_reps":10,"max_reps":12,"time_seconds":null,"weight":8,"rest_time":50},{"last_reps":10,"min_reps":10,"max_reps":12,"time_seconds":null,"weight":10,"rest_time":50},{"last_reps":10,"min_reps":10,"max_reps":12,"time_seconds":null,"weight":10,"rest_time":50}]', 2),

    -- Block 3: Cooldown
    (3, 'Stretch Hamstrings', NULL, NULL, NULL, 60, NULL, 1, 0, 'time', 'simple', NULL, 0),
    (3, 'Child Pose', NULL, NULL, NULL, 60, NULL, 1, 0, 'time', 'simple', NULL, 1),

    -- Workout 2: Circuit Blast
    -- Block 4: Circuit
    (4, 'Burpees', NULL, NULL, NULL, 45, NULL, 3, 25, 'time', 'complex',
      '[{"last_reps":null,"min_reps":null,"max_reps":null,"time_seconds":40,"weight":null,"rest_time":20},{"last_reps":null,"min_reps":null,"max_reps":null,"time_seconds":45,"weight":null,"rest_time":25},{"last_reps":null,"min_reps":null,"max_reps":null,"time_seconds":45,"weight":null,"rest_time":30}]', 0),
    (4, 'Mountain Climbers', NULL, NULL, NULL, 30, NULL, 3, 20, 'time', 'simple', NULL, 1),
    (4, 'Jump Lunges', NULL, NULL, NULL, 30, NULL, 3, 25, 'time', 'simple', NULL, 2),
    (4, 'Push-up to T', NULL, NULL, NULL, 40, NULL, 3, 30, 'time', 'simple', NULL, 3),

    -- Block 5: Cooldown
    (5, 'Forward Fold', NULL, NULL, NULL, 60, NULL, 1, 0, 'time', 'simple', NULL, 0),
    (5, 'Cat-Cow Stretch', NULL, NULL, NULL, 60, NULL, 1, 0, 'time', 'simple', NULL, 1),

    -- Workout 3: Full Body Superset
    -- Block 6: Superset Strength
    (6, 'Dumbbell Squats', 12, 10, 12, NULL, 10, 3, 40, 'reps', 'simple', NULL, 0),
    (6, 'Push Ups', 10, 8, 12, NULL, NULL, 3, 35, 'reps', 'simple', NULL, 1),
    (6, 'Lunges', 12, 10, 12, NULL, 8, 3, 40, 'reps', 'complex',
      '[{"last_reps":12,"min_reps":10,"max_reps":12,"time_seconds":null,"weight":8,"rest_time":40},{"last_reps":10,"min_reps":10,"max_reps":12,"time_seconds":null,"weight":10,"rest_time":40},{"last_reps":10,"min_reps":10,"max_reps":12,"time_seconds":null,"weight":10,"rest_time":40}]', 2),
    (6, 'Plank Row', 10, 8, 12, NULL, 10, 3, 35, 'reps', 'simple', NULL, 3),

    -- Block 7: Cooldown
    (7, 'Quad Stretch', NULL, NULL, NULL, 45, NULL, 1, 0, 'time', 'simple', NULL, 0),
    (7, 'Hip Circles', NULL, NULL, NULL, 45, NULL, 1, 0, 'time', 'simple', NULL, 1),

    -- Workout 4: Gym Free Pick (Flexible)
    -- Block 8: Pick Your Exercises
    (8, 'Dumbbell Bench Press', 8, 6, 10, NULL, 15, 3, 45, 'reps', 'simple', NULL, 0),
    (8, 'Lat Pulldown', 10, 8, 10, NULL, 15, 4, 50, 'reps', 'complex',
      '[{"last_reps":10,"min_reps":8,"max_reps":10,"time_seconds":null,"weight":15,"rest_time":50},{"last_reps":10,"min_reps":8,"max_reps":10,"time_seconds":null,"weight":15,"rest_time":50},{"last_reps":8,"min_reps":8,"max_reps":10,"time_seconds":null,"weight":17.5,"rest_time":50},{"last_reps":8,"min_reps":8,"max_reps":10,"time_seconds":null,"weight":17.5,"rest_time":50}]', 1),
    (8, 'Goblet Squats', 12, 10, 12, NULL, 12, 3, 45, 'reps', 'simple', NULL, 2),
    (8, 'Deadlift', 6, 4, 6, NULL, 30, 3, 90, 'reps', 'simple', NULL, 3),
    (8, 'Dumbbell Overhead Press', 10, 8, 12, NULL, 8, 3, 45, 'reps', 'simple', NULL, 4),
    (8, 'Pull-up', 6, 4, 6, NULL, NULL, 3, 60, 'reps', 'complex',
      '[{"last_reps":6,"min_reps":4,"max_reps":6,"time_seconds":null,"weight":null,"rest_time":60},{"last_reps":5,"min_reps":4,"max_reps":6,"time_seconds":null,"weight":null,"rest_time":60},{"last_reps":4,"min_reps":4,"max_reps":6,"time_seconds":null,"weight":null,"rest_time":60}]', 5),
    (8, 'Barbell Curl', 10, 8, 12, NULL, 10, 3, 40, 'reps', 'simple', NULL, 6),
    (8, 'Plank Hold', NULL, NULL, NULL, 60, NULL, 3, 30, 'time', 'simple', NULL, 7),
    (8, 'Bicep Curls', 12, 10, 12, NULL, 8, 3, 35, 'reps', 'simple', NULL, 8),
    (8, 'Tricep Dips', 8, 6, 10, NULL, NULL, 3, 50, 'reps', 'simple', NULL, 9),

    -- Block 9: Cool Down
    (9, 'Cool Down Stretch', NULL, NULL, NULL, 120, NULL, 1, 0, 'time', 'simple', NULL, 0);
`;
