import { transformSectionToUI } from "../utils/transformers";
import { useSections } from "./useSections";
import { useWorkouts } from "./useWorkouts";

export const useLoadWorkout = () => {
  const { getWorkoutById, getAllSections } = useWorkouts();
  const { getAllExercisesBySectionId } = useSections();

  return async (id: number) => {
    const workout = await getWorkoutById(id);
    const sections = await getAllSections(id);

    const sectionsWithExercises = await Promise.all(
      sections.map(async (section) => {
        const exercises = await getAllExercisesBySectionId(section.id);
        return transformSectionToUI(section, exercises);
      }),
    );

    return {
      ...workout,
      sections: sectionsWithExercises,
      localStatus: "updated" as const,
    };
  };
};
