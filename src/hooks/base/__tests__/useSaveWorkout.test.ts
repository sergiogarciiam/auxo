import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  LOCAL_STATUS_DELETED,
  LOCAL_STATUS_NEW,
  LOCAL_STATUS_UNCHANGED,
  LOCAL_STATUS_UPDATED,
} from "../../../constants/constants";
import { UIBlock, UIExercise, UIWorkout } from "../../../types/ui";
import { useSaveWorkout } from "../useSaveWorkout";

const createMockWorkout = (overrides: Partial<UIWorkout> = {}): UIWorkout => ({
  id: "temp-1",
  name: "Test Workout",
  position: 0,
  blocks: [
    {
      id: "block-temp-1",
      workout_id: "temp-1",
      name: "Block 1",
      type: "standard",
      prepare_time: 0,
      rest_group: 60,
      position: 0,
      localStatus: LOCAL_STATUS_NEW,
      exercises: [
        {
          id: "ex-temp-1",
          block_id: "block-temp-1",
          name: "Bench Press",
          last_reps: 10,
          min_reps: 8,
          max_reps: 12,
          exercise_time: 0,
          exercise_type: "reps",
          config_type: "simple",
          weight: 80,
          sets: 3,
          rest_time: 30,
          position: 0,
          localStatus: LOCAL_STATUS_NEW,
        },
      ],
    },
  ],
  localStatus: LOCAL_STATUS_NEW,
  ...overrides,
});

const mockCreateWorkout = vi.fn().mockResolvedValue(1);
const mockUpdateWorkout = vi.fn().mockResolvedValue(undefined);
const mockCreateBlock = vi.fn().mockResolvedValue(1);
const mockUpdateBlock = vi.fn().mockResolvedValue(undefined);
const mockDeleteBlock = vi.fn().mockResolvedValue(undefined);
const mockCreateExercise = vi.fn().mockResolvedValue(undefined);
const mockUpdateExercise = vi.fn().mockResolvedValue(undefined);
const mockDeleteExercise = vi.fn().mockResolvedValue(undefined);

vi.mock("../useWorkouts", () => ({
  useWorkouts: () => ({
    createWorkout: mockCreateWorkout,
    updateWorkout: mockUpdateWorkout,
  }),
}));

vi.mock("../useBlocks", () => ({
  useBlocks: () => ({
    createBlock: mockCreateBlock,
    updateBlock: mockUpdateBlock,
    deleteBlock: mockDeleteBlock,
  }),
}));

vi.mock("../useExercises", () => ({
  useExercises: () => ({
    createExercise: mockCreateExercise,
    updateExercise: mockUpdateExercise,
    deleteExercise: mockDeleteExercise,
  }),
}));

describe("useSaveWorkout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("validation", () => {
    it("should throw when workout name is empty", async () => {
      const { result } = renderHook(() => useSaveWorkout());
      const workout = createMockWorkout({ name: "" });

      await expect(result.current.saveWorkout(workout)).rejects.toThrow(
        "Workout name is required",
      );
      expect(mockCreateWorkout).not.toHaveBeenCalled();
    });

    it("should throw when block name is empty", async () => {
      const { result } = renderHook(() => useSaveWorkout());
      const workout = createMockWorkout({
        blocks: [
          {
            ...createMockWorkout().blocks[0],
            name: "",
          },
        ],
      });

      await expect(result.current.saveWorkout(workout)).rejects.toThrow(
        "Block name is required",
      );
      expect(mockCreateWorkout).not.toHaveBeenCalled();
    });

    it("should throw when exercise name is empty", async () => {
      const { result } = renderHook(() => useSaveWorkout());
      const workout = createMockWorkout({
        blocks: [
          {
            ...createMockWorkout().blocks[0],
            exercises: [
              {
                ...createMockWorkout().blocks[0].exercises[0],
                name: "",
              },
            ],
          },
        ],
      });

      await expect(result.current.saveWorkout(workout)).rejects.toThrow(
        "Exercise name is required",
      );
      expect(mockCreateWorkout).not.toHaveBeenCalled();
    });

    it("should throw when exercise has no sets", async () => {
      const { result } = renderHook(() => useSaveWorkout());
      const workout = createMockWorkout({
        blocks: [
          {
            ...createMockWorkout().blocks[0],
            exercises: [
              {
                ...createMockWorkout().blocks[0].exercises[0],
                sets: null as any,
              },
            ],
          },
        ],
      });

      await expect(result.current.saveWorkout(workout)).rejects.toThrow(
        "Exercise sets is required",
      );
      expect(mockCreateWorkout).not.toHaveBeenCalled();
    });
  });

  describe("new workout", () => {
    it("should create workout, blocks, and exercises", async () => {
      const { result } = renderHook(() => useSaveWorkout());
      const workout = createMockWorkout();

      const id = await result.current.saveWorkout(workout);

      expect(id).toBe(1);
      expect(mockCreateWorkout).toHaveBeenCalledWith({
        name: "Test Workout",
        position: 0,
      });
      expect(mockCreateBlock).toHaveBeenCalledWith({
        workout_id: 1,
        name: "Block 1",
        type: "standard",
        rest_group: 60,
        position: 0,
      });
      expect(mockCreateExercise).toHaveBeenCalledWith(
        expect.objectContaining({
          block_id: 1,
          name: "Bench Press",
          sets: 3,
        }),
      );
    });

    it("should not call updateWorkout for new workout", async () => {
      const { result } = renderHook(() => useSaveWorkout());
      await result.current.saveWorkout(createMockWorkout());

      expect(mockUpdateWorkout).not.toHaveBeenCalled();
    });
  });

  describe("existing workout (UPDATED)", () => {
    it("should update workout, and create/update blocks and exercises", async () => {
      const { result } = renderHook(() => useSaveWorkout());
      const workout = createMockWorkout({
        id: 1,
        localStatus: LOCAL_STATUS_UPDATED,
        blocks: [
          {
            id: 1,
            workout_id: 1,
            name: "Block 1",
            type: "standard",
            prepare_time: 0,
            rest_group: 60,
            position: 0,
            localStatus: LOCAL_STATUS_UPDATED,
            exercises: [
              {
                id: 1,
                block_id: 1,
                name: "Updated Exercise",
                last_reps: 10,
                min_reps: 8,
                max_reps: 12,
                exercise_time: 0,
                exercise_type: "reps",
                config_type: "simple",
                weight: 80,
                sets: 4,
                rest_time: 30,
                position: 0,
                localStatus: LOCAL_STATUS_UPDATED,
              },
            ],
          },
        ],
      });

      await result.current.saveWorkout(workout);

      expect(mockUpdateWorkout).toHaveBeenCalledWith({
        id: 1,
        name: "Test Workout",
        position: 0,
      });
      expect(mockUpdateBlock).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          name: "Block 1",
        }),
      );
      expect(mockUpdateExercise).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          name: "Updated Exercise",
          sets: 4,
        }),
      );
    });

    it("should not call createWorkout for existing workout", async () => {
      const { result } = renderHook(() => useSaveWorkout());
      const workout = createMockWorkout({
        id: 1,
        localStatus: LOCAL_STATUS_UPDATED,
      });

      await result.current.saveWorkout(workout);

      expect(mockCreateWorkout).not.toHaveBeenCalled();
    });
  });

  describe("deleted items", () => {
    it("should delete blocks marked as deleted", async () => {
      const { result } = renderHook(() => useSaveWorkout());
      const workout = createMockWorkout({
        id: 1,
        localStatus: LOCAL_STATUS_UPDATED,
        blocks: [
          {
            id: 42,
            workout_id: 1,
            name: "Block to delete",
            type: "standard",
            prepare_time: 0,
            rest_group: 60,
            position: 0,
            localStatus: LOCAL_STATUS_DELETED,
            exercises: [],
          },
          {
            id: 2,
            workout_id: 1,
            name: "Valid Block",
            type: "standard",
            prepare_time: 0,
            rest_group: 60,
            position: 1,
            localStatus: LOCAL_STATUS_UNCHANGED,
            exercises: [
              {
                id: 1,
                block_id: 2,
                name: "Valid Exercise",
                last_reps: 10,
                min_reps: 8,
                max_reps: 12,
                exercise_time: 0,
                exercise_type: "reps",
                config_type: "simple",
                weight: 80,
                sets: 3,
                rest_time: 30,
                position: 0,
                localStatus: LOCAL_STATUS_UNCHANGED,
              },
            ],
          },
        ],
      });

      await result.current.saveWorkout(workout);

      expect(mockDeleteBlock).toHaveBeenCalledWith(42);
      expect(mockUpdateBlock).not.toHaveBeenCalledWith(
        expect.objectContaining({ id: 42 }),
      );
      expect(mockCreateBlock).not.toHaveBeenCalledWith(
        expect.objectContaining({ name: "Block to delete" }),
      );
    });

    it("should not delete blocks with string ids", async () => {
      const { result } = renderHook(() => useSaveWorkout());
      const workout = createMockWorkout({
        id: 1,
        localStatus: LOCAL_STATUS_UPDATED,
        blocks: [
          {
            id: "temp-42",
            workout_id: 1,
            name: "Block to delete",
            type: "standard",
            prepare_time: 0,
            rest_group: 60,
            position: 0,
            localStatus: LOCAL_STATUS_DELETED,
            exercises: [],
          },
          {
            id: 2,
            workout_id: 1,
            name: "Valid Block",
            type: "standard",
            prepare_time: 0,
            rest_group: 60,
            position: 1,
            localStatus: LOCAL_STATUS_UNCHANGED,
            exercises: [
              {
                id: 1,
                block_id: 2,
                name: "Valid Exercise",
                last_reps: 10,
                min_reps: 8,
                max_reps: 12,
                exercise_time: 0,
                exercise_type: "reps",
                config_type: "simple",
                weight: 80,
                sets: 3,
                rest_time: 30,
                position: 0,
                localStatus: LOCAL_STATUS_UNCHANGED,
              },
            ],
          },
        ],
      });

      await result.current.saveWorkout(workout);

      expect(mockDeleteBlock).not.toHaveBeenCalled();
    });

    it("should delete exercises marked as deleted", async () => {
      const { result } = renderHook(() => useSaveWorkout());
      const workout = createMockWorkout({
        id: 1,
        localStatus: LOCAL_STATUS_UPDATED,
        blocks: [
          {
            id: 1,
            workout_id: 1,
            name: "Block 1",
            type: "standard",
            prepare_time: 0,
            rest_group: 60,
            position: 0,
            localStatus: LOCAL_STATUS_UNCHANGED,
            exercises: [
              {
                id: 99,
                block_id: 1,
                name: "Exercise to delete",
                last_reps: 10,
                min_reps: 8,
                max_reps: 12,
                exercise_time: 0,
                exercise_type: "reps",
                config_type: "simple",
                weight: 80,
                sets: 3,
                rest_time: 30,
                position: 0,
                localStatus: LOCAL_STATUS_DELETED,
              },
              {
                id: 2,
                block_id: 1,
                name: "Valid Exercise",
                last_reps: 10,
                min_reps: 8,
                max_reps: 12,
                exercise_time: 0,
                exercise_type: "reps",
                config_type: "simple",
                weight: 80,
                sets: 3,
                rest_time: 30,
                position: 1,
                localStatus: LOCAL_STATUS_UNCHANGED,
              },
            ],
          },
        ],
      });

      await result.current.saveWorkout(workout);

      expect(mockDeleteExercise).toHaveBeenCalledWith(99);
      expect(mockCreateExercise).not.toHaveBeenCalledWith(
        expect.objectContaining({ name: "Exercise to delete" }),
      );
      expect(mockUpdateExercise).not.toHaveBeenCalledWith(
        expect.objectContaining({ id: 99 }),
      );
    });
  });

  describe("mixed status (new + updated + deleted)", () => {
    it("should handle a mix of new, updated, and deleted blocks and exercises", async () => {
      const { result } = renderHook(() => useSaveWorkout());
      const workout: UIWorkout = {
        id: 1,
        name: "Full Workout",
        position: 0,
        localStatus: LOCAL_STATUS_UPDATED,
        blocks: [
          {
            id: 1,
            workout_id: 1,
            name: "Existing Block",
            type: "standard",
            prepare_time: 0,
            rest_group: 60,
            position: 0,
            localStatus: LOCAL_STATUS_UPDATED,
            exercises: [
              {
                id: 1,
                block_id: 1,
                name: "Existing Exercise",
                last_reps: 10,
                min_reps: 8,
                max_reps: 12,
                exercise_time: 0,
                exercise_type: "reps",
                config_type: "simple",
                weight: 80,
                sets: 3,
                rest_time: 30,
                position: 0,
                localStatus: LOCAL_STATUS_UPDATED,
              },
              {
                id: 2,
                block_id: 1,
                name: "Deleted Exercise",
                last_reps: 10,
                min_reps: 8,
                max_reps: 12,
                exercise_time: 0,
                exercise_type: "reps",
                config_type: "simple",
                weight: 80,
                sets: 3,
                rest_time: 30,
                position: 1,
                localStatus: LOCAL_STATUS_DELETED,
              },
            ],
          },
          {
            id: "new-block-temp",
            workout_id: 1,
            name: "New Block",
            type: "circuit",
            prepare_time: 0,
            rest_group: 90,
            position: 1,
            localStatus: LOCAL_STATUS_NEW,
            exercises: [
              {
                id: "new-ex-temp",
                block_id: "new-block-temp",
                name: "New Exercise",
                last_reps: 0,
                min_reps: 0,
                max_reps: 0,
                exercise_time: 30,
                exercise_type: "time",
                config_type: "simple",
                weight: 0,
                sets: 1,
                rest_time: 0,
                position: 0,
                localStatus: LOCAL_STATUS_NEW,
              },
            ],
          },
        ],
      };

      await result.current.saveWorkout(workout);

      expect(mockUpdateBlock).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1 }),
      );
      expect(mockCreateBlock).toHaveBeenCalledWith(
        expect.objectContaining({ name: "New Block" }),
      );
      expect(mockUpdateExercise).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1 }),
      );
      expect(mockDeleteExercise).toHaveBeenCalledWith(2);
      expect(mockCreateExercise).toHaveBeenCalledWith(
        expect.objectContaining({ name: "New Exercise" }),
      );
    });
  });

  describe("error handling", () => {
    it("should propagate errors from createWorkout", async () => {
      mockCreateWorkout.mockRejectedValueOnce(new Error("DB error"));

      const { result } = renderHook(() => useSaveWorkout());
      const workout = createMockWorkout();

      await expect(result.current.saveWorkout(workout)).rejects.toThrow(
        "DB error",
      );
    });

    it("should propagate errors from createBlock", async () => {
      mockCreateBlock.mockRejectedValueOnce(new Error("Block error"));

      const { result } = renderHook(() => useSaveWorkout());

      await expect(
        result.current.saveWorkout(createMockWorkout()),
      ).rejects.toThrow("Block error");
    });

    it("should propagate errors from createExercise", async () => {
      mockCreateExercise.mockRejectedValueOnce(new Error("Exercise error"));

      const { result } = renderHook(() => useSaveWorkout());

      await expect(
        result.current.saveWorkout(createMockWorkout()),
      ).rejects.toThrow("Exercise error");
    });
  });

  describe("workflow: no blocks case", () => {
    it("should save a workout without blocks", async () => {
      const { result } = renderHook(() => useSaveWorkout());
      const workout = createMockWorkout({ blocks: [] });

      await expect(result.current.saveWorkout(workout)).rejects.toThrow(
        "Workout requiere at least one block",
      );
      expect(mockCreateWorkout).not.toHaveBeenCalled();
    });
  });
});
