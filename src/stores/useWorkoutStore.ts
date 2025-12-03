import { nanoid } from "nanoid/non-secure"; // para ids temporales
import { create } from "zustand";
import { UIExercise, UISection, UIWorkout } from "../types/ui";

interface WorkoutStore {
  workout: UIWorkout | null;
  section: UISection | null;

  loadWorkout: (workout: UIWorkout) => void;
  startNewWorkout: () => void;
  setName: (name: string) => void;

  startNewSection: (newSectionId: string) => void;
  loadSection: (sectionId: string) => void;
  updateSection: (tempId: string | number, data: Partial<UISection>) => void;
  removeSection: (tempId: string | number) => void;

  addExercise: (sectionId: string | number) => void;
  updateExercise: (
    sectionId: string | number,
    exerciseId: string | number,
    data: Partial<UIExercise>,
  ) => void;
  removeExercise: (
    sectionId: string | number,
    exerciseId: string | number,
  ) => void;

  reset: () => void;
}

export const useWorkoutStore = create<WorkoutStore>((set, get) => ({
  workout: null,
  section: null,

  startNewWorkout: () =>
    set({
      workout: {
        id: `temp-${nanoid()}`,
        name: "",
        sections: [],
        localStatus: "new",
      },
    }),

  loadWorkout: (workoutFromDb) =>
    set({
      workout: {
        ...workoutFromDb,
        sections: workoutFromDb.sections.map((section) => ({
          ...section,
          localStatus: "unchanged",
          exercises: section.exercises.map((exercise) => ({
            ...exercise,
            localStatus: "unchanged",
          })),
        })),
        localStatus: "updated",
      },
    }),

  setName: (name) =>
    set((state) => ({
      workout: {
        ...state.workout!,
        name,
      },
    })),

  startNewSection: (newSectionId) => {
    const newSection: UISection = {
      workout_id: get().workout!.id,
      type: "",
      rest_exercise: 0,
      id: newSectionId,
      name: "",
      exercises: [],
      position: get().workout!.sections.length,
      rest_group: 0,
      localStatus: "new",
    };

    set((state) => ({
      section: newSection,
      workout: state.workout
        ? {
            ...state.workout,
            sections: [...state.workout.sections, newSection],
          }
        : null,
    }));

    return newSection;
  },

  loadSection: (sectionId) => {
    set({ section: null });
    set((state) => {
      const section = state.workout!.sections.find(
        (section) => section.id === sectionId,
      );
      return { section: section || null };
    });
  },

  updateSection: (id, data) =>
    set((state) => {
      const updatedSections: UISection[] = state.workout!.sections.map((s) =>
        s.id === id
          ? {
              ...s,
              ...data,
              localStatus: s.localStatus === "new" ? "new" : "updated",
            }
          : s,
      );
      const updatedSection = updatedSections.find((s) => s.id === id) || null;

      return {
        workout: { ...state.workout!, sections: updatedSections },
        section: updatedSection,
      };
    }),

  removeSection: (id) =>
    set((state) => {
      const sections: UISection[] = state.workout!.sections.map((section) =>
        section.id === id
          ? {
              ...section,
              localStatus:
                section.localStatus === "new" ? "deleted" : "deleted",
            }
          : section,
      );

      return { workout: { ...state.workout!, sections } };
    }),

  addExercise: (sectionId) =>
    set((state) => {
      const tmpId = `tmp-ex-${nanoid()}`;

      const sections = state.workout!.sections.map((section) => {
        if (section.id !== sectionId) return section;

        const newExercise: UIExercise = {
          id: tmpId,
          section_id: sectionId,
          name: "",
          reps: 0,
          time_seconds: 0,
          position: section.exercises.length,
          weight: 0,
          sets: 0,
          localStatus: "new",
        };

        return {
          ...section,
          exercises: [...section.exercises, newExercise],
        };
      });

      return { workout: { ...state.workout!, sections } };
    }),

  updateExercise: (sectionId, exerciseId, data) =>
    set((state) => {
      const sections: UISection[] = state.workout!.sections.map((section) => {
        if (section.id !== sectionId) return section;

        const updatedExercises: UIExercise[] = section.exercises.map(
          (exercise) =>
            exercise.id === exerciseId
              ? {
                  ...exercise,
                  ...data,
                  localStatus:
                    exercise.localStatus === "new" ? "new" : "updated",
                }
              : exercise,
        );

        return { ...section, exercises: updatedExercises };
      });

      return { workout: { ...state.workout!, sections } };
    }),

  removeExercise: (sectionId, exerciseId) =>
    set((state) => {
      const sections: UISection[] = state.workout!.sections.map((section) => {
        if (section.id !== sectionId) return section;

        const exercises: UIExercise[] = section.exercises.map((exercise) =>
          exercise.id === exerciseId
            ? { ...exercise, localStatus: "deleted" }
            : exercise,
        );

        return { ...section, exercises };
      });

      return { workout: { ...state.workout!, sections } };
    }),

  reset: () => set({ workout: null }),
}));
