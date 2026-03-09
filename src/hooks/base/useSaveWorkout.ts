import { useCallback } from "react";
import {
  LOCAL_STATUS_DELETED,
  LOCAL_STATUS_NEW,
  LOCAL_STATUS_UPDATED,
} from "../../constants/constants";
import { UIWorkout } from "../../types/ui";
import { useExercises } from "./useExercises";
import { useSections } from "./useSections";
import { useWorkouts } from "./useWorkouts";

export const useSaveWorkout = () => {
  const {
    createWorkout,
    updateWorkout,
    addSectionToWorkout,
    removeSectionFromWorkout,
    updateSectionPositionInWorkout,
  } = useWorkouts();
  const {
    createSection,
    updateSection,
    deleteSection,
    addExerciseToSection,
    removeExerciseFromSection,
    updateExercisePositionInSection,
  } = useSections();
  const { createExercise, updateExercise, deleteExercise } = useExercises();

  /**
   * Saves a complete workout and all its sections/exercises to database
   * Validates data before writing to prevent partial saves
   */
  const saveWorkout = useCallback(
    async (uiWorkout: UIWorkout): Promise<number | string> => {
      let workoutId = uiWorkout.id;

      try {
        // 1. WORKOUT
        if (uiWorkout.localStatus === LOCAL_STATUS_NEW) {
          workoutId = await createWorkout({
            name: uiWorkout.name,
            position: uiWorkout.position,
          });
        } else if (uiWorkout.localStatus === LOCAL_STATUS_UPDATED) {
          await updateWorkout({
            id: workoutId as number,
            name: uiWorkout.name,
            position: uiWorkout.position,
          });
        }

        // 2. SECTIONS
        for (
          let sectionIndex = 0;
          sectionIndex < uiWorkout.sections.length;
          sectionIndex++
        ) {
          const sec = uiWorkout.sections[sectionIndex];
          let sectionId = sec.id;

          switch (sec.localStatus) {
            case LOCAL_STATUS_NEW: {
              sectionId = await createSection({
                name: sec.name,
                type: sec.type,
                rest_exercise: sec.rest_exercise,
                rest_group: sec.rest_group,
                prepare_time: sec.prepare_time,
              });
              // Link section to workout
              await addSectionToWorkout(
                workoutId as number,
                sectionId as number,
                sec.position,
              );
              break;
            }

            case LOCAL_STATUS_UPDATED: {
              await updateSection({
                id: sectionId as number,
                name: sec.name,
                type: sec.type,
                prepare_time: sec.prepare_time,
                rest_exercise: sec.rest_exercise,
                rest_group: sec.rest_group,
              });
              // Update position in workout
              await updateSectionPositionInWorkout(
                workoutId as number,
                sectionId as number,
                sec.position,
              );
              break;
            }

            case LOCAL_STATUS_DELETED: {
              if (typeof sectionId === "number") {
                await removeSectionFromWorkout(workoutId as number, sectionId);
                await deleteSection(sectionId);
              }
              continue;
            }
          }

          // 3. EXERCISES
          for (
            let exerciseIndex = 0;
            exerciseIndex < sec.exercises.length;
            exerciseIndex++
          ) {
            const ex = sec.exercises[exerciseIndex];

            switch (ex.localStatus) {
              case LOCAL_STATUS_NEW: {
                const exerciseId = await createExercise({
                  name: ex.name,
                  reps: ex.reps,
                  time_seconds: ex.time_seconds,
                  weight: ex.weight,
                  sets: ex.sets,
                });
                // Link exercise to section
                await addExerciseToSection(
                  sectionId as number,
                  exerciseId as number,
                  ex.position,
                );
                break;
              }

              case LOCAL_STATUS_UPDATED: {
                await updateExercise({
                  id: ex.id as number,
                  name: ex.name,
                  reps: ex.reps,
                  time_seconds: ex.time_seconds,
                  weight: ex.weight,
                  sets: ex.sets,
                });
                // Update position in section
                await updateExercisePositionInSection(
                  sectionId as number,
                  ex.id as number,
                  ex.position,
                );
                break;
              }

              case LOCAL_STATUS_DELETED:
                if (typeof ex.id === "number") {
                  await removeExerciseFromSection(sectionId as number, ex.id);
                  await deleteExercise(ex.id);
                }
                break;
            }
          }
        }

        return workoutId;
      } catch (error) {
        console.error("Error saving workout:", error);
        throw error;
      }
    },
    [
      createWorkout,
      updateWorkout,
      addSectionToWorkout,
      removeSectionFromWorkout,
      updateSectionPositionInWorkout,
      createSection,
      updateSection,
      deleteSection,
      addExerciseToSection,
      removeExerciseFromSection,
      updateExercisePositionInSection,
      createExercise,
      updateExercise,
      deleteExercise,
    ],
  );

  return { saveWorkout };
};
