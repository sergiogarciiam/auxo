import { useCallback } from "react";
import {
  EXERCISE_TYPES_TIME,
  LOCAL_STATUS_DELETED,
  LOCAL_STATUS_NEW,
  LOCAL_STATUS_UPDATED,
} from "../../constants/constants";
import { UIWorkout } from "../../types/ui";
import { serializeSetsData } from "../../utils/exercise-utils";
import { validateWorkout } from "../../utils/validation";
import { useBlocks } from "./useBlocks";
import { useExercises } from "./useExercises";
import { useWorkouts } from "./useWorkouts";

export const useSaveWorkout = () => {
  const { createWorkout, updateWorkout } = useWorkouts();
  const { createBlock, updateBlock, deleteBlock } = useBlocks();
  const { createExercise, updateExercise, deleteExercise } = useExercises();

  /**
   * Saves a complete workout and all its blocks/exercises to database
   * Validates data before writing to prevent partial saves
   */
  const saveWorkout = useCallback(
    async (uiWorkout: UIWorkout): Promise<number | string> => {
      const validationError = validateWorkout(uiWorkout);
      if (validationError) {
        throw new Error(validationError);
      }

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

        // 2. BLOCKS
        for (const sec of uiWorkout.blocks) {
          let blockId = sec.id;

          switch (sec.localStatus) {
            case LOCAL_STATUS_NEW: {
              blockId = await createBlock({
                workout_id: workoutId as number,
                name: sec.name,
                type: sec.type,
                rest_group: sec.rest_group,
                position: sec.position,
              });
              break;
            }

            case LOCAL_STATUS_UPDATED: {
              await updateBlock({
                id: blockId as number,
                workout_id: workoutId as number,
                name: sec.name,
                type: sec.type,
                prepare_time: sec.prepare_time,
                rest_group: sec.rest_group,
                position: sec.position,
              });
              break;
            }

            case LOCAL_STATUS_DELETED: {
              if (typeof blockId === "number") {
                await deleteBlock(blockId);
              }
              continue;
            }
          }

          // 3. EXERCISES
          for (const ex of sec.exercises) {
            switch (ex.localStatus) {
              case LOCAL_STATUS_NEW: {
                const setsDataJson = serializeSetsData(
                  ex.config_type === "complex" ? ex.sets_data : undefined,
                );

                await createExercise({
                  block_id: blockId as number,
                  name: ex.name,
                  last_reps: ex.last_reps,
                  max_reps: ex.max_reps,
                  min_reps: ex.min_reps,
                  time_seconds: ex.exercise_time,
                  rest_time: ex.rest_time,
                  exercise_type: ex.exercise_type,
                  config_type: ex.config_type,
                  weight: ex.weight,
                  sets: ex.sets,
                  sets_data: setsDataJson,
                  position: ex.position,
                });
                break;
              }

              case LOCAL_STATUS_UPDATED: {
                const setsDataJson = serializeSetsData(
                  ex.config_type === "complex" ? ex.sets_data : undefined,
                );

                await updateExercise({
                  id: ex.id as number,
                  block_id: blockId as number,
                  name: ex.name,
                  last_reps: ex.last_reps,
                  max_reps: ex.max_reps,
                  min_reps: ex.min_reps,
                  time_seconds: ex.exercise_time,
                  rest_time: ex.rest_time,
                  exercise_type: ex.exercise_type,
                  config_type: ex.config_type,
                  weight: ex.weight,
                  sets: ex.sets,
                  sets_data: setsDataJson,
                  position: ex.position,
                });
                break;
              }

              case LOCAL_STATUS_DELETED:
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
      createBlock,
      updateBlock,
      deleteBlock,
      createExercise,
      updateExercise,
      deleteExercise,
    ],
  );

  return { saveWorkout };
};
