import { UIWorkout } from "../types/ui";
import { useExercises } from "./useExercises";
import { useSections } from "./useSections";
import { useWorkouts } from "./useWorkouts";

export const useSaveWorkout = () => {
  const { createWorkout, updateWorkout } = useWorkouts();
  const { createSection, updateSection, deleteSection } = useSections();
  const { createExercise, updateExercise, deleteExercise } = useExercises();

  const saveWorkout = async (uiWorkout: UIWorkout) => {
    let workoutId = uiWorkout.id;

    // 1. WORKOUT
    if (uiWorkout.localStatus === "new") {
      workoutId = await createWorkout({ name: uiWorkout.name });
    } else if (uiWorkout.localStatus === "updated") {
      await updateWorkout({ id: workoutId!, name: uiWorkout.name });
    }

    // 2. SECTIONS
    for (const sec of uiWorkout.sections) {
      let sectionId = sec.id;

      switch (sec.localStatus) {
        case "new": {
          sectionId = await createSection({
            workout_id: workoutId!,
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
            workout_id: workoutId!,
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
            await deleteSection({ id: sectionId });
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
              time: ex.time_seconds,
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
              time: ex.time_seconds,
              weight: ex.weight,
              sets: ex.sets,
              position: ex.position,
            });
            break;

          case "deleted":
            if (typeof ex.id === "number") {
              await deleteExercise({ id: ex.id });
            }
            break;
        }
      }
    }

    return workoutId!;
  };

  return { saveWorkout };
};
