import { LOCAL_STATUS_UPDATED } from "../../constants/constants";
import { transformWorkoutToUI } from "../../utils/transformers";
import { useWorkouts } from "../base/useWorkouts";

export const useLoadWorkout = () => {
  const { getWorkoutWithSectionsAndExercises } = useWorkouts();

  return async (id: number) => {
    const workout = await getWorkoutWithSectionsAndExercises(id);

    return transformWorkoutToUI(workout, LOCAL_STATUS_UPDATED);
  };
};
