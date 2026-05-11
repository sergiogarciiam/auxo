import { describe, expect, it, vi } from "vitest";
import { LOCAL_STATUS_NEW } from "../../constants/constants";
import {
  createTempBlock,
  createTempExercise,
  createTempWorkout,
} from "../workout-store-utils";

vi.mock("nanoid/non-secure", () => ({
  nanoid: () => "test-nanoid",
}));

describe("workout-store-utils", () => {
  describe("createTempWorkout", () => {
    it("should create a new workout with temp id", () => {
      const result = createTempWorkout(0);
      expect(result.id).toBe("temp-test-nanoid");
      expect(result.name).toBe("");
      expect(result.blocks).toEqual([]);
      expect(result.position).toBe(0);
      expect(result.localStatus).toBe(LOCAL_STATUS_NEW);
    });

    it("should set the given position", () => {
      const result = createTempWorkout(5);
      expect(result.position).toBe(5);
    });
  });

  describe("createTempBlock", () => {
    it("should create a new block with given id and workout_id", () => {
      const result = createTempBlock("my-block", "workout-1", 0);
      expect(result.id).toBe("my-block");
      expect(result.workout_id).toBe("workout-1");
      expect(result.name).toBe("");
      expect(result.type).toBe("");
      expect(result.exercises).toEqual([]);
      expect(result.position).toBe(0);
      expect(result.rest_group).toBe(0);
      expect(result.prepare_time).toBe(0);
      expect(result.localStatus).toBe(LOCAL_STATUS_NEW);
    });

    it("should set position correctly", () => {
      const result = createTempBlock("b1", "w1", 2);
      expect(result.position).toBe(2);
    });
  });

  describe("createTempExercise", () => {
    it("should create a new exercise with given ids", () => {
      const result = createTempExercise("tmp-ex-1", "block-1", 0);
      expect(result.id).toBe("tmp-ex-1");
      expect(result.block_id).toBe("block-1");
      expect(result.name).toBe("");
      expect(result.last_reps).toBe(0);
      expect(result.min_reps).toBe(0);
      expect(result.max_reps).toBe(0);
      expect(result.exercise_time).toBe(0);
      expect(result.exercise_type).toBe("reps");
      expect(result.config_type).toBe("simple");
      expect(result.rest_time).toBe(0);
      expect(result.position).toBe(0);
      expect(result.weight).toBe(0);
      expect(result.sets).toBe(1);
      expect(result.localStatus).toBe(LOCAL_STATUS_NEW);
    });

    it("should set position correctly", () => {
      const result = createTempExercise("tmp-ex-1", "block-1", 3);
      expect(result.position).toBe(3);
    });
  });
});
