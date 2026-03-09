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
  position: number,
): UISection => ({
  id: newSectionId,
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
  position: number,
): UIExercise => ({
  id: tmpId,
  name: "",
  reps: 0,
  time_seconds: 0,
  position,
  weight: 0,
  sets: 0,
  localStatus: LOCAL_STATUS_NEW,
});
