import { create } from "zustand";
import { LOCAL_STATUS_UNCHANGED } from "../constants/constants";
import { UIExercise } from "../types/ui";
import { createTempExercise } from "../utils/workout-store-utils";

interface ExerciseStore {
  localExercises: UIExercise[];

  exercise: UIExercise | null;

  loadExercises: (exercises: UIExercise[]) => void;

  loadExercise: (exercise: UIExercise) => void;
  startNewExercise: () => void;

  reset: () => void;
}

export const useExerciseStore = create<ExerciseStore>((set, get) => ({
  localExercises: [],

  exercise: null,

  loadExercises: (exercises) => set({ localExercises: exercises }),

  startNewExercise: () => {
    const state = get();

    return set({
      exercise: createTempExercise(
        state.localExercises.length.toString(),
        state.localExercises.length,
      ),
    });
  },

  loadExercise: (exerciseFromDb) =>
    set({
      exercise: {
        ...exerciseFromDb,
        localStatus: LOCAL_STATUS_UNCHANGED,
      },
    }),

  reset: () => set({ exercise: null }),
}));
