/**
 * Validation utilities for common checks
 */

export const ValidationErrors = {
  EMPTY_STRING: "This field is required",
  INVALID_NUMBER: "Must be a valid number",
  INVALID_EMAIL: "Invalid email format",
} as const;

/**
 * Validates that a string is not empty or whitespace
 */
export function isNonEmptyString(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Validates that a value is a valid positive number
 */
export function isPositiveNumber(value: unknown): boolean {
  const num = Number(value);
  return Number.isFinite(num) && num >= 0;
}

/**
 * Validates a complete workout before saving
 */
export function validateWorkout(workout: {
  name: string;
  sections: {
    name: string;
    type: string;
    localStatus: string;
    exercises: { name: string; localStatus: string }[];
  }[];
}): string | null {
  if (!isNonEmptyString(workout.name)) {
    return "Workout name is required";
  }

  for (const section of workout.sections) {
    if (section.localStatus === "deleted") continue;

    if (!isNonEmptyString(section.name)) {
      return "Section name is required";
    }

    if (!isNonEmptyString(section.type)) {
      return "Section type is required";
    }

    for (const exercise of section.exercises) {
      if (exercise.localStatus === "deleted") continue;

      if (!isNonEmptyString(exercise.name)) {
        return "Exercise name is required";
      }
    }
  }

  return null;
}
