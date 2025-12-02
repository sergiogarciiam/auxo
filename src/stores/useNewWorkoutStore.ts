import { create } from "zustand";
import { ExerciseInterface } from "../types/exercise";
import { SectionInterface } from "../types/section";

interface NewWorkoutState {
  workoutId: number | null;
  name: string;
  sections: SectionInterface[];
  exercises: ExerciseInterface[];

  setWorkoutId: (id: number | null) => void;
  setName: (name: string) => void;
  setSections: (sections: SectionInterface[]) => void;
  setExercises: (exercises: ExerciseInterface[]) => void;

  addSection: (section: SectionInterface) => void;

  addExercise: (exercise: ExerciseInterface) => void;

  reset: () => void;
}

export const useNewWorkoutStore = create<NewWorkoutState>((set) => ({
  workoutId: null,
  name: "",
  sections: [],
  exercises: [],

  setWorkoutId: (id) => set({ workoutId: id }),
  setName: (name) => set({ name }),
  setSections: (sections) => set({ sections }),
  setExercises: (exercises) => set({ exercises }),

  addSection: (section) =>
    set((state) => ({
      sections: [...state.sections, section],
    })),

  addExercise: (exercise) =>
    set((state) => ({
      exercises: [...state.exercises, exercise],
    })),

  reset: () =>
    set({
      workoutId: null,
      name: "",
      sections: [],
      exercises: [],
    }),
}));
