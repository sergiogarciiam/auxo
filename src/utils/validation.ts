/**
 * Validation utilities for common checks
 */

import { UISection, UIWorkout } from "../types/ui";

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
 * Validates that a number is defined
 */
function isNumberDefined(value: unknown): boolean {
  return typeof value === "number" && !isNaN(value);
}

/**
 * Validates that a value is a valid positive number
 */
export function isPositiveNumber(value: unknown): boolean {
  const num = Number(value);
  return Number.isFinite(num) && num >= 0;
}

/**
 * Validates a complete section before saving
 */
export function validateSection(section: UISection): string | null {
  if (!isNonEmptyString(section.name)) {
    return "Section name is required";
  }

  if (!isNonEmptyString(section.type)) {
    return "Section type is required";
  }

  if (!isNumberDefined(section.rest_exercise)) {
    return "Rest between exercises is requiered";
  }

  if (
    section.exercises.filter((exercise) => exercise.localStatus !== "deleted")
      .length === 0
  ) {
    return "Section requiere at least one exercise";
  }

  for (const exercise of section.exercises) {
    if (exercise.localStatus === "deleted") continue;

    if (!isNonEmptyString(exercise.name)) {
      return "Exercise name is required";
    }

    if (
      !isNumberDefined(exercise.reps) &&
      !isNumberDefined(exercise.time_seconds)
    ) {
      return "Exercise reps or time is required";
    }

    if (!isNumberDefined(exercise.sets)) {
      return "Exercise sets is required";
    }
  }

  return null;
}

/**
 * Validates a complete workout before saving
 */
export function validateWorkout(workout: UIWorkout): string | null {
  if (!isNonEmptyString(workout.name)) {
    return "Workout name is required";
  }

  if (
    workout.sections.filter((section) => section.localStatus !== "deleted")
      .length === 0
  ) {
    return "Workout requiere at least one section";
  }

  return null;
}
