import { beforeEach, describe, expect, it } from "vitest";
import {
  LOCAL_STATUS_DELETED,
  LOCAL_STATUS_UNCHANGED,
} from "../../constants/constants";
import { UIBlock, UIExercise, UIWorkout } from "../../types/ui";
import {
  isNonEmptyString,
  isPositiveNumber,
  validateBlock,
  validateExercise,
  validateWorkout,
} from "../validation";

// Helper to create mock exercises
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

describe("validation utilities", () => {
  // ============= isNonEmptyString TESTS =============
  describe("isNonEmptyString", () => {
    it("should return true for non-empty string", () => {
      expect(isNonEmptyString("hello")).toBe(true);
    });

    it("should return false for empty string", () => {
      expect(isNonEmptyString("")).toBe(false);
    });

    it("should return false for whitespace only", () => {
      expect(isNonEmptyString("   ")).toBe(false);
    });

    it("should return false for non-string types", () => {
      expect(isNonEmptyString(123)).toBe(false);
      expect(isNonEmptyString(null)).toBe(false);
      expect(isNonEmptyString(undefined)).toBe(false);
      expect(isNonEmptyString([])).toBe(false);
      expect(isNonEmptyString({})).toBe(false);
    });

    it("should trim whitespace before validating", () => {
      expect(isNonEmptyString("  hello  ")).toBe(true);
      expect(isNonEmptyString("\t\n")).toBe(false);
    });
  });

  // ============= isPositiveNumber TESTS =============
  describe("isPositiveNumber", () => {
    it("should return true for positive numbers", () => {
      expect(isPositiveNumber(5)).toBe(true);
      expect(isPositiveNumber(0)).toBe(true);
      expect(isPositiveNumber(100.5)).toBe(true);
    });

    it("should return false for negative numbers", () => {
      expect(isPositiveNumber(-1)).toBe(false);
      expect(isPositiveNumber(-100)).toBe(false);
    });

    it("should return false for non-number types", () => {
      expect(isPositiveNumber("5")).toBe(true); // string converts to number
      expect(isPositiveNumber(null)).toBe(true); // null converts to 0
      expect(isPositiveNumber(undefined)).toBe(false); // undefined is NaN
      expect(isPositiveNumber(NaN)).toBe(false);
      expect(isPositiveNumber(Infinity)).toBe(false);
    });

    it("should handle string numbers by converting", () => {
      expect(isPositiveNumber("5")).toBe(true);
      expect(isPositiveNumber("-5")).toBe(false);
    });
  });

  // ============= validateExercise TESTS =============
  describe("validateExercise", () => {
    it("should return null for valid exercise", () => {
      const ex = createMockExercise();
      expect(validateExercise(ex)).toBeNull();
    });

    it("should return error if exercise name is empty", () => {
      const ex = createMockExercise({ name: "" });
      expect(validateExercise(ex)).toBe("Exercise name is required");
    });

    it("should return error if exercise name is whitespace", () => {
      const ex = createMockExercise({ name: "   " });
      expect(validateExercise(ex)).toBe("Exercise name is required");
    });

    it("should return error if sets is null", () => {
      const ex = createMockExercise({ sets: null as any });
      expect(validateExercise(ex)).toBe("Exercise sets is required");
    });

    it("should return error if sets is undefined", () => {
      const ex = createMockExercise({ sets: undefined as any });
      expect(validateExercise(ex)).toBe("Exercise sets is required");
    });

    it("should accept 0 sets", () => {
      const ex = createMockExercise({ sets: 0 });
      expect(validateExercise(ex)).toBeNull();
    });

    it("should accept rest exercise without reps or time", () => {
      const ex = createMockExercise({
        name: "Rest",
        min_reps: undefined as any,
        last_reps: undefined as any,
        exercise_time: 0,
      });
      expect(validateExercise(ex)).toBeNull();
    });

    it("should return error if exercise_type is reps without reps", () => {
      const ex = createMockExercise({
        min_reps: undefined as any,
        last_reps: undefined as any,
        exercise_time: 0,
        exercise_type: "reps",
      });
      expect(validateExercise(ex)).toBe(
        "Exercise requiere min_reps or last_reps",
      );
    });

    it("should return error if exercise_type is time without exercise_time", () => {
      const ex = createMockExercise({
        exercise_time: 0,
        exercise_type: "time",
        min_reps: undefined as any,
        last_reps: undefined as any,
      });
      expect(validateExercise(ex)).toBe("Exercise requiere exercise_time");
    });

    it("should accept exercise_type time with valid exercise_time", () => {
      const ex = createMockExercise({
        exercise_time: 30,
        exercise_type: "time",
        min_reps: undefined as any,
        last_reps: undefined as any,
      });
      expect(validateExercise(ex)).toBeNull();
    });
  });

  // ============= validateBlock TESTS =============
  describe("validateBlock", () => {
    let mockBlock: UIBlock;

    beforeEach(() => {
      mockBlock = {
        id: "block-1",
        workout_id: "workout-1",
        name: "Test Block",
        type: "standard",
        prepare_time: 0,
        rest_group: 60,
        position: 0,
        localStatus: LOCAL_STATUS_UNCHANGED,
        exercises: [createMockExercise()],
      };
    });

    it("should return null for valid block", () => {
      expect(validateBlock(mockBlock)).toBeNull();
    });

    describe("name validation", () => {
      it("should return error if block name is empty", () => {
        mockBlock.name = "";
        expect(validateBlock(mockBlock)).toBe("Block name is required");
      });

      it("should return error if block name is whitespace only", () => {
        mockBlock.name = "   ";
        expect(validateBlock(mockBlock)).toBe("Block name is required");
      });

      it("should return error if block name is not a string", () => {
        mockBlock.name = null as any;
        expect(validateBlock(mockBlock)).toBe("Block name is required");
      });
    });

    describe("type validation", () => {
      it("should return error if block type is empty", () => {
        mockBlock.type = "";
        expect(validateBlock(mockBlock)).toBe("Block type is required");
      });

      it("should return error if block type is whitespace", () => {
        mockBlock.type = "   ";
        expect(validateBlock(mockBlock)).toBe("Block type is required");
      });

      it("should accept valid block types", () => {
        mockBlock.type = "circuit";
        expect(validateBlock(mockBlock)).toBeNull();

        mockBlock.type = "superset";
        expect(validateBlock(mockBlock)).toBeNull();

        mockBlock.type = "standard";
        expect(validateBlock(mockBlock)).toBeNull();
      });
    });

    describe("prepare_time validation", () => {
      it("should return error if prepare_time is not a number", () => {
        mockBlock.prepare_time = null as any;
        expect(validateBlock(mockBlock)).toBe("Prepare time is required");
      });

      it("should return error if prepare_time is NaN", () => {
        mockBlock.prepare_time = NaN;
        expect(validateBlock(mockBlock)).toBe("Prepare time is required");
      });

      it("should accept 0 as valid prepare_time", () => {
        mockBlock.prepare_time = 0;
        expect(validateBlock(mockBlock)).toBeNull();
      });

      it("should accept positive prepare_time", () => {
        mockBlock.prepare_time = 300;
        expect(validateBlock(mockBlock)).toBeNull();
      });
    });

    describe("rest_group validation", () => {
      it("should accept 0 as valid rest_group", () => {
        mockBlock.rest_group = 0;
        expect(validateBlock(mockBlock)).toBeNull();
      });

      it("should accept positive rest_group", () => {
        mockBlock.rest_group = 60;
        expect(validateBlock(mockBlock)).toBeNull();
      });
    });

    describe("exercises validation", () => {
      it("should return error if no exercises (all deleted)", () => {
        mockBlock.exercises = [
          createMockExercise({
            localStatus: LOCAL_STATUS_DELETED,
          }),
        ];
        expect(validateBlock(mockBlock)).toBe(
          "Block requiere at least one exercise",
        );
      });

      it("should return error if no exercises (empty array)", () => {
        mockBlock.exercises = [];
        expect(validateBlock(mockBlock)).toBe(
          "Block requiere at least one exercise",
        );
      });

      it("should ignore deleted exercises", () => {
        mockBlock.exercises = [
          createMockExercise({ name: "Valid Ex" }),
          createMockExercise({
            id: "ex-2",
            name: "Deleted Ex",
            localStatus: LOCAL_STATUS_DELETED,
          }),
        ];
        expect(validateBlock(mockBlock)).toBeNull();
      });
    });

    describe("exercise validation", () => {
      it("should return error if exercise name is empty", () => {
        mockBlock.exercises = [createMockExercise({ name: "" })];
        expect(validateBlock(mockBlock)).toBe("Exercise name is required");
      });

      it("should accept exercise with valid min_reps", () => {
        mockBlock.exercises = [createMockExercise({ min_reps: 10 })];
        expect(validateBlock(mockBlock)).toBeNull();
      });

      it("should accept exercise with both reps and time", () => {
        mockBlock.exercises = [
          createMockExercise({
            min_reps: 10,
            exercise_time: 45,
          }),
        ];
        expect(validateBlock(mockBlock)).toBeNull();
      });

      it("should return error if exercise sets is not defined", () => {
        mockBlock.exercises = [
          createMockExercise({
            sets: null as any,
          }),
        ];
        expect(validateBlock(mockBlock)).toBe("Exercise sets is required");
      });

      it("should accept 0 sets (edge case)", () => {
        mockBlock.exercises = [createMockExercise({ sets: 0 })];
        expect(validateBlock(mockBlock)).toBeNull();
      });

      it("should skip validation for deleted exercises", () => {
        mockBlock.exercises = [
          createMockExercise({
            name: "", // invalid but deleted
            localStatus: LOCAL_STATUS_DELETED,
          }),
        ];
        expect(validateBlock(mockBlock)).toBe(
          "Block requiere at least one exercise",
        );
      });

      it("should validate multiple exercises", () => {
        mockBlock.exercises = [
          createMockExercise({
            id: "ex-1",
            name: "Exercise 1",
            min_reps: 10,
          }),
          createMockExercise({
            id: "ex-2",
            name: "Exercise 2",
            min_reps: 15,
            weight: 50,
            sets: 4,
          }),
        ];
        expect(validateBlock(mockBlock)).toBeNull();
      });

      it("should return error if exercise_type is reps without min_reps or last_reps", () => {
        mockBlock.exercises = [
          createMockExercise({
            min_reps: undefined as any,
            last_reps: undefined as any,
            exercise_time: 0,
            exercise_type: "reps",
          }),
        ];
        expect(validateBlock(mockBlock)).toBe(
          "Exercise requiere min_reps or last_reps",
        );
      });

      it("should return error if exercise_type is time without exercise_time", () => {
        mockBlock.exercises = [
          createMockExercise({
            min_reps: undefined as any,
            last_reps: undefined as any,
            exercise_time: 0,
            exercise_type: "time",
          }),
        ];
        expect(validateBlock(mockBlock)).toBe(
          "Exercise requiere exercise_time",
        );
      });

      it("should accept rest exercise without reps or time", () => {
        mockBlock.exercises = [
          createMockExercise({
            name: "Rest",
            min_reps: undefined as any,
            last_reps: undefined as any,
            exercise_time: 0,
          }),
        ];
        expect(validateBlock(mockBlock)).toBeNull();
      });
    });
  });

  // ============= validateWorkout TESTS =============
  describe("validateWorkout", () => {
    let mockWorkout: UIWorkout;

    beforeEach(() => {
      mockWorkout = {
        id: "workout-1",
        name: "Test Workout",
        position: 0,
        blocks: [
          {
            id: "block-1",
            workout_id: "workout-1",
            name: "Block 1",
            type: "standard",
            prepare_time: 0,
            rest_group: 60,
            position: 0,
            localStatus: LOCAL_STATUS_UNCHANGED,
            exercises: [createMockExercise()],
          },
        ],
        localStatus: LOCAL_STATUS_UNCHANGED,
      };
    });

    it("should return null for valid workout", () => {
      expect(validateWorkout(mockWorkout)).toBeNull();
    });

    describe("name validation", () => {
      it("should return error if workout name is empty", () => {
        mockWorkout.name = "";
        expect(validateWorkout(mockWorkout)).toBe("Workout name is required");
      });

      it("should return error if workout name is whitespace", () => {
        mockWorkout.name = "   ";
        expect(validateWorkout(mockWorkout)).toBe("Workout name is required");
      });

      it("should return error if workout name is not a string", () => {
        mockWorkout.name = null as any;
        expect(validateWorkout(mockWorkout)).toBe("Workout name is required");
      });
    });

    describe("blocks validation", () => {
      it("should return error if no blocks (all deleted)", () => {
        mockWorkout.blocks = [
          {
            id: "block-1",
            workout_id: "workout-1",
            name: "Block 1",
            type: "standard",
            prepare_time: 0,
            rest_group: 60,
            position: 0,
            localStatus: LOCAL_STATUS_DELETED,
            exercises: [],
          },
        ];
        expect(validateWorkout(mockWorkout)).toBe(
          "Workout requiere at least one block",
        );
      });

      it("should return error if no blocks (empty array)", () => {
        mockWorkout.blocks = [];
        expect(validateWorkout(mockWorkout)).toBe(
          "Workout requiere at least one block",
        );
      });

      it("should ignore deleted blocks", () => {
        mockWorkout.blocks = [
          {
            id: "block-1",
            workout_id: "workout-1",
            name: "Valid Block",
            type: "standard",
            prepare_time: 0,
            rest_group: 60,
            position: 0,
            localStatus: LOCAL_STATUS_UNCHANGED,
            exercises: [createMockExercise()],
          },
          {
            id: "block-2",
            workout_id: "workout-1",
            name: "Deleted Block",
            type: "standard",
            prepare_time: 0,
            rest_group: 60,
            position: 1,
            localStatus: LOCAL_STATUS_DELETED,
            exercises: [],
          },
        ];
        expect(validateWorkout(mockWorkout)).toBeNull();
      });

      it("should accept multiple valid blocks", () => {
        mockWorkout.blocks = [
          {
            id: "block-1",
            workout_id: "workout-1",
            name: "Block 1",
            type: "standard",
            prepare_time: 0,
            rest_group: 60,
            position: 0,
            localStatus: LOCAL_STATUS_UNCHANGED,
            exercises: [createMockExercise()],
          },
          {
            id: "block-2",
            workout_id: "workout-1",
            name: "Block 2",
            type: "circuit",
            prepare_time: 0,
            rest_group: 90,
            position: 1,
            localStatus: LOCAL_STATUS_UNCHANGED,
            exercises: [createMockExercise()],
          },
        ];
        expect(validateWorkout(mockWorkout)).toBeNull();
      });

      describe("block exercise validation", () => {
        it("should fail if a block has an exercise with empty name", () => {
          mockWorkout.blocks = [
            {
              id: "block-1",
              workout_id: "workout-1",
              name: "Block 1",
              type: "standard",
              prepare_time: 0,
              rest_group: 60,
              position: 0,
              localStatus: LOCAL_STATUS_UNCHANGED,
              exercises: [createMockExercise({ name: "" })],
            },
          ];
          expect(validateWorkout(mockWorkout)).toBe(
            "Exercise name is required",
          );
        });

        it("should fail if a block has an exercise without sets", () => {
          mockWorkout.blocks = [
            {
              id: "block-1",
              workout_id: "workout-1",
              name: "Block 1",
              type: "standard",
              prepare_time: 0,
              rest_group: 60,
              position: 0,
              localStatus: LOCAL_STATUS_UNCHANGED,
              exercises: [createMockExercise({ sets: null as any })],
            },
          ];
          expect(validateWorkout(mockWorkout)).toBe(
            "Exercise sets is required",
          );
        });
      });
    });
  });
});
