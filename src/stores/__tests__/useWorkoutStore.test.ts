import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  LOCAL_STATUS_DELETED,
  LOCAL_STATUS_NEW,
  LOCAL_STATUS_UNCHANGED,
  LOCAL_STATUS_UPDATED,
} from "../../constants/constants";
import { UIBlock, UIExercise, UIWorkout } from "../../types/ui";
import { useWorkoutStore } from "../useWorkoutStore";

vi.mock("nanoid/non-secure", () => ({
  nanoid: () => "test-nanoid",
}));

const createMockWorkout = (overrides: Partial<UIWorkout> = {}): UIWorkout => ({
  id: "workout-1",
  name: "Test Workout",
  position: 0,
  blocks: [],
  localStatus: LOCAL_STATUS_NEW,
  ...overrides,
});

const createMockBlock = (overrides: Partial<UIBlock> = {}): UIBlock => ({
  id: "block-1",
  workout_id: "workout-1",
  name: "Test Block",
  type: "standard",
  prepare_time: 0,
  rest_group: 60,
  position: 0,
  localStatus: LOCAL_STATUS_UNCHANGED,
  exercises: [],
  ...overrides,
});

const createMockExercise = (
  overrides: Partial<UIExercise> = {},
): UIExercise => ({
  id: "ex-1",
  block_id: "block-1",
  name: "Exercise",
  last_reps: 10,
  min_reps: 8,
  max_reps: 12,
  exercise_time: 0,
  exercise_type: "reps",
  config_type: "simple",
  weight: 0,
  sets: 3,
  rest_time: 30,
  position: 0,
  localStatus: LOCAL_STATUS_UNCHANGED,
  ...overrides,
});

function getStore() {
  return useWorkoutStore.getState();
}

describe("useWorkoutStore", () => {
  beforeEach(() => {
    useWorkoutStore.getState().reset();
  });

  describe("initial state", () => {
    it("should start with empty localWorkouts", () => {
      expect(getStore().localWorkouts).toEqual([]);
    });

    it("should start with null workout", () => {
      expect(getStore().workout).toBeNull();
    });

    it("should start with null block", () => {
      expect(getStore().block).toBeNull();
    });
  });

  describe("loadWorkouts", () => {
    it("should set localWorkouts", () => {
      getStore().loadWorkouts([createMockWorkout()]);
      expect(getStore().localWorkouts).toHaveLength(1);
    });
  });

  describe("startNewWorkout", () => {
    it("should create a new workout with temp id", () => {
      getStore().startNewWorkout();
      const workout = getStore().workout;
      expect(workout).not.toBeNull();
      expect(workout!.name).toBe("");
      expect(workout!.blocks).toEqual([]);
      expect(workout!.localStatus).toBe(LOCAL_STATUS_NEW);
    });

    it("should set position based on localWorkouts length", () => {
      getStore().loadWorkouts([createMockWorkout(), createMockWorkout()]);
      getStore().startNewWorkout();
      expect(getStore().workout!.position).toBe(2);
    });
  });

  describe("loadWorkout", () => {
    it("should load a workout from DB with updated status", () => {
      const workout = createMockWorkout({
        id: 1,
        blocks: [
          createMockBlock({
            id: 1,
            exercises: [createMockExercise({ id: 1 })],
          }),
        ],
      });
      getStore().loadWorkout(workout);
      expect(getStore().workout).not.toBeNull();
      expect(getStore().workout!.localStatus).toBe(LOCAL_STATUS_UPDATED);
      expect(getStore().workout!.blocks[0].localStatus).toBe(
        LOCAL_STATUS_UNCHANGED,
      );
      expect(getStore().workout!.blocks[0].exercises[0].localStatus).toBe(
        LOCAL_STATUS_UNCHANGED,
      );
    });

    it("should set workout and block to null when null is passed", () => {
      getStore().startNewWorkout();
      getStore().loadWorkout(null as any);
      expect(getStore().workout).toBeNull();
      expect(getStore().block).toBeNull();
    });

    it("should handle workout without blocks", () => {
      getStore().loadWorkout(createMockWorkout({ blocks: [] }));
      expect(getStore().workout!.blocks).toEqual([]);
    });
  });

  describe("setName", () => {
    it("should update workout name", () => {
      getStore().startNewWorkout();
      getStore().setName("New Name");
      expect(getStore().workout!.name).toBe("New Name");
    });

    it("should do nothing when workout is null", () => {
      getStore().setName("New Name");
      expect(getStore().workout).toBeNull();
    });
  });

  describe("startNewBlock", () => {
    it("should add a block and set it as current block", () => {
      getStore().startNewWorkout();
      getStore().startNewBlock("new-block-1");
      expect(getStore().workout!.blocks).toHaveLength(1);
      expect(getStore().block).not.toBeNull();
      expect(getStore().block!.id).toBe("new-block-1");
      expect(getStore().block!.localStatus).toBe(LOCAL_STATUS_NEW);
    });

    it("should return the new block", () => {
      getStore().startNewWorkout();
      const result = getStore().startNewBlock("new-block-1");
      expect(result).not.toBeUndefined();
      expect(result!.id).toBe("new-block-1");
    });

    it("should return undefined if no workout exists", () => {
      const result = getStore().startNewBlock("new-block-1");
      expect(result).toBeUndefined();
    });

    it("should set correct position for multiple blocks", () => {
      getStore().startNewWorkout();
      getStore().startNewBlock("block-1");
      getStore().startNewBlock("block-2");
      expect(getStore().block!.position).toBe(1);
      expect(getStore().workout!.blocks[1].position).toBe(1);
    });
  });

  describe("loadBlock", () => {
    it("should load existing block by id", () => {
      getStore().startNewWorkout();
      getStore().startNewBlock("block-1");
      getStore().loadBlock("block-1");
      expect(getStore().block).not.toBeNull();
      expect(getStore().block!.id).toBe("block-1");
    });

    it("should set block to null when block not found", () => {
      getStore().loadBlock("nonexistent");
      expect(getStore().block).toBeNull();
    });

    it("should handle numeric ids", () => {
      getStore().loadWorkout(
        createMockWorkout({
          blocks: [createMockBlock({ id: 42 })],
        }),
      );
      getStore().loadBlock("42");
      expect(getStore().block).not.toBeNull();
      expect(getStore().block!.id).toBe(42);
    });
  });

  describe("updateBlock", () => {
    it("should update block data", () => {
      getStore().startNewWorkout();
      getStore().startNewBlock("block-1");
      getStore().updateBlock("block-1", { name: "Updated Block" });
      expect(getStore().block!.name).toBe("Updated Block");
      expect(getStore().workout!.blocks[0].name).toBe("Updated Block");
    });

    it("should keep LOCAL_STATUS_NEW for new blocks", () => {
      getStore().startNewWorkout();
      getStore().startNewBlock("block-1");
      getStore().updateBlock("block-1", { name: "Updated" });
      expect(getStore().block!.localStatus).toBe(LOCAL_STATUS_NEW);
    });

    it("should set LOCAL_STATUS_UPDATED for existing blocks", () => {
      getStore().loadWorkout(
        createMockWorkout({
          blocks: [createMockBlock({ id: 1 })],
        }),
      );
      getStore().updateBlock(1, { name: "Updated" });
      expect(getStore().block!.localStatus).toBe(LOCAL_STATUS_UPDATED);
    });

    it("should do nothing when workout is null", () => {
      getStore().updateBlock("block-1", { name: "Updated" });
      expect(getStore().workout).toBeNull();
      expect(getStore().block).toBeNull();
    });
  });

  describe("removeBlock", () => {
    it("should remove temp block from list", () => {
      getStore().startNewWorkout();
      getStore().startNewBlock("temp-block-1");
      getStore().removeBlock("temp-block-1");
      expect(getStore().workout!.blocks).toHaveLength(0);
    });

    it("should mark existing block as deleted", () => {
      getStore().loadWorkout(
        createMockWorkout({
          blocks: [createMockBlock({ id: 1 })],
        }),
      );
      getStore().removeBlock(1);
      expect(getStore().workout!.blocks[0].localStatus).toBe(
        LOCAL_STATUS_DELETED,
      );
    });

    it("should remove new block (not temp- prefix) as new", () => {
      getStore().startNewWorkout();
      getStore().startNewBlock("new-block-1");
      getStore().removeBlock("new-block-1");
      expect(getStore().workout!.blocks).toHaveLength(0);
    });

    it("should do nothing when workout is null", () => {
      getStore().removeBlock("block-1");
      expect(getStore().workout).toBeNull();
    });
  });

  describe("addExercise", () => {
    it("should add exercise to the specified block", () => {
      getStore().startNewWorkout();
      getStore().startNewBlock("block-1");
      getStore().addExercise("block-1");
      const block = getStore().block;
      expect(block).not.toBeNull();
      expect(block!.exercises).toHaveLength(1);
      expect(block!.exercises[0].name).toBe("");
      expect(block!.exercises[0].localStatus).toBe(LOCAL_STATUS_NEW);
    });

    it("should add exercise to correct block when multiple blocks exist", () => {
      getStore().startNewWorkout();
      getStore().startNewBlock("block-1");
      getStore().startNewBlock("block-2");
      getStore().addExercise("block-1");
      getStore().addExercise("block-2");
      getStore().addExercise("block-2");
      expect(getStore().workout!.blocks[0].exercises).toHaveLength(1);
      expect(getStore().workout!.blocks[1].exercises).toHaveLength(2);
    });

    it("should do nothing when workout is null", () => {
      getStore().addExercise("block-1");
      expect(getStore().workout).toBeNull();
    });
  });

  describe("updateExercise", () => {
    it("should update exercise data", () => {
      getStore().startNewWorkout();
      getStore().startNewBlock("block-1");
      getStore().addExercise("block-1");
      const exerciseId = getStore().block!.exercises[0].id;
      getStore().updateExercise("block-1", exerciseId, {
        name: "Push Ups",
        sets: 4,
      });
      const exercise = getStore().block!.exercises[0];
      expect(exercise.name).toBe("Push Ups");
      expect(exercise.sets).toBe(4);
    });

    it("should keep LOCAL_STATUS_NEW for new exercises", () => {
      getStore().startNewWorkout();
      getStore().startNewBlock("block-1");
      getStore().addExercise("block-1");
      const exerciseId = getStore().block!.exercises[0].id;
      getStore().updateExercise("block-1", exerciseId, { name: "Push Ups" });
      expect(getStore().block!.exercises[0].localStatus).toBe(LOCAL_STATUS_NEW);
    });

    it("should mark existing exercise as UPDATED", () => {
      const existingEx = createMockExercise({ id: 1 });
      getStore().loadWorkout(
        createMockWorkout({
          blocks: [createMockBlock({ id: 1, exercises: [existingEx] })],
        }),
      );
      getStore().updateExercise(1, 1, { name: "Updated Ex" });
      expect(getStore().workout!.blocks[0].exercises[0].localStatus).toBe(
        LOCAL_STATUS_UPDATED,
      );
    });

    it("should do nothing when workout is null", () => {
      getStore().updateExercise("block-1", "ex-1", { name: "Updated" });
      expect(getStore().workout).toBeNull();
      expect(getStore().block).toBeNull();
    });
  });

  describe("removeExercise", () => {
    it("should mark exercise as deleted", () => {
      const existingEx = createMockExercise({ id: 1 });
      getStore().loadWorkout(
        createMockWorkout({
          blocks: [createMockBlock({ id: 1, exercises: [existingEx] })],
        }),
      );
      getStore().removeExercise(1, 1);
      expect(getStore().workout!.blocks[0].exercises[0].localStatus).toBe(
        LOCAL_STATUS_DELETED,
      );
    });

    it("should do nothing when workout is null", () => {
      getStore().removeExercise("block-1", "ex-1");
      expect(getStore().workout).toBeNull();
      expect(getStore().block).toBeNull();
    });
  });

  describe("reset", () => {
    it("should clear workout and block", () => {
      getStore().startNewWorkout();
      getStore().startNewBlock("block-1");
      getStore().reset();
      expect(getStore().workout).toBeNull();
      expect(getStore().block).toBeNull();
    });
  });

  describe("integration: new workout workflow", () => {
    it("should handle full workout creation flow", () => {
      getStore().startNewWorkout();
      getStore().setName("Full Body");
      getStore().startNewBlock("block-1");
      getStore().updateBlock("block-1", { name: "Upper Body", type: "standard" });
      getStore().addExercise("block-1");
      const exId = getStore().block!.exercises[0].id;
      getStore().updateExercise("block-1", exId, {
        name: "Bench Press",
        sets: 3,
        min_reps: 8,
        last_reps: 10,
      });

      expect(getStore().workout!.name).toBe("Full Body");
      expect(getStore().workout!.blocks).toHaveLength(1);
      expect(getStore().workout!.blocks[0].name).toBe("Upper Body");
      expect(getStore().workout!.blocks[0].exercises).toHaveLength(1);
      expect(getStore().workout!.blocks[0].exercises[0].name).toBe(
        "Bench Press",
      );
    });

    it("should handle removing blocks and exercises", () => {
      getStore().loadWorkout(
        createMockWorkout({
          id: 1,
          blocks: [
            createMockBlock({
              id: 1,
              exercises: [
                createMockExercise({ id: 1 }),
                createMockExercise({ id: 2 }),
              ],
            }),
            createMockBlock({ id: 2 }),
          ],
        }),
      );

      getStore().removeExercise(1, 1);
      expect(getStore().workout!.blocks[0].exercises[0].localStatus).toBe(
        LOCAL_STATUS_DELETED,
      );

      getStore().removeBlock(2);
      expect(getStore().workout!.blocks[1].localStatus).toBe(
        LOCAL_STATUS_DELETED,
      );
    });
  });
});
