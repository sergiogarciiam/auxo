import { LOCAL_STATUS_UPDATED } from "../../constants/constants";
import { transformSectionToUI } from "../../utils/transformers";
import { useSections } from "../base/useSections";
import { useWorkouts } from "../base/useWorkouts";

export const useLoadWorkout = () => {
  const { getWorkoutById, getAllSectionsByWorkoutId } = useWorkouts();
  const { getAllExercisesBySectionId } = useSections();

  return async (id: number) => {
    const workout = await getWorkoutById(id);
    const sections = await getAllSectionsByWorkoutId(id);

    const sectionsWithExercises = await Promise.all(
      sections.map(async (section) => {
        const exercises = await getAllExercisesBySectionId(section.id);
        return transformSectionToUI(section, exercises);
      }),
    );

    return {
      ...workout,
      sections: sectionsWithExercises,
      localStatus: LOCAL_STATUS_UPDATED as typeof LOCAL_STATUS_UPDATED,
    };
  };
};
