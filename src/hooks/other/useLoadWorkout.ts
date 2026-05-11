import { LOCAL_STATUS_UPDATED } from "../../constants/constants";
import { transformBlockToUI } from "../../utils/transformers";
import { useBlocks } from "../base/useBlocks";
import { useWorkouts } from "../base/useWorkouts";

export const useLoadWorkout = () => {
  const { getWorkoutById, getAllBlocksByWorkoutId } = useWorkouts();
  const { getAllExercisesByBlockId } = useBlocks();

  return async (id: number) => {
    const workout = await getWorkoutById(id);
    if (!workout) throw new Error("Workout not found");
    const blocks = await getAllBlocksByWorkoutId(id);

    const blocksWithExercises = await Promise.all(
      blocks.map(async (block) => {
        const exercises = await getAllExercisesByBlockId(block.id);
        return transformBlockToUI(block, exercises);
      }),
    );

    return {
      ...workout,
      blocks: blocksWithExercises,
      localStatus: LOCAL_STATUS_UPDATED as typeof LOCAL_STATUS_UPDATED,
    };
  };
};
