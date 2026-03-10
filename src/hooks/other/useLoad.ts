import { LOCAL_STATUS_UPDATED } from "../../constants/constants";
import {
  transformSectionToUI,
  transformWorkoutToUI,
} from "../../utils/transformers";
import { useSections } from "../base/useSections";
import { useWorkouts } from "../base/useWorkouts";

export const useLoadWorkout = () => {
  const { getWorkoutWithSectionsAndExercises } = useWorkouts();

  return async (id: number) => {
    const workout = await getWorkoutWithSectionsAndExercises(id);

    return transformWorkoutToUI(workout, LOCAL_STATUS_UPDATED);
  };
};

export const useLoadSection = () => {
  const { getSectionById } = useSections();
  const { getAllExercisesBySectionId } = useSections();

  return async (id: number) => {
    const section = await getSectionById(id);
    const exercises = await getAllExercisesBySectionId(id);

    return transformSectionToUI(section, exercises);
  };
};
