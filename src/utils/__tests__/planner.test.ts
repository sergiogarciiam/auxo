import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  EXERCISE_STEP_TYPE,
  LOCAL_STATUS_DELETED,
  LOCAL_STATUS_UNCHANGED,
  REST_STEP_TYPE,
} from "../../constants/constants";
import { UIWorkout } from "../../types/ui";
import { buildExecutionPlan } from "../planner";

vi.mock("nanoid/non-secure", () => ({
  nanoid: () => Math.random().toString(36).substr(2, 9),
}));

describe("buildExecutionPlan", () => {
  let mockWorkout: UIWorkout;

  beforeEach(() => {
    mockWorkout = {
      id: "workout-1",
      name: "Test Workout",
      position: 0,
      blocks: [],
      localStatus: LOCAL_STATUS_UNCHANGED,
    };
  });

  // ============= BASIC TESTS =============
  describe("empty workout", () => {
    it("should return empty plan for workout with no blocks", () => {
      const plan = buildExecutionPlan(mockWorkout);
      expect(plan).toEqual([]);
    });

    it("should ignore blocks with LOCAL_STATUS_DELETED", () => {
      mockWorkout.blocks = [
        {
          id: "block-1",
          workout_id: "workout-1",
          name: "Deleted Block",
          type: "standard",
          prepare_time: 0,
          rest_exercise: 30,
          rest_group: 60,
          position: 0,
          localStatus: LOCAL_STATUS_DELETED,
          exercises: [],
        },
      ];

      const plan = buildExecutionPlan(mockWorkout);
      expect(plan).toEqual([]);
    });

    it("should ignore exercises with LOCAL_STATUS_DELETED", () => {
      mockWorkout.blocks = [
        {
          id: "block-1",
          workout_id: "workout-1",
          name: "Block 1",
          type: "standard",
          prepare_time: 0,
          rest_exercise: 30,
          rest_group: 60,
          position: 0,
          localStatus: LOCAL_STATUS_UNCHANGED,
          exercises: [
            {
              id: "ex-1",
              block_id: "block-1",
              name: "Deleted Exercise",
              reps: 10,
              time_seconds: 0,
              weight: 0,
              sets: 3,
              position: 0,
              localStatus: LOCAL_STATUS_DELETED,
            },
          ],
        },
      ];

      const plan = buildExecutionPlan(mockWorkout);
      expect(plan).toEqual([]);
    });

    it("should skip blocks with empty exercises", () => {
      mockWorkout.blocks = [
        {
          id: "block-1",
          workout_id: "workout-1",
          name: "Empty Block",
          type: "standard",
          prepare_time: 0,
          rest_exercise: 30,
          rest_group: 60,
          position: 0,
          localStatus: LOCAL_STATUS_UNCHANGED,
          exercises: [],
        },
      ];

      const plan = buildExecutionPlan(mockWorkout);
      expect(plan).toEqual([]);
    });
  });

  // ============= PREPARE TIME TESTS =============
  describe("prepare time", () => {
    it("should add prepare step at beginning of block", () => {
      mockWorkout.blocks = [
        {
          id: "block-1",
          workout_id: "workout-1",
          name: "Prep Block",
          type: "standard",
          prepare_time: 60,
          rest_exercise: 0,
          rest_group: 0,
          position: 0,
          localStatus: LOCAL_STATUS_UNCHANGED,
          exercises: [
            {
              id: "ex-1",
              block_id: "block-1",
              name: "Exercise 1",
              reps: 10,
              time_seconds: 0,
              weight: 0,
              sets: 1,
              position: 0,
              localStatus: LOCAL_STATUS_UNCHANGED,
            },
          ],
        },
      ];

      const plan = buildExecutionPlan(mockWorkout);
      expect(plan[0]).toMatchObject({
        type: REST_STEP_TYPE,
        name: "Prepare for Prep Block",
        duration_seconds: 60,
        blockId: "block-1",
      });
    });

    it("should not add prepare step when prepare_time is 0", () => {
      mockWorkout.blocks = [
        {
          id: "block-1",
          workout_id: "workout-1",
          name: "No Prep Block",
          type: "standard",
          prepare_time: 0,
          rest_exercise: 0,
          rest_group: 0,
          position: 0,
          localStatus: LOCAL_STATUS_UNCHANGED,
          exercises: [
            {
              id: "ex-1",
              block_id: "block-1",
              name: "Exercise 1",
              reps: 10,
              time_seconds: 0,
              weight: 0,
              sets: 1,
              position: 0,
              localStatus: LOCAL_STATUS_UNCHANGED,
            },
          ],
        },
      ];

      const plan = buildExecutionPlan(mockWorkout);
      expect(plan[0]).toMatchObject({
        type: EXERCISE_STEP_TYPE,
        name: "Exercise 1",
      });
    });
  });

  // ============= STANDARD BLOCK TESTS =============
  describe("standard block type", () => {
    it("should create plan for single exercise with multiple sets", () => {
      mockWorkout.blocks = [
        {
          id: "block-1",
          workout_id: "workout-1",
          name: "Standard Block",
          type: "standard",
          prepare_time: 0,
          rest_exercise: 30,
          rest_group: 60,
          position: 0,
          localStatus: LOCAL_STATUS_UNCHANGED,
          exercises: [
            {
              id: "ex-1",
              block_id: "block-1",
              name: "Bench Press",
              reps: 8,
              time_seconds: 0,
              weight: 80,
              sets: 3,
              position: 0,
              localStatus: LOCAL_STATUS_UNCHANGED,
            },
          ],
        },
      ];

      const plan = buildExecutionPlan(mockWorkout);
      const exerciseSteps = plan.filter((s) => s.type === EXERCISE_STEP_TYPE);
      const restSteps = plan.filter((s) => s.type === REST_STEP_TYPE);

      expect(exerciseSteps).toHaveLength(3);
      expect(restSteps).toHaveLength(2); // rest between 3 sets = 2 rests
      exerciseSteps.forEach((step, idx) => {
        expect(step).toMatchObject({
          name: "Bench Press",
          set: idx + 1,
          reps: 8,
          weight: 80,
        });
      });
    });

    it("should add rest between exercises", () => {
      mockWorkout.blocks = [
        {
          id: "block-1",
          workout_id: "workout-1",
          name: "Multi Exercise",
          type: "standard",
          prepare_time: 0,
          rest_exercise: 30,
          rest_group: 90,
          position: 0,
          localStatus: LOCAL_STATUS_UNCHANGED,
          exercises: [
            {
              id: "ex-1",
              block_id: "block-1",
              name: "Exercise 1",
              reps: 10,
              time_seconds: 0,
              weight: 0,
              sets: 1,
              position: 0,
              localStatus: LOCAL_STATUS_UNCHANGED,
            },
            {
              id: "ex-2",
              block_id: "block-1",
              name: "Exercise 2",
              reps: 10,
              time_seconds: 0,
              weight: 0,
              sets: 1,
              position: 1,
              localStatus: LOCAL_STATUS_UNCHANGED,
            },
          ],
        },
      ];

      const plan = buildExecutionPlan(mockWorkout);
      expect(plan).toEqual([
        expect.objectContaining({
          type: EXERCISE_STEP_TYPE,
          name: "Exercise 1",
        }),
        expect.objectContaining({ type: REST_STEP_TYPE, duration_seconds: 30 }),
        expect.objectContaining({
          type: EXERCISE_STEP_TYPE,
          name: "Exercise 2",
        }),
      ]);
    });

    it("should respect block position ordering", () => {
      mockWorkout.blocks = [
        {
          id: "block-2",
          workout_id: "workout-1",
          name: "Second Block",
          type: "standard",
          prepare_time: 0,
          rest_exercise: 0,
          rest_group: 0,
          position: 1,
          localStatus: LOCAL_STATUS_UNCHANGED,
          exercises: [
            {
              id: "ex-2",
              block_id: "block-2",
              name: "Exercise 2",
              reps: 10,
              time_seconds: 0,
              weight: 0,
              sets: 1,
              position: 0,
              localStatus: LOCAL_STATUS_UNCHANGED,
            },
          ],
        },
        {
          id: "block-1",
          workout_id: "workout-1",
          name: "First Block",
          type: "standard",
          prepare_time: 0,
          rest_exercise: 0,
          rest_group: 0,
          position: 0,
          localStatus: LOCAL_STATUS_UNCHANGED,
          exercises: [
            {
              id: "ex-1",
              block_id: "block-1",
              name: "Exercise 1",
              reps: 10,
              time_seconds: 0,
              weight: 0,
              sets: 1,
              position: 0,
              localStatus: LOCAL_STATUS_UNCHANGED,
            },
          ],
        },
      ];

      const plan = buildExecutionPlan(mockWorkout);
      const names = plan.map((s) => s.name);
      expect(names).toEqual(["Exercise 1", "Exercise 2"]);
    });
  });

  // ============= CIRCUIT BLOCK TESTS =============
  describe("circuit block type", () => {
    it("should create full rounds for all exercises", () => {
      mockWorkout.blocks = [
        {
          id: "block-1",
          workout_id: "workout-1",
          name: "Circuit",
          type: "circuit",
          prepare_time: 0,
          rest_exercise: 20,
          rest_group: 60,
          position: 0,
          localStatus: LOCAL_STATUS_UNCHANGED,
          exercises: [
            {
              id: "ex-1",
              block_id: "block-1",
              name: "Push-ups",
              reps: 10,
              time_seconds: 0,
              weight: 0,
              sets: 2,
              position: 0,
              localStatus: LOCAL_STATUS_UNCHANGED,
            },
            {
              id: "ex-2",
              block_id: "block-1",
              name: "Squats",
              reps: 10,
              time_seconds: 0,
              weight: 0,
              sets: 2,
              position: 1,
              localStatus: LOCAL_STATUS_UNCHANGED,
            },
          ],
        },
      ];

      const plan = buildExecutionPlan(mockWorkout);
      const exerciseSteps = plan.filter((s) => s.type === EXERCISE_STEP_TYPE);

      expect(exerciseSteps).toHaveLength(4); // 2 exercises × 2 sets
      // Round 1
      expect(exerciseSteps[0]).toMatchObject({ name: "Push-ups", set: 1 });
      expect(exerciseSteps[1]).toMatchObject({ name: "Squats", set: 1 });
      // Round 2
      expect(exerciseSteps[2]).toMatchObject({ name: "Push-ups", set: 2 });
      expect(exerciseSteps[3]).toMatchObject({ name: "Squats", set: 2 });
    });

    it("should respect exercise position in circuit", () => {
      mockWorkout.blocks = [
        {
          id: "block-1",
          workout_id: "workout-1",
          name: "Circuit",
          type: "circuit",
          prepare_time: 0,
          rest_exercise: 20,
          rest_group: 0,
          position: 0,
          localStatus: LOCAL_STATUS_UNCHANGED,
          exercises: [
            {
              id: "ex-3",
              block_id: "block-1",
              name: "Third",
              reps: 10,
              time_seconds: 0,
              weight: 0,
              sets: 1,
              position: 2,
              localStatus: LOCAL_STATUS_UNCHANGED,
            },
            {
              id: "ex-1",
              block_id: "block-1",
              name: "First",
              reps: 10,
              time_seconds: 0,
              weight: 0,
              sets: 1,
              position: 0,
              localStatus: LOCAL_STATUS_UNCHANGED,
            },
            {
              id: "ex-2",
              block_id: "block-1",
              name: "Second",
              reps: 10,
              time_seconds: 0,
              weight: 0,
              sets: 1,
              position: 1,
              localStatus: LOCAL_STATUS_UNCHANGED,
            },
          ],
        },
      ];

      const plan = buildExecutionPlan(mockWorkout);
      const names = plan
        .filter((s) => s.type === EXERCISE_STEP_TYPE)
        .map((s) => s.name);
      expect(names).toEqual(["First", "Second", "Third"]);
    });

    it("should add rest between exercises in circuit", () => {
      mockWorkout.blocks = [
        {
          id: "block-1",
          workout_id: "workout-1",
          name: "Circuit",
          type: "circuit",
          prepare_time: 0,
          rest_exercise: 15,
          rest_group: 0,
          position: 0,
          localStatus: LOCAL_STATUS_UNCHANGED,
          exercises: [
            {
              id: "ex-1",
              block_id: "block-1",
              name: "Ex 1",
              reps: 10,
              time_seconds: 0,
              weight: 0,
              sets: 1,
              position: 0,
              localStatus: LOCAL_STATUS_UNCHANGED,
            },
            {
              id: "ex-2",
              block_id: "block-1",
              name: "Ex 2",
              reps: 10,
              time_seconds: 0,
              weight: 0,
              sets: 1,
              position: 1,
              localStatus: LOCAL_STATUS_UNCHANGED,
            },
          ],
        },
      ];

      const plan = buildExecutionPlan(mockWorkout);
      expect(plan).toEqual([
        expect.objectContaining({ type: EXERCISE_STEP_TYPE, name: "Ex 1" }),
        expect.objectContaining({ type: REST_STEP_TYPE, duration_seconds: 15 }),
        expect.objectContaining({ type: EXERCISE_STEP_TYPE, name: "Ex 2" }),
      ]);
    });

    it("should add round rest between circuit rounds", () => {
      mockWorkout.blocks = [
        {
          id: "block-1",
          workout_id: "workout-1",
          name: "Circuit",
          type: "circuit",
          prepare_time: 0,
          rest_exercise: 0,
          rest_group: 90,
          position: 0,
          localStatus: LOCAL_STATUS_UNCHANGED,
          exercises: [
            {
              id: "ex-1",
              block_id: "block-1",
              name: "Ex 1",
              reps: 10,
              time_seconds: 0,
              weight: 0,
              sets: 2,
              position: 0,
              localStatus: LOCAL_STATUS_UNCHANGED,
            },
          ],
        },
      ];

      const plan = buildExecutionPlan(mockWorkout);
      const restSteps = plan.filter((s) => s.type === REST_STEP_TYPE);
      expect(restSteps).toHaveLength(1);
      expect(restSteps[0]).toMatchObject({
        name: "Round Rest",
        duration_seconds: 90,
      });
    });

    it("should handle exercises with different set counts", () => {
      mockWorkout.blocks = [
        {
          id: "block-1",
          workout_id: "workout-1",
          name: "Circuit",
          type: "circuit",
          prepare_time: 0,
          rest_exercise: 0,
          rest_group: 0,
          position: 0,
          localStatus: LOCAL_STATUS_UNCHANGED,
          exercises: [
            {
              id: "ex-1",
              block_id: "block-1",
              name: "Ex 1",
              reps: 10,
              time_seconds: 0,
              weight: 0,
              sets: 3,
              position: 0,
              localStatus: LOCAL_STATUS_UNCHANGED,
            },
            {
              id: "ex-2",
              block_id: "block-1",
              name: "Ex 2",
              reps: 10,
              time_seconds: 0,
              weight: 0,
              sets: 1,
              position: 1,
              localStatus: LOCAL_STATUS_UNCHANGED,
            },
          ],
        },
      ];

      const plan = buildExecutionPlan(mockWorkout);
      const exerciseSteps = plan.filter((s) => s.type === EXERCISE_STEP_TYPE);

      // Round 1: Ex1 set1, Ex2 set1
      // Round 2: Ex1 set2 (Ex2 not included as sets=1)
      // Round 3: Ex1 set3 (Ex2 not included as sets=1)
      expect(exerciseSteps).toHaveLength(4);
      expect(exerciseSteps[0]).toMatchObject({ name: "Ex 1", set: 1 });
      expect(exerciseSteps[1]).toMatchObject({ name: "Ex 2", set: 1 });
      expect(exerciseSteps[2]).toMatchObject({ name: "Ex 1", set: 2 });
      expect(exerciseSteps[3]).toMatchObject({ name: "Ex 1", set: 3 });
    });
  });

  // ============= SUPERSET BLOCK TESTS =============
  describe("superset block type", () => {
    it("should alternate between exercises in superset", () => {
      mockWorkout.blocks = [
        {
          id: "block-1",
          workout_id: "workout-1",
          name: "Superset",
          type: "superset",
          prepare_time: 0,
          rest_exercise: 30,
          rest_group: 60,
          position: 0,
          localStatus: LOCAL_STATUS_UNCHANGED,
          exercises: [
            {
              id: "ex-1",
              block_id: "block-1",
              name: "Bicep Curls",
              reps: 10,
              time_seconds: 0,
              weight: 15,
              sets: 2,
              position: 0,
              localStatus: LOCAL_STATUS_UNCHANGED,
            },
            {
              id: "ex-2",
              block_id: "block-1",
              name: "Tricep Dips",
              reps: 10,
              time_seconds: 0,
              weight: 0,
              sets: 2,
              position: 1,
              localStatus: LOCAL_STATUS_UNCHANGED,
            },
          ],
        },
      ];

      const plan = buildExecutionPlan(mockWorkout);
      const exerciseSteps = plan.filter((s) => s.type === EXERCISE_STEP_TYPE);

      expect(exerciseSteps[0].name).toBe("Bicep Curls");
      expect(exerciseSteps[1].name).toBe("Tricep Dips");
      expect(exerciseSteps[2].name).toBe("Bicep Curls");
      expect(exerciseSteps[3].name).toBe("Tricep Dips");
    });

    it("should track sets correctly in superset", () => {
      mockWorkout.blocks = [
        {
          id: "block-1",
          workout_id: "workout-1",
          name: "Superset",
          type: "superset",
          prepare_time: 0,
          rest_exercise: 30,
          rest_group: 60,
          position: 0,
          localStatus: LOCAL_STATUS_UNCHANGED,
          exercises: [
            {
              id: "ex-1",
              block_id: "block-1",
              name: "Ex 1",
              reps: 10,
              time_seconds: 0,
              weight: 0,
              sets: 2,
              position: 0,
              localStatus: LOCAL_STATUS_UNCHANGED,
            },
            {
              id: "ex-2",
              block_id: "block-1",
              name: "Ex 2",
              reps: 10,
              time_seconds: 0,
              weight: 0,
              sets: 2,
              position: 1,
              localStatus: LOCAL_STATUS_UNCHANGED,
            },
          ],
        },
      ];

      const plan = buildExecutionPlan(mockWorkout);
      const exerciseSteps = plan.filter((s) => s.type === EXERCISE_STEP_TYPE);

      expect(exerciseSteps[0]).toMatchObject({ name: "Ex 1", set: 1 });
      expect(exerciseSteps[1]).toMatchObject({ name: "Ex 2", set: 1 });
      expect(exerciseSteps[2]).toMatchObject({ name: "Ex 1", set: 2 });
      expect(exerciseSteps[3]).toMatchObject({ name: "Ex 2", set: 2 });
    });

    it("should distinguish rest types in superset", () => {
      mockWorkout.blocks = [
        {
          id: "block-1",
          workout_id: "workout-1",
          name: "Superset",
          type: "superset",
          prepare_time: 0,
          rest_exercise: 30,
          rest_group: 90,
          position: 0,
          localStatus: LOCAL_STATUS_UNCHANGED,
          exercises: [
            {
              id: "ex-1",
              block_id: "block-1",
              name: "Ex 1",
              reps: 10,
              time_seconds: 0,
              weight: 0,
              sets: 1,
              position: 0,
              localStatus: LOCAL_STATUS_UNCHANGED,
            },
            {
              id: "ex-2",
              block_id: "block-1",
              name: "Ex 2",
              reps: 10,
              time_seconds: 0,
              weight: 0,
              sets: 1,
              position: 1,
              localStatus: LOCAL_STATUS_UNCHANGED,
            },
          ],
        },
      ];

      const plan = buildExecutionPlan(mockWorkout);
      const restSteps = plan.filter((s) => s.type === REST_STEP_TYPE);

      expect(restSteps).toHaveLength(2);
      expect(restSteps[0]).toMatchObject({ duration_seconds: 30 }); // Rest after Ex 1
      expect(restSteps[1]).toMatchObject({ duration_seconds: 90 }); // Group Rest
    });

    it("should handle superset with unequal sets", () => {
      mockWorkout.blocks = [
        {
          id: "block-1",
          workout_id: "workout-1",
          name: "Superset",
          type: "superset",
          prepare_time: 0,
          rest_exercise: 30,
          rest_group: 60,
          position: 0,
          localStatus: LOCAL_STATUS_UNCHANGED,
          exercises: [
            {
              id: "ex-1",
              block_id: "block-1",
              name: "Ex 1",
              reps: 10,
              time_seconds: 0,
              weight: 0,
              sets: 3,
              position: 0,
              localStatus: LOCAL_STATUS_UNCHANGED,
            },
            {
              id: "ex-2",
              block_id: "block-1",
              name: "Ex 2",
              reps: 10,
              time_seconds: 0,
              weight: 0,
              sets: 2,
              position: 1,
              localStatus: LOCAL_STATUS_UNCHANGED,
            },
          ],
        },
      ];

      const plan = buildExecutionPlan(mockWorkout);
      const exerciseSteps = plan.filter((s) => s.type === EXERCISE_STEP_TYPE);

      // Should complete all 3 sets of Ex 1
      const ex1Steps = exerciseSteps.filter((s) => s.name === "Ex 1");
      const ex2Steps = exerciseSteps.filter((s) => s.name === "Ex 2");

      expect(ex1Steps).toHaveLength(3);
      expect(ex2Steps).toHaveLength(2);
    });

    it("should handle single exercise in superset", () => {
      mockWorkout.blocks = [
        {
          id: "block-1",
          workout_id: "workout-1",
          name: "Superset Single",
          type: "superset",
          prepare_time: 0,
          rest_exercise: 30,
          rest_group: 60,
          position: 0,
          localStatus: LOCAL_STATUS_UNCHANGED,
          exercises: [
            {
              id: "ex-1",
              block_id: "block-1",
              name: "Solo Exercise",
              reps: 10,
              time_seconds: 0,
              weight: 0,
              sets: 2,
              position: 0,
              localStatus: LOCAL_STATUS_UNCHANGED,
            },
          ],
        },
      ];

      const plan = buildExecutionPlan(mockWorkout);
      const exerciseSteps = plan.filter((s) => s.type === EXERCISE_STEP_TYPE);

      expect(exerciseSteps).toHaveLength(2);
      expect(exerciseSteps[0]).toMatchObject({ name: "Solo Exercise", set: 1 });
      expect(exerciseSteps[1]).toMatchObject({ name: "Solo Exercise", set: 2 });
    });
  });

  // ============= PROPERTIES TESTS =============
  describe("step properties", () => {
    it("should have unique IDs for all steps", () => {
      mockWorkout.blocks = [
        {
          id: "block-1",
          workout_id: "workout-1",
          name: "Block",
          type: "standard",
          prepare_time: 0,
          rest_exercise: 30,
          rest_group: 0,
          position: 0,
          localStatus: LOCAL_STATUS_UNCHANGED,
          exercises: [
            {
              id: "ex-1",
              block_id: "block-1",
              name: "Ex 1",
              reps: 10,
              time_seconds: 0,
              weight: 0,
              sets: 2,
              position: 0,
              localStatus: LOCAL_STATUS_UNCHANGED,
            },
          ],
        },
      ];

      const plan = buildExecutionPlan(mockWorkout);
      const ids = plan.map((s) => s.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should preserve block and exercise IDs in steps", () => {
      mockWorkout.blocks = [
        {
          id: "my-block-id",
          workout_id: "workout-1",
          name: "Block",
          type: "standard",
          prepare_time: 0,
          rest_exercise: 0,
          rest_group: 0,
          position: 0,
          localStatus: LOCAL_STATUS_UNCHANGED,
          exercises: [
            {
              id: "my-exercise-id",
              block_id: "my-block-id",
              name: "Exercise",
              reps: 10,
              time_seconds: 0,
              weight: 0,
              sets: 1,
              position: 0,
              localStatus: LOCAL_STATUS_UNCHANGED,
            },
          ],
        },
      ];

      const plan = buildExecutionPlan(mockWorkout);
      const exerciseStep = plan.find((s) => s.type === EXERCISE_STEP_TYPE);

      expect(exerciseStep?.blockId).toBe("my-block-id");
      expect(exerciseStep?.exerciseId).toBe("my-exercise-id");
    });

    it("should preserve exercise attributes in steps", () => {
      mockWorkout.blocks = [
        {
          id: "block-1",
          workout_id: "workout-1",
          name: "Block",
          type: "standard",
          prepare_time: 0,
          rest_exercise: 0,
          rest_group: 0,
          position: 0,
          localStatus: LOCAL_STATUS_UNCHANGED,
          exercises: [
            {
              id: "ex-1",
              block_id: "block-1",
              name: "Squat",
              reps: 8,
              time_seconds: 45,
              weight: 100,
              sets: 1,
              position: 0,
              localStatus: LOCAL_STATUS_UNCHANGED,
            },
          ],
        },
      ];

      const plan = buildExecutionPlan(mockWorkout);
      const exerciseStep = plan[0];

      expect(exerciseStep).toMatchObject({
        name: "Squat",
        reps: 8,
        time_seconds: 45,
        weight: 100,
      });
    });
  });

  // ============= COMPLEX SCENARIOS =============
  describe("complex scenarios", () => {
    it("should handle multiple blocks in order", () => {
      mockWorkout.blocks = [
        {
          id: "block-1",
          workout_id: "workout-1",
          name: "Warmup",
          type: "standard",
          prepare_time: 300,
          rest_exercise: 0,
          rest_group: 0,
          position: 0,
          localStatus: LOCAL_STATUS_UNCHANGED,
          exercises: [
            {
              id: "ex-1",
              block_id: "block-1",
              name: "Cardio",
              reps: 0,
              time_seconds: 0,
              weight: 0,
              sets: 1,
              position: 0,
              localStatus: LOCAL_STATUS_UNCHANGED,
            },
          ],
        },
        {
          id: "block-2",
          workout_id: "workout-1",
          name: "Main",
          type: "circuit",
          prepare_time: 0,
          rest_exercise: 20,
          rest_group: 60,
          position: 1,
          localStatus: LOCAL_STATUS_UNCHANGED,
          exercises: [
            {
              id: "ex-2",
              block_id: "block-2",
              name: "Lift 1",
              reps: 10,
              time_seconds: 0,
              weight: 50,
              sets: 2,
              position: 0,
              localStatus: LOCAL_STATUS_UNCHANGED,
            },
          ],
        },
      ];

      const plan = buildExecutionPlan(mockWorkout);
      const firstPrepare = plan[0];
      const exerciseNames = plan
        .filter((s) => s.type === EXERCISE_STEP_TYPE)
        .map((s) => s.name);

      expect(firstPrepare).toMatchObject({
        name: "Prepare for Warmup",
        duration_seconds: 300,
      });
      expect(exerciseNames).toEqual(["Cardio", "Lift 1", "Lift 1"]);
    });

    it("should handle workout with mixed deleted items", () => {
      mockWorkout.blocks = [
        {
          id: "block-1",
          workout_id: "workout-1",
          name: "Mixed",
          type: "standard",
          prepare_time: 0,
          rest_exercise: 0,
          rest_group: 0,
          position: 0,
          localStatus: LOCAL_STATUS_UNCHANGED,
          exercises: [
            {
              id: "ex-1",
              block_id: "block-1",
              name: "Keep 1",
              reps: 10,
              time_seconds: 0,
              weight: 0,
              sets: 1,
              position: 0,
              localStatus: LOCAL_STATUS_UNCHANGED,
            },
            {
              id: "ex-2",
              block_id: "block-1",
              name: "Delete Me",
              reps: 10,
              time_seconds: 0,
              weight: 0,
              sets: 1,
              position: 1,
              localStatus: LOCAL_STATUS_DELETED,
            },
            {
              id: "ex-3",
              block_id: "block-1",
              name: "Keep 2",
              reps: 10,
              time_seconds: 0,
              weight: 0,
              sets: 1,
              position: 2,
              localStatus: LOCAL_STATUS_UNCHANGED,
            },
          ],
        },
      ];

      const plan = buildExecutionPlan(mockWorkout);
      const exerciseNames = plan.map((s) => s.name);

      expect(exerciseNames).toEqual(["Keep 1", "Keep 2"]);
    });
  });
});
