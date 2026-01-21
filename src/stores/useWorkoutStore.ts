import { nanoid } from "nanoid/non-secure";
import { create } from "zustand";
import { LocalStatus, UIExercise, UISection, UIWorkout } from "../types/ui";

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

/**
 * Helper to create a new temporary workout
 */
const createTempWorkout = (position: number): UIWorkout => ({
  id: `temp-${nanoid()}`,
  name: "",
  sections: [],
  position,
  localStatus: "new",
});

/**
 * Helper to create a new temporary section
 */
const createTempSection = (
  newSectionId: string,
  workoutId: string | number,
  position: number,
): UISection => ({
  id: newSectionId,
  workout_id: workoutId,
  type: "",
  rest_exercise: 0,
  prepare_time: 0,
  name: "",
  exercises: [],
  position,
  rest_group: 0,
  localStatus: "new",
});

/**
 * Helper to create a new temporary exercise
 */
const createTempExercise = (
  tmpId: string,
  sectionId: string | number,
  position: number,
): UIExercise => ({
  id: tmpId,
  section_id: sectionId,
  name: "",
  reps: 0,
  time_seconds: 0,
  position,
  weight: 0,
  sets: 0,
  localStatus: "new",
});

export const useWorkoutStore = create<WorkoutStore>((set, get) => ({
  localWorkouts: [],

  workout: null,
  section: null,

  /**
   * Loads multiple workouts into the store
   */
  loadWorkouts: (workouts) => set({ localWorkouts: workouts }),

  /**
   * Initializes a new empty workout
   */
  startNewWorkout: () => {
    const state = get();

    return set({
      workout: createTempWorkout(state.localWorkouts.length),
    });
  },

  /**
   * Loads an existing workout from database
   */
  loadWorkout: (workoutFromDb) =>
    set({
      workout: {
        ...workoutFromDb,
        sections: (workoutFromDb.sections || []).map((section) => ({
          ...section,
          localStatus: "unchanged",
          exercises: (section.exercises || []).map((exercise) => ({
            ...exercise,
            localStatus: "unchanged",
          })),
        })),
        localStatus: "updated",
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

  /**
   * Creates a new section in the current workout
   * Ensures a workout exists before creating a section
   */
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

  /**
   * Loads a section into the current context
   */
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

  /**
   * Updates a section's data
   */
  updateSection: (id, data) =>
    set((state) => {
      const idToFind = id?.toString();
      const updatedSections: UISection[] = state.workout!.sections.map((s) =>
        s.id?.toString() === idToFind
          ? {
              ...s,
              ...data,
              localStatus: s.localStatus === "new" ? "new" : "updated",
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

  /**
   * Marks a section as deleted
   */
  removeSection: (id) =>
    set((state) => {
      const idToFind = id?.toString();

      const section = state.workout!.sections.find(
        (s) => s.id?.toString() === idToFind,
      );

      if (
        section?.localStatus === "new" ||
        section?.id?.toString().startsWith("temp-")
      ) {
        const sections = state.workout!.sections.filter(
          (s) => s.id?.toString() !== idToFind,
        );
        return { workout: { ...state.workout!, sections } };
      }

      const sections = state.workout!.sections.map((section) =>
        section.id?.toString() === idToFind
          ? { ...section, localStatus: "deleted" as LocalStatus }
          : section,
      );

      return { workout: { ...state.workout!, sections } };
    }),

  /**
   * Adds a new exercise to a section
   */
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

  /**
   * Updates an exercise's data
   */
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
                    exercise.localStatus === "new" ? "new" : "updated",
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

  /**
   * Marks an exercise as deleted
   */
  removeExercise: (sectionId, exerciseId) =>
    set((state) => {
      const sectionIdStr = sectionId?.toString();
      const exerciseIdStr = exerciseId?.toString();

      const sections: UISection[] = state.workout!.sections.map((section) => {
        if (section.id?.toString() !== sectionIdStr) return section;

        const exercises: UIExercise[] = section.exercises.map((exercise) =>
          exercise.id?.toString() === exerciseIdStr
            ? { ...exercise, localStatus: "deleted" }
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

  /**
   * Clears the current workout state
   */
  reset: () => set({ workout: null, section: null }),
}));
