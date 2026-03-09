import { Exercise } from "@/src/types/exercise";
import { Section } from "@/src/types/section";
import { LocalStatus, UIExercise, UISection, UIWorkout } from "@/src/types/ui";
import { LOCAL_STATUS_UNCHANGED } from "../constants/constants";
import { Workout } from "../types/workout";

export function transformExerciseToUI(exercise: Exercise): UIExercise {
  return {
    id: exercise.id,
    name: exercise.name,
    reps: exercise.reps ?? 0,
    time_seconds: exercise.time_seconds ?? 0,
    weight: exercise.weight ?? 0,
    sets: exercise.sets ?? 0,
    position: 0, // position will be set by junction table
    localStatus: LOCAL_STATUS_UNCHANGED,
  };
}

export function transformSectionToUI(
  section: Section,
  exercises: Exercise[],
): UISection {
  return {
    id: section.id,
    name: section.name,
    type: section.type,
    prepare_time: (section as any).prepare_time ?? 0,
    rest_exercise: section.rest_exercise,
    rest_group: section.rest_group ?? 0,
    position: 0, // position will be set by junction table
    localStatus: LOCAL_STATUS_UNCHANGED,
    exercises: exercises.map(transformExerciseToUI),
  };
}

export function transformWorkoutToUI(
  workout: any,
  localStatus: LocalStatus = LOCAL_STATUS_UNCHANGED,
): UIWorkout {
  return {
    id: workout.id,
    name: workout.name,
    position: workout.position,
    sections: (workout.sections || []).map((section: any) => ({
      id: section.id,
      name: section.name,
      type: section.type,
      prepare_time: section.prepare_time ?? 0,
      rest_exercise: section.rest_exercise,
      rest_group: section.rest_group ?? 0,
      position: section.position ?? 0,
      localStatus: LOCAL_STATUS_UNCHANGED,
      exercises: (section.exercises || []).map((exercise: any) => ({
        id: exercise.id,
        name: exercise.name,
        reps: exercise.reps ?? 0,
        time_seconds: exercise.time_seconds ?? 0,
        weight: exercise.weight ?? 0,
        sets: exercise.sets ?? 0,
        position: exercise.position ?? 0,
        localStatus: LOCAL_STATUS_UNCHANGED,
      })),
    })),
    localStatus,
  };
}

export function transformWorkoutsToUI(workouts: Workout[]): UIWorkout[] {
  return workouts.map((workout) => ({
    id: workout.id,
    name: workout.name,
    position: workout.position,
    sections: [],
    localStatus: LOCAL_STATUS_UNCHANGED,
  }));
}
