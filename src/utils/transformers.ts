import { Exercise } from "@/src/types/exercise";
import { Section } from "@/src/types/section";
import { UIExercise, UISection, UIWorkout } from "@/src/types/ui";
import { LOCAL_STATUS_UNCHANGED } from "../constants/constants";
import { Workout } from "../types/workout";

export function transformExerciseToUI(exercise: Exercise): UIExercise {
  return {
    id: exercise.id,
    section_id: exercise.section_id,
    name: exercise.name,
    reps: exercise.reps ?? 0,
    time_seconds: exercise.time_seconds ?? 0,
    weight: exercise.weight ?? 0,
    sets: exercise.sets ?? 0,
    position: exercise.position,
    localStatus: LOCAL_STATUS_UNCHANGED,
  };
}

export function transformSectionToUI(
  section: Section,
  exercises: Exercise[],
): UISection {
  return {
    id: section.id,
    workout_id: section.workout_id,
    name: section.name,
    type: section.type,
    prepare_time: (section as any).prepare_time ?? 0,
    rest_exercise: section.rest_exercise,
    rest_group: section.rest_group ?? 0,
    position: section.position,
    localStatus: LOCAL_STATUS_UNCHANGED,
    exercises: exercises.map(transformExerciseToUI),
  };
}

export function transformWorkoutsToUI(wokouts: Workout[]): UIWorkout[] {
  return wokouts.map((workout) => ({
    id: workout.id,
    name: workout.name,
    position: workout.position,
    sections: [],
    localStatus: LOCAL_STATUS_UNCHANGED,
  }));
}
