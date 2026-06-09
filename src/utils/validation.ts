import { LOCAL_STATUS_DELETED } from "../constants/constants";
import { UIBlock, UIExercise, UIWorkout } from "../types/ui";

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

export function validateExercise(exercise: UIExercise): string | null {
  if (!isNonEmptyString(exercise.name)) {
    return "Exercise name is required";
  }

  if (
    exercise.sets == null ||
    (typeof exercise.sets !== "number" && typeof exercise.sets !== "string")
  ) {
    return "Exercise sets is required";
  }

  if (exercise.name.trim().toLowerCase() === "rest") {
    return null;
  }

  const hasReps =
    isNumberDefined(exercise.min_reps) || isNumberDefined(exercise.last_reps);

  const hasTime =
    exercise.config_type === "complex"
      ? Array.isArray(exercise.sets_data) &&
        exercise.sets_data.length > 0 &&
        exercise.sets_data.every(
          (set) => isNumberDefined(set.time_seconds) && set.time_seconds > 0,
        )
      : isNumberDefined(exercise.exercise_time) && exercise.exercise_time > 0;

  if (exercise.exercise_type === "reps" && !hasReps) {
    return "Exercise requiere min_reps or last_reps";
  }

  if (exercise.exercise_type === "time" && !hasTime) {
    return "Exercise requiere exercise_time";
  }

  return null;
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

  if (
    block.exercises.filter(
      (exercise) => exercise.localStatus !== LOCAL_STATUS_DELETED,
    ).length === 0
  ) {
    return "Block requiere at least one exercise";
  }

  for (const exercise of block.exercises) {
    if (exercise.localStatus === LOCAL_STATUS_DELETED) {
      continue;
    }
    const error = validateExercise(exercise);
    if (error) {
      return error;
    }
  }

  return null;
}

export function validateWorkout(workout: UIWorkout): string | null {
  if (!isNonEmptyString(workout.name) || workout.name.trim() === "") {
    return "Workout name is required";
  }

  const nonDeletedBlocks = workout.blocks.filter(
    (block) => block.localStatus !== LOCAL_STATUS_DELETED,
  );

  if (nonDeletedBlocks.length === 0) {
    return "Workout requiere at least one block";
  }

  for (const block of nonDeletedBlocks) {
    const error = validateBlock(block);
    if (error) {
      return error;
    }
  }

  return null;
}
