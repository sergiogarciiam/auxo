import { create } from "zustand";
import { ExecutionStep, FlexibleBlockSelection, UIWorkout } from "../types/ui";

/**
 * Track completed exercises in flexible blocks
 * Key format: `${blockId}:${exerciseId}`
 * Session-only state, resets when workout is abandoned
 * Persists when navigating between blocks in same workout
 */
interface FlexibleBlockState {
  completedExercises: string[]; // Array instead of Set for Zustand reactivity
  lastExerciseRestTime: Record<string, number>; // blockId -> rest_time
  currentSelection: FlexibleBlockSelection | null; // currently executing exercise in flexible block
}

interface StartWorkoutStore {
  workout: UIWorkout | null;
  executionPlan: ExecutionStep[];
  flexibleBlockState: FlexibleBlockState;
  startWorkout: (workout: UIWorkout, executionPlan: ExecutionStep[]) => void;
  stopWorkout: () => void;
  updatePlanSteps: (
    exerciseId: number | string,
    updates: {
      last_reps?: number;
      weight?: number;
      sets_data?: {
        last_reps: number;
        weight: number;
        min_reps: number;
        max_reps: number;
        time_seconds: number;
        rest_time: number;
      }[];
    },
  ) => void;
  /**
   * Update exercise data in both workout and execution plan
   * Called when exercise is saved from editing screens (block-form, workout-form)
   */
  updateExerciseInStore: (
    exerciseId: number | string,
    updates: Partial<{
      name: string;
      last_reps: number;
      min_reps: number;
      max_reps: number;
      exercise_time: number;
      weight: number;
      rest_time: number;
      sets: number;
      sets_data: {
        min_reps: number;
        max_reps: number;
        last_reps: number;
        time_seconds: number;
        weight: number;
        rest_time: number;
      }[];
      exercise_type: string;
      config_type: string;
    }>,
  ) => void;
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
    completedExercises: [],
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
        completedExercises: [],
        lastExerciseRestTime: {},
        currentSelection: null,
      },
    });
  },
  updatePlanSteps(exerciseId, updates) {
    set((state) => ({
      executionPlan: state.executionPlan.map((step) =>
        step.exerciseId !== undefined &&
        String(step.exerciseId) === String(exerciseId)
          ? { ...step, ...updates }
          : step,
      ),
    }));
  },
  updateExerciseInStore(exerciseId, updates) {
    set((state) => {
      if (!state.workout) return state;

      // Update exercise in workout
      const updatedWorkout = {
        ...state.workout,
        blocks: state.workout.blocks.map((block) => ({
          ...block,
          exercises: block.exercises.map((ex) =>
            String(ex.id) === String(exerciseId)
              ? {
                  ...ex,
                  name: updates.name ?? ex.name,
                  last_reps: updates.last_reps ?? ex.last_reps,
                  min_reps: updates.min_reps ?? ex.min_reps,
                  max_reps: updates.max_reps ?? ex.max_reps,
                  exercise_time: updates.exercise_time ?? ex.exercise_time,
                  weight: updates.weight ?? ex.weight,
                  rest_time: updates.rest_time ?? ex.rest_time,
                  sets: updates.sets ?? ex.sets,
                  sets_data: updates.sets_data ?? ex.sets_data,
                  exercise_type: updates.exercise_type ?? ex.exercise_type,
                  config_type: updates.config_type ?? ex.config_type,
                }
              : ex,
          ),
        })),
      };

      // Update all execution plan steps for this exercise
      const updatedExecutionPlan = state.executionPlan.map((step) => {
        if (String(step.exerciseId) !== String(exerciseId)) return step;

        const updateObj: any = {};
        if (updates.name !== undefined) updateObj.name = updates.name;
        if (updates.last_reps !== undefined)
          updateObj.last_reps = updates.last_reps;
        if (updates.min_reps !== undefined)
          updateObj.min_reps = updates.min_reps;
        if (updates.max_reps !== undefined)
          updateObj.max_reps = updates.max_reps;
        if (updates.exercise_time !== undefined)
          updateObj.time_seconds = updates.exercise_time;
        if (updates.weight !== undefined) updateObj.weight = updates.weight;
        if (updates.rest_time !== undefined)
          updateObj.duration_seconds = updates.rest_time;
        if (updates.sets !== undefined) updateObj.totalSets = updates.sets;
        if (updates.sets_data !== undefined)
          updateObj.sets_data = updates.sets_data;
        if (updates.exercise_type !== undefined)
          updateObj.exercise_type = updates.exercise_type;

        return { ...step, ...updateObj };
      });

      return {
        workout: updatedWorkout,
        executionPlan: updatedExecutionPlan,
      };
    });
  },
  markFlexibleExerciseCompleted(
    blockId: string | number,
    exerciseId: string | number,
  ) {
    const key = `${blockId}:${exerciseId}`;
    set((state) => {
      if (state.flexibleBlockState.completedExercises.includes(key)) {
        return state; // Already marked, no change needed
      }
      return {
        flexibleBlockState: {
          ...state.flexibleBlockState,
          completedExercises: [
            ...state.flexibleBlockState.completedExercises,
            key,
          ],
        },
      };
    });
  },
  isFlexibleExerciseCompleted(
    blockId: string | number,
    exerciseId: string | number,
  ) {
    const key = `${blockId}:${exerciseId}`;
    return get().flexibleBlockState.completedExercises.includes(key);
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
