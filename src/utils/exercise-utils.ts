/**
 * Utilities for exercise data manipulation
 */

export interface ExerciseSetData {
  last_reps: number;
  min_reps: number;
  max_reps: number;
  time_seconds: number;
  weight: number;
  rest_time: number;
}

/**
 * Initialize sets_data array for complex exercises
 * Each set gets default values from the base exercise fields
 */
export const initializeSetsData = (
  numSets: number,
  last_reps: number,
  min_reps: number,
  max_reps: number,
  exerciseTime: number,
  weight: number,
  restTime: number,
): ExerciseSetData[] => {
  return Array.from({ length: numSets }, () => ({
    last_reps: last_reps,
    min_reps: min_reps,
    max_reps: max_reps,
    time_seconds: exerciseTime,
    weight,
    rest_time: restTime,
  }));
};

/**
 * Serialize sets_data to JSON string for database storage
 */
export const serializeSetsData = (
  setsData: ExerciseSetData[] | undefined,
): string | undefined => {
  if (!setsData || setsData.length === 0) {
    return undefined;
  }
  return JSON.stringify(setsData);
};

/**
 * Deserialize JSON string to sets_data array
 */
export const deserializeSetsData = (jsonString: string): ExerciseSetData[] => {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.warn("Failed to parse sets_data JSON:", e);
    return [];
  }
};
