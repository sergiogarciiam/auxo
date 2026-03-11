import { LOCAL_STATUS_DELETED } from "../constants/constants";
import { UIBlock, UIWorkout } from "../types/ui";

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

export function validateBlock(block: UIBlock): string | null {
  if (!isNonEmptyString(block.name)) {
    return "Block name is required";
  }

  if (!isNonEmptyString(block.type)) {
    return "Block type is required";
  }

  if (!isNumberDefined(block.prepare_time)) {
    return "Prepare time is required";
  }

  if (!isNumberDefined(block.rest_exercise)) {
    return "Rest between exercises is requiered";
  }

  if (
    block.exercises.filter(
      (exercise) => exercise.localStatus !== LOCAL_STATUS_DELETED,
    ).length === 0
  ) {
    return "Block requiere at least one exercise";
  }

  for (const exercise of block.exercises) {
    if (exercise.localStatus === LOCAL_STATUS_DELETED) continue;

    if (!isNonEmptyString(exercise.name)) {
      return "Exercise name is required";
    }

    if (
      (!isNumberDefined(exercise.reps) || exercise.reps === 0) &&
      !isNumberDefined(exercise.time_seconds)
    ) {
      return "Either reps or time is required";
    }
  }

  return null;
}

export function validateWorkout(workout: UIWorkout): string | null {
  if (!isNonEmptyString(workout.name)) {
    return "Workout name is required";
  }

  if (
    workout.blocks.filter((block) => block.localStatus !== LOCAL_STATUS_DELETED)
      .length === 0
  ) {
    return "Workout requiere at least one block";
  }

  return null;
}
