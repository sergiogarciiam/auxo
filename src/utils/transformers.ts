import { Block } from "@/src/types/block";
import { Exercise } from "@/src/types/exercise";
import { UIBlock, UIExercise, UIWorkout } from "@/src/types/ui";
import { LOCAL_STATUS_UNCHANGED } from "../constants/constants";
import { Workout } from "../types/workout";

export function transformExerciseToUI(exercise: Exercise): UIExercise {
  return {
    id: exercise.id,
    block_id: exercise.block_id,
    name: exercise.name,
    reps: exercise.reps ?? 0,
    time_seconds: exercise.time_seconds ?? 0,
    weight: exercise.weight ?? 0,
    sets: exercise.sets ?? 0,
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
