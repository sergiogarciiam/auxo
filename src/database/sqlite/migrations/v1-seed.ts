export const v1Seed = `
  INSERT INTO workouts (name, position) VALUES
    ('Full Body Beginner', 0),
    ('Circuit Blast', 1),
    ('Full Body Superset', 2),
    ('HIIT Cardio Mix', 3),
    ('Strength Plus', 4),
    ('Upper Body Complex', 5),
    ('Quick Warm-up', 6),
    ('Gym Free Pick', 7);

  INSERT INTO blocks (workout_id, name, type, prepare_time, rest_group, position) VALUES
    (1, 'Warm up', 'warmup', 10, 0, 0),
    (1, 'Main Strength', 'traditional', 10, 90, 1),
    (1, 'Cooldown', 'cooldown', 10, 0, 2),
    (2, 'Circuit', 'circuit', 10, 60, 0),
    (2, 'Cooldown', 'cooldown', 10, 0, 1),
    (3, 'Superset Strength', 'superset', 10, 45, 0),
    (3, 'Cooldown', 'cooldown', 10, 0, 1),
    (4, 'Warm-up Cardio', 'warmup', 5, 0, 0),
    (4, 'HIIT Block 1', 'circuit', 5, 20, 40),
    (4, 'HIIT Block 2', 'circuit', 5, 40, 2),
    (4, 'Cool Down', 'cooldown', 5, 0, 3),
    (5, 'Dynamic Warm-up', 'warmup', 15, 0, 0),
    (5, 'Upper Body', 'superset', 10, 70, 1),
    (5, 'Lower Body', 'superset', 10, 65, 2),
    (5, 'Cool Down & Stretch', 'cooldown', 10, 0, 3),
    (6, 'Mobility Work', 'warmup', 10, 0, 0),
    (6, 'Complex Push', 'traditional', 10, 60, 1),
    (6, 'Complex Pull', 'traditional', 10, 60, 2),
    (6, 'Circuit Finisher', 'circuit', 5, 45, 3),
    (6, 'Stretching', 'cooldown', 10, 0, 4),
    (7, 'Quick Warm', 'warmup', 5, 0, 0),
    (8, 'Pick Your Exercises', 'flexible', 10, 0, 0),
    (8, 'Cool Down', 'cooldown', 5, 0, 1);

  INSERT INTO exercises (
    block_id,
    name,
    last_reps,
    min_reps,
    max_reps,
    time_seconds,
    weight,
    sets,
    rest_time,
    exercise_type,
    config_type,
    sets_data,
    position
  ) VALUES

    (1, 'Jumping Jacks', NULL, NULL, NULL, 30, NULL, 1, 0, 'time', 'simple', NULL, 0),
    (1, 'Arm Circles', NULL, NULL, NULL, 30, NULL, 1, 0, 'time', 'simple', NULL, 1),

    (2, 'Squats', 12, 10, 12, NULL, NULL, 3, 45, 'reps', 'simple', NULL, 0),
    (2, 'Push Ups', 10, 8, 12, NULL, NULL, 3, 45, 'reps', 'simple', NULL, 1),
    (2, 'Bent Over Row', 12, 10, 12, NULL, 8, 3, 50, 'reps', 'simple', NULL, 2),

    (3, 'Stretch Hamstrings', NULL, NULL, NULL, 60, NULL, 1, 0, 'time', 'simple', NULL, 0),
    (3, 'Child Pose', NULL, NULL, NULL, 60, NULL, 1, 0, 'time', 'simple', NULL, 1),

    (4, 'Burpees', NULL, NULL, NULL, 45, NULL, 3, 25, 'time', 'simple', NULL, 0),
    (4, 'Mountain Climbers', NULL, NULL, NULL, 30, NULL, 3, 20, 'time', 'simple', NULL, 1),
    (4, 'Jump Lunges', NULL, NULL, NULL, 30, NULL, 3, 25, 'time', 'simple', NULL, 2),
    (4, 'Push-up to T', NULL, NULL, NULL, 40, NULL, 3, 30, 'time', 'simple', NULL, 3),

    (5, 'Forward Fold', NULL, NULL, NULL, 60, NULL, 1, 0, 'time', 'simple', NULL, 0),
    (5, 'Cat-Cow Stretch', NULL, NULL, NULL, 60, NULL, 1, 0, 'time', 'simple', NULL, 1),

    (6, 'Dumbbell Squats', 12, 10, 12, NULL, 10, 3, 40, 'reps', 'simple', NULL, 0),
    (6, 'Push Ups', 10, 8, 12, NULL, NULL, 3, 35, 'reps', 'simple', NULL, 1),
    (6, 'Lunges', 12, 10, 12, NULL, 8, 3, 40, 'reps', 'simple', NULL, 2),
    (6, 'Plank Row', 10, 8, 12, NULL, 10, 3, 35, 'reps', 'simple', NULL, 3),

    (7, 'Quad Stretch', NULL, NULL, NULL, 45, NULL, 1, 0, 'time', 'simple', NULL, 0),
    (7, 'Hip Circles', NULL, NULL, NULL, 45, NULL, 1, 0, 'time', 'simple', NULL, 1),

    (8, 'Dynamic Stretch', NULL, NULL, NULL, 30, NULL, 1, 0, 'time', 'simple', NULL, 0),
    (8, 'Jumping Jacks', NULL, NULL, NULL, 30, NULL, 1, 0, 'time', 'simple', NULL, 1),

    (9, 'High Knees', NULL, NULL, NULL, 30, NULL, 3, 15, 'time', 'complex',
      '[{"last_reps":null,"min_reps":null,"max_reps":null,"time_seconds":30,"weight":null,"rest_time":15},{"last_reps":null,"min_reps":null,"max_reps":null,"time_seconds":30,"weight":null,"rest_time":15},{"last_reps":null,"min_reps":null,"max_reps":null,"time_seconds":30,"weight":null,"rest_time":15}]', 0),

    (9, 'Jump Rope', NULL, NULL, NULL, 40, NULL, 3, 20, 'time', 'complex',
      '[{"last_reps":null,"min_reps":null,"max_reps":null,"time_seconds":40,"weight":null,"rest_time":20},{"last_reps":null,"min_reps":null,"max_reps":null,"time_seconds":40,"weight":null,"rest_time":20},{"last_reps":null,"min_reps":null,"max_reps":null,"time_seconds":40,"weight":null,"rest_time":20}]', 1),

    (10, 'Battle Ropes', NULL, NULL, NULL, 30, NULL, 3, 15, 'time', 'complex',
      '[{"last_reps":null,"min_reps":null,"max_reps":null,"time_seconds":30,"weight":null,"rest_time":15},{"last_reps":null,"min_reps":null,"max_reps":null,"time_seconds":30,"weight":null,"rest_time":15},{"last_reps":null,"min_reps":null,"max_reps":null,"time_seconds":30,"weight":null,"rest_time":15}]', 0),

    (10, 'Box Jumps', 5, 5, 8, NULL, NULL, 3, 25, 'reps', 'complex',
      '[{"last_reps":5,"min_reps":5,"max_reps":8,"time_seconds":null,"weight":null,"rest_time":25},{"last_reps":5,"min_reps":5,"max_reps":8,"time_seconds":null,"weight":null,"rest_time":25},{"last_reps":5,"min_reps":5,"max_reps":8,"time_seconds":null,"weight":null,"rest_time":25}]', 1),

    (11, 'Deep Breathing', NULL, NULL, NULL, 60, NULL, 1, 0, 'time', 'simple', NULL, 0),
    (11, 'Lying Stretch', NULL, NULL, NULL, 60, NULL, 1, 0, 'time', 'simple', NULL, 1),

    (12, 'Arm Stretches', NULL, NULL, NULL, 30, NULL, 1, 0, 'time', 'simple', NULL, 0),
    (12, 'Leg Swings', NULL, NULL, NULL, 30, NULL, 1, 0, 'time', 'simple', NULL, 1),

    (13, 'Barbell Bench', 8, 6, 8, NULL, 20, 4, 60, 'reps', 'complex',
      '[{"last_reps":8,"min_reps":6,"max_reps":8,"time_seconds":null,"weight":20,"rest_time":60},{"last_reps":6,"min_reps":6,"max_reps":8,"time_seconds":null,"weight":22,"rest_time":60},{"last_reps":6,"min_reps":6,"max_reps":8,"time_seconds":null,"weight":22.5,"rest_time":60},{"last_reps":5,"min_reps":6,"max_reps":8,"time_seconds":null,"weight":25,"rest_time":60}]', 0),

    (13, 'Lat Pulldown', 10, 8, 10, NULL, 15, 4, 50, 'reps', 'complex',
      '[{"last_reps":10,"min_reps":8,"max_reps":10,"time_seconds":null,"weight":15,"rest_time":50},{"last_reps":10,"min_reps":8,"max_reps":10,"time_seconds":null,"weight":15,"rest_time":50},{"last_reps":8,"min_reps":8,"max_reps":10,"time_seconds":null,"weight":17.5,"rest_time":50},{"last_reps":8,"min_reps":8,"max_reps":10,"time_seconds":null,"weight":17.5,"rest_time":50}]', 1),

    (14, 'Goblet Squats', 12, 10, 12, NULL, 12, 3, 45, 'reps', 'simple', NULL, 0),
    (14, 'Deadlift', 6, 4, 6, NULL, 30, 3, 90, 'reps', 'simple', NULL, 1),

    (15, 'Full Body Stretch', NULL, NULL, NULL, 120, NULL, 1, 0, 'time', 'simple', NULL, 0),
    (16, 'Shoulder Rolls', NULL, NULL, NULL, 30, NULL, 1, 0, 'time', 'simple', NULL, 0),
    (16, 'Band Pull Aparts', NULL, NULL, NULL, 30, NULL, 1, 0, 'time', 'simple', NULL, 1),

    (17, 'Push-up Variation', 8, 6, 8, NULL, NULL, 4, 40, 'reps', 'complex',
      '[{"last_reps":8,"min_reps":6,"max_reps":8,"time_seconds":null,"weight":null,"rest_time":40},{"last_reps":8,"min_reps":6,"max_reps":8,"time_seconds":null,"weight":null,"rest_time":40},{"last_reps":6,"min_reps":6,"max_reps":8,"time_seconds":null,"weight":null,"rest_time":40},{"last_reps":6,"min_reps":6,"max_reps":8,"time_seconds":null,"weight":null,"rest_time":40}]', 0),

    (17, 'Dumbbell Overhead Press', 10, 8, 12, NULL, 8, 3, 45, 'reps', 'simple', NULL, 1),

    (17, 'Face Pulls', 15, 12, 15, NULL, 5, 3, 35, 'reps', 'simple', NULL, 2),

    (18, 'Pull-up', 6, 4, 6, NULL, NULL, 3, 60, 'reps', 'complex',
      '[{"last_reps":6,"min_reps":4,"max_reps":6,"time_seconds":null,"weight":null,"rest_time":60},{"last_reps":5,"min_reps":4,"max_reps":6,"time_seconds":null,"weight":null,"rest_time":60},{"last_reps":4,"min_reps":4,"max_reps":6,"time_seconds":null,"weight":null,"rest_time":60}]', 0),

    (18, 'Barbell Curl', 10, 8, 12, NULL, 10, 3, 40, 'reps', 'simple', NULL, 1),

    (19, 'Plank Hold', NULL, NULL, NULL, 60, NULL, 3, 30, 'time', 'simple', NULL, 0),
    (19, 'Arm Wrestling', NULL, NULL, NULL, 45, NULL, 1, 0, 'time', 'simple', NULL, 1),

    (20, 'Upper Body Stretch', NULL, NULL, NULL, 120, NULL, 1, 0, 'time', 'simple', NULL, 0),

    (21, 'Jumping Jacks', NULL, NULL, NULL, 20, NULL, 1, 0, 'time', 'simple', NULL, 0),
    (21, 'Arm Circles', NULL, NULL, NULL, 20, NULL, 1, 0, 'time', 'simple', NULL, 1),
    (21, 'Leg Swings', NULL, NULL, NULL, 20, NULL, 1, 0, 'time', 'simple', NULL, 2),
    (21, 'Jogging in Place', NULL, NULL, NULL, 30, NULL, 1, 0, 'time', 'simple', NULL, 3),

    (22, 'Dumbbell Bench Press', 8, 6, 10, NULL, 15, 3, 45, 'reps', 'simple', NULL, 0),
    (22, 'Lat Pulldown Machine', 10, 8, 12, NULL, 20, 3, 50, 'reps', 'simple', NULL, 1),

    (22, 'Cable Chest Fly', 12, 10, 15, NULL, 12, 3, 40, 'reps', 'simple', NULL, 2),

    (22, 'Seated Row', 10, 8, 12, NULL, 18, 3, 45, 'reps', 'simple', NULL, 3),

    (22, 'Incline Dumbbell Press', 10, 8, 12, NULL, 12, 3, 40, 'reps', 'complex',
      '[{"last_reps":10,"min_reps":8,"max_reps":12,"time_seconds":null,"weight":12,"rest_time":40},{"last_reps":8,"min_reps":8,"max_reps":12,"time_seconds":null,"weight":14,"rest_time":40},{"last_reps":8,"min_reps":8,"max_reps":12,"time_seconds":null,"weight":16,"rest_time":40}]', 4),

    (22, 'Face Pulls Machine', 15, 12, 15, NULL, 10, 3, 35, 'reps', 'simple', NULL, 5),

    (22, 'Bicep Curls', 12, 10, 12, NULL, 8, 3, 35, 'reps', 'simple', NULL, 6),

    (22, 'Tricep Dips', 8, 6, 10, NULL, NULL, 3, 50, 'reps', 'simple', NULL, 7),

    (23, 'Cool Down Stretch', NULL, NULL, NULL, 120, NULL, 1, 0, 'time', 'simple', NULL, 0);
`;
