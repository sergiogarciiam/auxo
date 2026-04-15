/**
 * Individual set data for complex exercises
 * Stores per-set metrics like reps/weight/rest_time
 */
export interface ExerciseSet {
  reps: number;
  time_seconds: number;
  weight: number;
  rest_time: number;
}

export interface Exercise {
  id: number;
  block_id: number;
  name: string;
  reps?: number;
  time_seconds?: number;
  rest_time?: number;
  exercise_type?: string;
  config_type?: string;
  weight?: number;
  sets?: number;
  sets_data?: string; // JSON serialized ExerciseSet[]
  position: number;
}

export interface CreateExercisePayload {
  block_id: number;
  name: string;
  reps: number;
  time_seconds: number;
  rest_time: number;
  exercise_type: string;
  config_type: string;
  weight: number;
  sets: number;
  sets_data?: string; // JSON serialized ExerciseSet[] or null
  position: number;
}

export interface UpdateExercisePayload {
  id: number;
  block_id?: number;
  name?: string;
  reps?: number;
  time_seconds?: number;
  rest_time?: number;
  exercise_type?: string;
  config_type?: string;
  weight?: number;
  sets?: number;
  sets_data?: string; // JSON serialized ExerciseSet[] or null
  position?: number;
}
