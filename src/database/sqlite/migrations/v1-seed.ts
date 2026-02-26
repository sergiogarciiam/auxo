// Seed data for development (v1)
// Sample workouts with exercises for testing

export const v1Seed = `
  INSERT INTO workouts (name, position) VALUES
    ('Full Body Beginner', 0),
    ('Circuit Blast', 1),
    ('Full Body Superset', 2);

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
`;
