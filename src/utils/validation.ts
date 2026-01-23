import { LOCAL_STATUS_DELETED } from "../constants/constants";
import { UISection, UIWorkout } from "../types/ui";

export const ValidationErrors = {
  EMPTY_STRING: "This field is required",
  INVALID_NUMBER: "Must be a valid number",
  INVALID_EMAIL: "Invalid email format",
} as const;

export function isNonEmptyString(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function isNumberDefined(value: unknown): boolean {
  return typeof value === "number" && !isNaN(value);
}

export function isPositiveNumber(value: unknown): boolean {
  const num = Number(value);
  return Number.isFinite(num) && num >= 0;
}

export function validateSection(section: UISection): string | null {
  if (!isNonEmptyString(section.name)) {
    return "Section name is required";
  }

  if (!isNonEmptyString(section.type)) {
    return "Section type is required";
  }

  if (!isNumberDefined(section.prepare_time)) {
    return "Prepare time is required";
  }

  if (!isNumberDefined(section.rest_exercise)) {
    return "Rest between exercises is requiered";
  }

  if (
    section.exercises.filter(
      (exercise) => exercise.localStatus !== LOCAL_STATUS_DELETED,
    ).length === 0
  ) {
    return "Section requiere at least one exercise";
  }

  for (const exercise of section.exercises) {
    if (exercise.localStatus === LOCAL_STATUS_DELETED) continue;

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

export function validateWorkout(workout: UIWorkout): string | null {
  if (!isNonEmptyString(workout.name)) {
    return "Workout name is required";
  }

  if (
    workout.sections.filter(
      (section) => section.localStatus !== LOCAL_STATUS_DELETED,
    ).length === 0
  ) {
    return "Workout requiere at least one section";
  }

  return null;
}
