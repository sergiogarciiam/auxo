import { Block } from "@/src/types/block";
import { Exercise } from "@/src/types/exercise";
import { UIBlock, UIExercise, UIWorkout } from "@/src/types/ui";
import { LOCAL_STATUS_UNCHANGED } from "../constants/constants";
import { Workout } from "../types/workout";
import { deserializeSetsData } from "./exercise-utils";

export function transformExerciseToUI(exercise: Exercise): UIExercise {
  let sets_data;

  // Parse JSON sets_data if it exists and config_type is complex
  if (exercise.sets_data && exercise.config_type === "complex") {
    sets_data = deserializeSetsData(exercise.sets_data);
  }

  return {
    id: exercise.id,
    block_id: exercise.block_id,
    name: exercise.name,
    reps: exercise.reps ?? 0,
    rest_time: exercise.rest_time ?? 0,
    exercise_time: exercise.time_seconds ?? 0,
    exercise_type: exercise.exercise_type ?? "reps",
    config_type: exercise.config_type ?? "simple",
    weight: exercise.weight ?? 0,
    sets: exercise.sets ?? 0,
    sets_data,
    position: exercise.position,
    localStatus: LOCAL_STATUS_UNCHANGED,
  };
}

export function transformBlockToUI(
  block: Block,
  exercises: Exercise[],
): UIBlock {
  return {
    id: block.id,
    workout_id: block.workout_id,
    name: block.name,
    type: block.type,
    prepare_time: (block as any).prepare_time ?? 0,
    rest_exercise: block.rest_exercise,
    rest_group: block.rest_group ?? 0,
    position: block.position,
    localStatus: LOCAL_STATUS_UNCHANGED,
    exercises: exercises.map(transformExerciseToUI),
  };
}

export function transformWorkoutsToUI(wokouts: Workout[]): UIWorkout[] {
  return wokouts.map((workout) => ({
    id: workout.id,
    name: workout.name,
    position: workout.position,
    blocks: [],
    localStatus: LOCAL_STATUS_UNCHANGED,
  }));
}
