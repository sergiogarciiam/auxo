/**
 * Data transformation utilities for converting between database and UI formats
 */
import { Exercise } from "@/src/types/exercise";
import { Section } from "@/src/types/section";
import { UIExercise, UISection } from "@/src/types/ui";

/**
 * Transforms a database exercise to UI format with localStatus
 */
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
    localStatus: "unchanged",
  };
}

/**
 * Transforms database section with exercises to UI format
 */
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
    localStatus: "unchanged",
    exercises: exercises.map(transformExerciseToUI),
  };
}
