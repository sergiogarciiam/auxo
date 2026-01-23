import { nanoid } from "nanoid/non-secure";
import { LOCAL_STATUS_NEW } from "../constants/constants";
import { UIExercise, UISection, UIWorkout } from "../types/ui";

export const createTempWorkout = (position: number): UIWorkout => ({
  id: `temp-${nanoid()}`,
  name: "",
  sections: [],
  position,
  localStatus: LOCAL_STATUS_NEW,
});

export const createTempSection = (
  newSectionId: string,
  workoutId: string | number,
  position: number,
): UISection => ({
  id: newSectionId,
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
  sectionId: string | number,
  position: number,
): UIExercise => ({
  id: tmpId,
  section_id: sectionId,
  name: "",
  reps: 0,
  time_seconds: 0,
  position,
  weight: 0,
  sets: 0,
  localStatus: LOCAL_STATUS_NEW,
});
