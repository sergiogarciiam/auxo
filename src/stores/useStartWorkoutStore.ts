import { create } from "zustand";
import { ExecutionStep, UIWorkout } from "../types/ui";

interface StartWorkoutStore {
  workout: UIWorkout | null;
  executionPlan: ExecutionStep[];
  startWorkout: (workout: UIWorkout, executionPlan: ExecutionStep[]) => void;
}

export const useStartWorkoutStore = create<StartWorkoutStore>((set, get) => ({
  workout: null,
  executionPlan: [],

  startWorkout(workout: UIWorkout, executionPlan: ExecutionStep[]) {
    set({ workout, executionPlan });
  },
}));
