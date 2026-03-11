import { nanoid } from "nanoid/non-secure";
import { create } from "zustand";
import {
  LOCAL_STATUS_DELETED,
  LOCAL_STATUS_NEW,
  LOCAL_STATUS_UNCHANGED,
  LOCAL_STATUS_UPDATED,
} from "../constants/constants";
import { LocalStatus, UIExercise, UISection, UIWorkout } from "../types/ui";
import {
  createTempExercise,
  createTempSection,
  createTempWorkout,
} from "../utils/workout-store-utils";

interface WorkoutStore {
  localWorkouts: UIWorkout[];

  workout: UIWorkout | null;
  section: UISection | null;

  loadWorkouts: (workouts: UIWorkout[]) => void;

  loadWorkout: (workout: UIWorkout) => void;
  startNewWorkout: () => void;
  setName: (name: string) => void;

  startNewSection: (newSectionId: string) => UISection | undefined;
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
  localWorkouts: [],

  workout: null,
  section: null,

  loadWorkouts: (workouts) => set({ localWorkouts: workouts }),

  startNewWorkout: () => {
    const state = get();

    return set({
      workout: createTempWorkout(state.localWorkouts.length),
    });
  },

  loadWorkout: (workoutFromDb) =>
    set({
      workout: {
        ...workoutFromDb,
        sections: (workoutFromDb.sections || []).map((section) => ({
          ...section,
          localStatus: LOCAL_STATUS_UNCHANGED,
          exercises: (section.exercises || []).map((exercise) => ({
            ...exercise,
            localStatus: LOCAL_STATUS_UNCHANGED,
          })),
        })),
        localStatus: LOCAL_STATUS_UPDATED,
      },
    }),

  /**
   * Updates the workout name
   */
  setName: (name) =>
    set((state) => ({
      workout: state.workout
        ? {
            ...state.workout,
            name,
          }
        : null,
    })),

  startNewSection: (newSectionId) => {
    const state = get();

    // Ensure a workout exists before creating a section
    if (!state.workout) return;

    const workout = get().workout!;
    const newSection = createTempSection(
      newSectionId,
      workout.id,
      workout.sections.length,
    );

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
      const idToFind = sectionId?.toString();
      const section = state.workout?.sections.find(
        (s) => s.id?.toString() === idToFind,
      );

      return { section: section || null };
    });
  },

  updateSection: (id, data) =>
    set((state) => {
      const idToFind = id?.toString();
      const updatedSections: UISection[] = state.workout!.sections.map((s) =>
        s.id?.toString() === idToFind
          ? {
              ...s,
              ...data,
              localStatus:
                s.localStatus === LOCAL_STATUS_NEW
                  ? LOCAL_STATUS_NEW
                  : LOCAL_STATUS_UPDATED,
            }
          : s,
      );
      const updatedSection =
        updatedSections.find((s) => s.id?.toString() === idToFind) || null;

      return {
        workout: { ...state.workout!, sections: updatedSections },
        section: updatedSection,
      };
    }),

  removeSection: (id) =>
    set((state) => {
      const idToFind = id?.toString();

      const section = state.workout!.sections.find(
        (s) => s.id?.toString() === idToFind,
      );

      if (
        section?.localStatus === LOCAL_STATUS_NEW ||
        section?.id?.toString().startsWith("temp-")
      ) {
        const sections = state.workout!.sections.filter(
          (s) => s.id?.toString() !== idToFind,
        );
        return { workout: { ...state.workout!, sections } };
      }

      const sections = state.workout!.sections.map((section) =>
        section.id?.toString() === idToFind
          ? { ...section, localStatus: LOCAL_STATUS_DELETED as LocalStatus }
          : section,
      );

      return { workout: { ...state.workout!, sections } };
    }),

  addExercise: (sectionId) =>
    set((state) => {
      const tmpId = `tmp-ex-${nanoid()}`;
      const sectionIdStr = sectionId?.toString();

      const sections = state.workout!.sections.map((section) => {
        if (section.id?.toString() !== sectionIdStr) return section;

        const newExercise = createTempExercise(
          tmpId,
          sectionId,
          section.exercises.length,
        );

        return {
          ...section,
          exercises: [...section.exercises, newExercise],
        };
      });

      const updatedSection =
        sections.find((s) => s.id?.toString() === sectionIdStr) || null;

      return {
        workout: { ...state.workout!, sections },
        section: updatedSection,
      };
    }),

  updateExercise: (sectionId, exerciseId, data) =>
    set((state) => {
      const sectionIdStr = sectionId?.toString();
      const exerciseIdStr = exerciseId?.toString();

      const sections: UISection[] = state.workout!.sections.map((section) => {
        if (section.id?.toString() !== sectionIdStr) return section;

        const updatedExercises: UIExercise[] = section.exercises.map(
          (exercise) =>
            exercise.id?.toString() === exerciseIdStr
              ? {
                  ...exercise,
                  ...data,
                  localStatus:
                    exercise.localStatus === LOCAL_STATUS_NEW
                      ? LOCAL_STATUS_NEW
                      : LOCAL_STATUS_UPDATED,
                }
              : exercise,
        );

        return { ...section, exercises: updatedExercises };
      });

      const updatedSection =
        sections.find((s) => s.id?.toString() === sectionIdStr) || null;

      return {
        workout: { ...state.workout!, sections },
        section: updatedSection,
      };
    }),

  removeExercise: (sectionId, exerciseId) =>
    set((state) => {
      const sectionIdStr = sectionId?.toString();
      const exerciseIdStr = exerciseId?.toString();

      const sections: UISection[] = state.workout!.sections.map((section) => {
        if (section.id?.toString() !== sectionIdStr) return section;

        const exercises: UIExercise[] = section.exercises.map((exercise) =>
          exercise.id?.toString() === exerciseIdStr
            ? { ...exercise, localStatus: LOCAL_STATUS_DELETED }
            : exercise,
        );

        return { ...section, exercises };
      });

      const updatedSection =
        sections.find((s) => s.id?.toString() === sectionIdStr) || null;

      return {
        workout: { ...state.workout!, sections },
        section: updatedSection,
      };
    }),

  reset: () => set({ workout: null, section: null }),
}));
