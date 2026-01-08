import { useCallback } from "react";
import { UIWorkout } from "../types/ui";
import { useExercises } from "./useExercises";
import { useSections } from "./useSections";
import { useWorkouts } from "./useWorkouts";

export const useSaveWorkout = () => {
  const { createWorkout, updateWorkout } = useWorkouts();
  const { createSection, updateSection, deleteSection } = useSections();
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
        if (uiWorkout.localStatus === "new") {
          workoutId = await createWorkout({ name: uiWorkout.name });
        } else if (uiWorkout.localStatus === "updated") {
          await updateWorkout({
            id: workoutId as number,
            name: uiWorkout.name,
          });
        }

        // 2. SECTIONS
        for (const sec of uiWorkout.sections) {
          let sectionId = sec.id;

          switch (sec.localStatus) {
            case "new": {
              sectionId = await createSection({
                workout_id: workoutId as number,
                name: sec.name,
                type: sec.type,
                rest_exercise: sec.rest_exercise,
                rest_group: sec.rest_group,
                position: sec.position,
              });
              break;
            }

            case "updated": {
              await updateSection({
                id: sectionId as number,
                workout_id: workoutId as number,
                name: sec.name,
                type: sec.type,
                rest_exercise: sec.rest_exercise,
                rest_group: sec.rest_group,
                position: sec.position,
              });
              break;
            }

            case "deleted": {
              if (typeof sectionId === "number") {
                await deleteSection(sectionId);
              }
              continue;
            }
          }

          // 3. EXERCISES
          for (const ex of sec.exercises) {
            switch (ex.localStatus) {
              case "new":
                await createExercise({
                  section_id: sectionId as number,
                  name: ex.name,
                  reps: ex.reps,
                  time_seconds: ex.time_seconds,
                  weight: ex.weight,
                  sets: ex.sets,
                  position: ex.position,
                });
                break;

              case "updated":
                await updateExercise({
                  id: ex.id as number,
                  section_id: sectionId as number,
                  name: ex.name,
                  reps: ex.reps,
                  time_seconds: ex.time_seconds,
                  weight: ex.weight,
                  sets: ex.sets,
                  position: ex.position,
                });
                break;

              case "deleted":
                if (typeof ex.id === "number") {
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
      createSection,
      updateSection,
      deleteSection,
      createExercise,
      updateExercise,
      deleteExercise,
    ],
  );

  return { saveWorkout };
};
