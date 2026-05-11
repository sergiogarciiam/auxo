import { describe, expect, it } from "vitest";
import { LOCAL_STATUS_UNCHANGED } from "../../constants/constants";
import { Block } from "../../types/block";
import { Exercise } from "../../types/exercise";
import { Workout } from "../../types/workout";
import {
  transformBlockToUI,
  transformExerciseToUI,
  transformWorkoutsToUI,
} from "../transformers";

describe("transformers", () => {
  // ============= transformExerciseToUI TESTS =============
  describe("transformExerciseToUI", () => {
    it("should transform exercise with all fields", () => {
      const exercise: Exercise = {
        id: 1,
        block_id: 1,
        name: "Bench Press",
        last_reps: 8,
        time_seconds: 45,
        weight: 80,
        sets: 3,
        position: 0,
      };

      const result = transformExerciseToUI(exercise);

      expect(result).toMatchObject({
        id: 1,
        block_id: 1,
        name: "Bench Press",
        last_reps: 8,
        exercise_time: 45,
        weight: 80,
        sets: 3,
        position: 0,
        localStatus: LOCAL_STATUS_UNCHANGED,
      });
    });

    it("should default null last_reps to 0", () => {
      const exercise: Exercise = {
        id: 1,
        block_id: 1,
        name: "Exercise",
        last_reps: undefined,
        time_seconds: 30,
        weight: 0,
        sets: 1,
        position: 0,
      };

      const result = transformExerciseToUI(exercise);
      expect(result.last_reps).toBe(0);
    });

    it("should default null time_seconds to 0", () => {
      const exercise: Exercise = {
        id: 1,
        block_id: 1,
        name: "Exercise",
        last_reps: 10,
        time_seconds: undefined,
        weight: 0,
        sets: 1,
        position: 0,
      };

      const result = transformExerciseToUI(exercise);
      expect(result.exercise_time).toBe(0);
    });

    it("should default null weight to 0", () => {
      const exercise: Exercise = {
        id: 1,
        block_id: 1,
        name: "Exercise",
        last_reps: 10,
        time_seconds: 0,
        weight: undefined,
        sets: 1,
        position: 0,
      };

      const result = transformExerciseToUI(exercise);
      expect(result.weight).toBe(0);
    });

    it("should default null sets to 0", () => {
      const exercise: Exercise = {
        id: 1,
        block_id: 1,
        name: "Exercise",
        last_reps: 10,
        time_seconds: 0,
        weight: 0,
        sets: undefined,
        position: 0,
      };

      const result = transformExerciseToUI(exercise);
      expect(result.sets).toBe(0);
    });

    it("should default all null fields to 0", () => {
      const exercise: Exercise = {
        id: 1,
        block_id: 1,
        name: "Minimal Exercise",
        last_reps: undefined,
        time_seconds: undefined,
        weight: undefined,
        sets: undefined,
        position: 5,
      };

      const result = transformExerciseToUI(exercise);

      expect(result).toMatchObject({
        id: 1,
        block_id: 1,
        name: "Minimal Exercise",
        last_reps: 0,
        exercise_time: 0,
        weight: 0,
        sets: 0,
        position: 5,
        localStatus: LOCAL_STATUS_UNCHANGED,
      });
    });

    it("should preserve 0 values (not treat as null)", () => {
      const exercise: Exercise = {
        id: 1,
        block_id: 1,
        name: "Exercise",
        last_reps: 0,
        time_seconds: 0,
        weight: 0,
        sets: 0,
        position: 0,
      };

      const result = transformExerciseToUI(exercise);

      expect(result.last_reps).toBe(0);
      expect(result.exercise_time).toBe(0);
      expect(result.weight).toBe(0);
      expect(result.sets).toBe(0);
    });

    it("should set localStatus to UNCHANGED", () => {
      const exercise: Exercise = {
        id: 1,
        block_id: 1,
        name: "Exercise",
        last_reps: 10,
        time_seconds: 0,
        weight: 0,
        sets: 3,
        position: 0,
      };

      const result = transformExerciseToUI(exercise);
      expect(result.localStatus).toBe(LOCAL_STATUS_UNCHANGED);
    });
  });

  // ============= transformBlockToUI TESTS =============
  describe("transformBlockToUI", () => {
    it("should transform block with exercises", () => {
      const block: Block = {
        id: 1,
        workout_id: 1,
        name: "Chest Day",
        type: "standard",
        prepare_time: 300,
        rest_group: 120,
        position: 0,
      };

      const exercises: Exercise[] = [
        {
          id: 1,
          block_id: 1,
          name: "Bench Press",
          last_reps: 8,
          time_seconds: 0,
          weight: 80,
          sets: 3,
          position: 0,
        },
        {
          id: 2,
          block_id: 1,
          name: "Incline Press",
          last_reps: 10,
          time_seconds: 0,
          weight: 60,
          sets: 3,
          position: 1,
        },
      ];

      const result = transformBlockToUI(block, exercises);

      expect(result.id).toBe(1);
      expect(result.workout_id).toBe(1);
      expect(result.name).toBe("Chest Day");
      expect(result.type).toBe("standard");
      expect(result.prepare_time).toBe(300);
      expect(result.rest_group).toBe(120);
      expect(result.position).toBe(0);
      expect(result.localStatus).toBe(LOCAL_STATUS_UNCHANGED);
      expect(result.exercises).toHaveLength(2);
      expect(result.exercises[0].name).toBe("Bench Press");
      expect(result.exercises[1].name).toBe("Incline Press");
    });

    it("should handle empty exercises array", () => {
      const block: Block = {
        id: 1,
        workout_id: 1,
        name: "Empty Block",
        type: "circuit",
        prepare_time: 0,
        rest_group: 0,
        position: 0,
      };

      const result = transformBlockToUI(block, []);

      expect(result.exercises).toEqual([]);
    });

    it("should default null prepare_time to 0", () => {
      const block: Block = {
        id: 1,
        workout_id: 1,
        name: "Block",
        type: "standard",
        prepare_time: null as any,
        rest_group: 0,
        position: 0,
      };

      const result = transformBlockToUI(block, []);
      expect(result.prepare_time).toBe(0);
    });

    it("should default null rest_group to 0", () => {
      const block: Block = {
        id: 1,
        workout_id: 1,
        name: "Block",
        type: "standard",
        prepare_time: 0,
        rest_group: null as any,
        position: 0,
      };

      const result = transformBlockToUI(block, []);
      expect(result.rest_group).toBe(0);
    });

    it("should transform exercises within block", () => {
      const block: Block = {
        id: 1,
        workout_id: 1,
        name: "Block",
        type: "standard",
        prepare_time: 0,
        rest_group: 0,
        position: 0,
      };

      const exercises: Exercise[] = [
        {
          id: 1,
          block_id: 1,
          name: "Exercise",
          last_reps: undefined,
          time_seconds: 45,
          weight: undefined,
          sets: 1,
          position: 0,
        },
      ];

      const result = transformBlockToUI(block, exercises);

      expect(result.exercises[0]).toMatchObject({
        id: 1,
        block_id: 1,
        name: "Exercise",
        last_reps: 0,
        exercise_time: 45,
        weight: 0,
        sets: 1,
        position: 0,
        localStatus: LOCAL_STATUS_UNCHANGED,
      });
    });

    it("should preserve block position", () => {
      const block: Block = {
        id: 1,
        workout_id: 1,
        name: "Block",
        type: "standard",
        prepare_time: 0,
        rest_group: 0,
        position: 5,
      };

      const result = transformBlockToUI(block, []);
      expect(result.position).toBe(5);
    });

    it("should handle different block types", () => {
      const baseBlock: Omit<Block, "type"> = {
        id: 1,
        workout_id: 1,
        name: "Block",
        prepare_time: 0,
        rest_group: 0,
        position: 0,
      };

      const types: Block["type"][] = ["standard", "circuit", "superset"];

      types.forEach((type) => {
        const block: Block = { ...baseBlock, type };
        const result = transformBlockToUI(block, []);
        expect(result.type).toBe(type);
      });
    });

    it("should set localStatus to UNCHANGED", () => {
      const block: Block = {
        id: 1,
        workout_id: 1,
        name: "Block",
        type: "standard",
        prepare_time: 0,
        rest_group: 0,
        position: 0,
      };

      const result = transformBlockToUI(block, []);
      expect(result.localStatus).toBe(LOCAL_STATUS_UNCHANGED);
    });
  });

  // ============= transformWorkoutsToUI TESTS =============
  describe("transformWorkoutsToUI", () => {
    it("should transform single workout", () => {
      const workouts: Workout[] = [
        {
          id: 1,
          name: "Full Body",
          position: 0,
        },
      ];

      const result = transformWorkoutsToUI(workouts);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 1,
        name: "Full Body",
        position: 0,
        blocks: [],
        localStatus: LOCAL_STATUS_UNCHANGED,
      });
    });

    it("should transform multiple workouts", () => {
      const workouts: Workout[] = [
        {
          id: 1,
          name: "Upper Body",
          position: 0,
        },
        {
          id: 2,
          name: "Lower Body",
          position: 1,
        },
        {
          id: 3,
          name: "Full Body",
          position: 2,
        },
      ];

      const result = transformWorkoutsToUI(workouts);

      expect(result).toHaveLength(3);
      expect(result[0].name).toBe("Upper Body");
      expect(result[1].name).toBe("Lower Body");
      expect(result[2].name).toBe("Full Body");
    });

    it("should handle empty workout array", () => {
      const result = transformWorkoutsToUI([]);
      expect(result).toEqual([]);
    });

    it("should initialize blocks as empty array", () => {
      const workouts: Workout[] = [
        {
          id: 1,
          name: "Workout",
          position: 0,
        },
      ];

      const result = transformWorkoutsToUI(workouts);
      expect(result[0].blocks).toEqual([]);
    });

    it("should preserve workout position", () => {
      const workouts: Workout[] = [
        {
          id: 1,
          name: "Workout 1",
          position: 5,
        },
        {
          id: 2,
          name: "Workout 2",
          position: 10,
        },
      ];

      const result = transformWorkoutsToUI(workouts);
      expect(result[0].position).toBe(5);
      expect(result[1].position).toBe(10);
    });

    it("should set localStatus to UNCHANGED for all workouts", () => {
      const workouts: Workout[] = [
        {
          id: 1,
          name: "Workout 1",
          position: 0,
        },
        {
          id: 2,
          name: "Workout 2",
          position: 1,
        },
      ];

      const result = transformWorkoutsToUI(workouts);
      result.forEach((workout) => {
        expect(workout.localStatus).toBe(LOCAL_STATUS_UNCHANGED);
      });
    });

    it("should preserve order of workouts", () => {
      const workouts: Workout[] = [
        { id: 3, name: "Third", position: 2 },
        { id: 1, name: "First", position: 0 },
        { id: 2, name: "Second", position: 1 },
      ];

      const result = transformWorkoutsToUI(workouts);
      expect(result[0].name).toBe("Third");
      expect(result[1].name).toBe("First");
      expect(result[2].name).toBe("Second");
    });
  });

  // ============= INTEGRATION TESTS =============
  describe("integration tests", () => {
    it("should handle full transformation pipeline", () => {
      const exercises: Exercise[] = [
        {
          id: 1,
          block_id: 1,
          name: "Bench Press",
          last_reps: 8,
          time_seconds: undefined,
          weight: 80,
          sets: 3,
          position: 0,
        },
      ];

      const block: Block = {
        id: 1,
        workout_id: 1,
        name: "Chest",
        type: "standard",
        prepare_time: 300,
        rest_group: 120,
        position: 0,
      };

      const uiBlock = transformBlockToUI(block, exercises);

      expect(uiBlock.name).toBe("Chest");
      expect(uiBlock.exercises).toHaveLength(1);
      expect(uiBlock.exercises[0].last_reps).toBe(8);
      expect(uiBlock.exercises[0].exercise_time).toBe(0); // defaulted
      expect(uiBlock.exercises[0].weight).toBe(80);
    });

    it("should transform workouts with proper structure", () => {
      const workouts: Workout[] = [
        { id: 1, name: "Program A", position: 0 },
        { id: 2, name: "Program B", position: 1 },
      ];

      const uiWorkouts = transformWorkoutsToUI(workouts);

      expect(uiWorkouts).toHaveLength(2);
      expect(uiWorkouts.every((w) => w.blocks instanceof Array)).toBe(true);
      expect(
        uiWorkouts.every((w) => w.localStatus === LOCAL_STATUS_UNCHANGED),
      ).toBe(true);
    });
  });
});
