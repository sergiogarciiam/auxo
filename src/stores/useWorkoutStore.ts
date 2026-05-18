import { nanoid } from "nanoid/non-secure";
import { create } from "zustand";
import {
  LOCAL_STATUS_DELETED,
  LOCAL_STATUS_NEW,
  LOCAL_STATUS_UNCHANGED,
  LOCAL_STATUS_UPDATED,
} from "../constants/constants";
import { LocalStatus, UIBlock, UIExercise, UIWorkout } from "../types/ui";
import {
  createTempBlock,
  createTempExercise,
  createTempWorkout,
} from "../utils/workout-store-utils";

interface WorkoutStore {
  localWorkouts: UIWorkout[];

  workout: UIWorkout | null;
  block: UIBlock | null;

  loadWorkouts: (workouts: UIWorkout[]) => void;

  loadWorkout: (workout: UIWorkout) => void;
  startNewWorkout: () => void;
  setName: (name: string) => void;

  startNewBlock: (newBlockId: string) => UIBlock | undefined;
  loadBlock: (blockId: string) => void;
  updateBlock: (tempId: string | number, data: Partial<UIBlock>) => void;
  removeBlock: (tempId: string | number) => void;
  revertBlock: (blockId: string | number, originalBlock: UIBlock) => void;

  addExercise: (blockId: string | number) => void;
  updateExercise: (
    blockId: string | number,
    exerciseId: string | number,
    data: Partial<UIExercise>,
  ) => void;
  removeExercise: (
    blockId: string | number,
    exerciseId: string | number,
  ) => void;

  reset: () => void;
}

export const useWorkoutStore = create<WorkoutStore>((set, get) => ({
  localWorkouts: [],

  workout: null,
  block: null,

  loadWorkouts: (workouts) => set({ localWorkouts: workouts }),

  startNewWorkout: () => {
    const state = get();

    return set({
      workout: createTempWorkout(state.localWorkouts.length),
    });
  },

  loadWorkout: (workoutFromDb) => {
    if (!workoutFromDb) return set({ workout: null, block: null });
    set({
      workout: {
        ...workoutFromDb,
        blocks: (workoutFromDb.blocks || []).map((block) => ({
          ...block,
          localStatus: LOCAL_STATUS_UNCHANGED,
          exercises: (block.exercises || []).map((exercise) => ({
            ...exercise,
            localStatus: LOCAL_STATUS_UNCHANGED,
          })),
        })),
        localStatus: LOCAL_STATUS_UPDATED,
      },
    });
  },

  setName: (name) =>
    set((state) => ({
      workout: state.workout
        ? {
            ...state.workout,
            name,
          }
        : null,
    })),

  startNewBlock: (newBlockId) => {
    const state = get();

    // Ensure a workout exists before creating a block
    if (!state.workout) return;

    const newBlock = createTempBlock(
      newBlockId,
      state.workout.id,
      state.workout.blocks.length,
    );

    set((state) => ({
      block: newBlock,
      workout: state.workout
        ? {
            ...state.workout,
            blocks: [...state.workout.blocks, newBlock],
          }
        : null,
    }));

    return newBlock;
  },

  loadBlock: (blockId) => {
    set({ block: null });
    set((state) => {
      const idToFind = blockId?.toString();
      const block = state.workout?.blocks.find(
        (s) => s.id?.toString() === idToFind,
      );

      return { block: block || null };
    });
  },

  updateBlock: (id, data) =>
    set((state) => {
      if (!state.workout) return { workout: null, block: null };
      const idToFind = id?.toString();
      const updatedBlocks: UIBlock[] = state.workout.blocks.map((s) =>
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
      const updatedBlock =
        updatedBlocks.find((s) => s.id?.toString() === idToFind) || null;

      return {
        workout: { ...state.workout, blocks: updatedBlocks },
        block: updatedBlock,
      };
    }),

  revertBlock: (blockId, originalBlock) =>
    set((state) => {
      if (!state.workout) return { workout: null, block: null };
      const idToFind = blockId?.toString();
      const blocks = state.workout.blocks.map((b) =>
        b.id?.toString() === idToFind ? originalBlock : b,
      );
      return {
        workout: { ...state.workout, blocks },
        block: originalBlock as UIBlock,
      };
    }),

  removeBlock: (id) =>
    set((state) => {
      if (!state.workout) return { workout: null };
      const idToFind = id?.toString();

      const block = state.workout.blocks.find(
        (s) => s.id?.toString() === idToFind,
      );

      if (
        block?.localStatus === LOCAL_STATUS_NEW ||
        block?.id?.toString().startsWith("temp-")
      ) {
        const blocks = state.workout.blocks.filter(
          (s) => s.id?.toString() !== idToFind,
        );
        return { workout: { ...state.workout, blocks } };
      }

      const blocks = state.workout.blocks.map((block) =>
        block.id?.toString() === idToFind
          ? { ...block, localStatus: LOCAL_STATUS_DELETED as LocalStatus }
          : block,
      );

      return { workout: { ...state.workout, blocks } };
    }),

  addExercise: (blockId) =>
    set((state) => {
      if (!state.workout) return { workout: null };
      const tmpId = `tmp-ex-${nanoid()}`;
      const blockIdStr = blockId?.toString();

      const blocks = state.workout.blocks.map((block) => {
        if (block.id?.toString() !== blockIdStr) return block;

        const newExercise = createTempExercise(
          tmpId,
          blockId,
          block.exercises.length,
        );

        return {
          ...block,
          exercises: [...block.exercises, newExercise],
        };
      });

      const updatedBlock =
        blocks.find((s) => s.id?.toString() === blockIdStr) || null;

      return {
        workout: { ...state.workout, blocks },
        block: updatedBlock,
      };
    }),

  updateExercise: (blockId, exerciseId, data) =>
    set((state) => {
      if (!state.workout) return { workout: null, block: null };
      const blockIdStr = blockId?.toString();
      const exerciseIdStr = exerciseId?.toString();

      const blocks: UIBlock[] = state.workout.blocks.map((block) => {
        if (block.id?.toString() !== blockIdStr) return block;

        const updatedExercises: UIExercise[] = block.exercises.map(
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

        return { ...block, exercises: updatedExercises };
      });

      const updatedBlock =
        blocks.find((s) => s.id?.toString() === blockIdStr) || null;

      return {
        workout: { ...state.workout, blocks },
        block: updatedBlock,
      };
    }),

  removeExercise: (blockId, exerciseId) =>
    set((state) => {
      if (!state.workout) return { workout: null, block: null };
      const blockIdStr = blockId?.toString();
      const exerciseIdStr = exerciseId?.toString();

      const blocks: UIBlock[] = state.workout.blocks.map((block) => {
        if (block.id?.toString() !== blockIdStr) return block;

        const exercises: UIExercise[] = block.exercises.map((exercise) =>
          exercise.id?.toString() === exerciseIdStr
            ? { ...exercise, localStatus: LOCAL_STATUS_DELETED }
            : exercise,
        );

        return { ...block, exercises };
      });

      const updatedBlock =
        blocks.find((s) => s.id?.toString() === blockIdStr) || null;

      return {
        workout: { ...state.workout, blocks },
        block: updatedBlock,
      };
    }),

  reset: () => set({ workout: null, block: null }),
}));
