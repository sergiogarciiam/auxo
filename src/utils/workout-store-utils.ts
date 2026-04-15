import { nanoid } from "nanoid/non-secure";
import { LOCAL_STATUS_NEW } from "../constants/constants";
import { UIBlock, UIExercise, UIWorkout } from "../types/ui";

export const createTempWorkout = (position: number): UIWorkout => ({
  id: `temp-${nanoid()}`,
  name: "",
  blocks: [],
  position,
  localStatus: LOCAL_STATUS_NEW,
});

export const createTempBlock = (
  newBlockId: string,
  workoutId: string | number,
  position: number,
): UIBlock => ({
  id: newBlockId,
  workout_id: workoutId,
  type: "",
  rest_exercise: 0,
  prepare_time: 0,
  name: "",
  exercises: [],
  position,
  rest_group: 0,
  localStatus: LOCAL_STATUS_NEW,
});

export const createTempExercise = (
  tmpId: string,
  blockId: string | number,
  position: number,
): UIExercise => ({
  id: tmpId,
  block_id: blockId,
  name: "",
  reps: 0,
  exercise_time: 0,
  exercise_type: "reps",
  config_type: "simple",
  rest_time: 0,
  position,
  weight: 0,
  sets: 1,
  localStatus: LOCAL_STATUS_NEW,
});
