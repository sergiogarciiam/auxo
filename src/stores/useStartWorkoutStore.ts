import { create } from "zustand";
import { ExecutionStep, FlexibleBlockSelection, UIWorkout } from "../types/ui";

/**
 * Track completed exercises in flexible blocks
 * Key format: `${blockId}:${exerciseId}`
 * Session-only state, resets when workout is abandoned
 * Persists when navigating between blocks in same workout
 */
interface FlexibleBlockState {
  completedExercises: Set<string>;
  lastExerciseRestTime: Record<string, number>; // blockId -> rest_time
  currentSelection: FlexibleBlockSelection | null; // currently executing exercise in flexible block
}

interface StartWorkoutStore {
  workout: UIWorkout | null;
  executionPlan: ExecutionStep[];
  flexibleBlockState: FlexibleBlockState;
  startWorkout: (workout: UIWorkout, executionPlan: ExecutionStep[]) => void;
  stopWorkout: () => void;
  markFlexibleExerciseCompleted: (
    blockId: string | number,
    exerciseId: string | number,
  ) => void;
  isFlexibleExerciseCompleted: (
    blockId: string | number,
    exerciseId: string | number,
  ) => boolean;
  setLastExerciseRestTime: (blockId: string | number, restTime: number) => void;
  setFlexibleSelection: (selection: FlexibleBlockSelection | null) => void;
  getFlexibleSelection: () => FlexibleBlockSelection | null;
}

export const useStartWorkoutStore = create<StartWorkoutStore>((set, get) => ({
  workout: null,
  executionPlan: [],
  flexibleBlockState: {
    completedExercises: new Set(),
    lastExerciseRestTime: {},
    currentSelection: null,
  },

  startWorkout(workout: UIWorkout, executionPlan: ExecutionStep[]) {
    set({ workout, executionPlan });
  },
  stopWorkout() {
    set({
      workout: null,
      executionPlan: [],
      flexibleBlockState: {
        completedExercises: new Set(),
        lastExerciseRestTime: {},
        currentSelection: null,
      },
    });
  },
  markFlexibleExerciseCompleted(
    blockId: string | number,
    exerciseId: string | number,
  ) {
    const key = `${blockId}:${exerciseId}`;
    set((state) => ({
      flexibleBlockState: {
        ...state.flexibleBlockState,
        completedExercises: new Set([
          ...state.flexibleBlockState.completedExercises,
          key,
        ]),
      },
    }));
  },
  isFlexibleExerciseCompleted(
    blockId: string | number,
    exerciseId: string | number,
  ) {
    const key = `${blockId}:${exerciseId}`;
    return get().flexibleBlockState.completedExercises.has(key);
  },
  setLastExerciseRestTime(blockId: string | number, restTime: number) {
    set((state) => ({
      flexibleBlockState: {
        ...state.flexibleBlockState,
        lastExerciseRestTime: {
          ...state.flexibleBlockState.lastExerciseRestTime,
          [blockId]: restTime,
        },
      },
    }));
  },
  setFlexibleSelection(selection: FlexibleBlockSelection | null) {
    set((state) => ({
      flexibleBlockState: {
        ...state.flexibleBlockState,
        currentSelection: selection,
      },
    }));
  },
  getFlexibleSelection() {
    return get().flexibleBlockState.currentSelection;
  },
}));
