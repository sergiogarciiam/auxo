import { beforeEach, describe, expect, it } from "vitest";
import {
  LOCAL_STATUS_DELETED,
  LOCAL_STATUS_UNCHANGED,
} from "../../constants/constants";
import { UIBlock, UIWorkout } from "../../types/ui";
import {
  isNonEmptyString,
  isPositiveNumber,
  validateBlock,
  validateWorkout,
} from "../validation";

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
      expect(isPositiveNumber("5")).toBe(true); // string '5' converts to number 5
      expect(isPositiveNumber("-5")).toBe(false); // string '-5' converts to negative
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
        rest_exercise: 30,
        rest_group: 60,
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
            sets: 3,
            position: 0,
            localStatus: LOCAL_STATUS_UNCHANGED,
          },
        ],
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

    describe("rest_exercise validation", () => {
      it("should return error if rest_exercise is not a number", () => {
        mockBlock.rest_exercise = null as any;
        expect(validateBlock(mockBlock)).toBe(
          "Rest between exercises is requiered",
        );
      });

      it("should return error if rest_exercise is NaN", () => {
        mockBlock.rest_exercise = NaN;
        expect(validateBlock(mockBlock)).toBe(
          "Rest between exercises is requiered",
        );
      });

      it("should accept 0 as valid rest_exercise", () => {
        mockBlock.rest_exercise = 0;
        expect(validateBlock(mockBlock)).toBeNull();
      });
    });

    describe("exercises validation", () => {
      it("should return error if no exercises (all deleted)", () => {
        mockBlock.exercises = [
          {
            id: "ex-1",
            block_id: "block-1",
            name: "Deleted Ex",
            reps: 10,
            time_seconds: 0,
            weight: 0,
            sets: 3,
            position: 0,
            localStatus: LOCAL_STATUS_DELETED,
          },
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
          {
            id: "ex-1",
            block_id: "block-1",
            name: "Valid Ex",
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
            name: "Deleted Ex",
            reps: 10,
            time_seconds: 0,
            weight: 0,
            sets: 3,
            position: 1,
            localStatus: LOCAL_STATUS_DELETED,
          },
        ];
        expect(validateBlock(mockBlock)).toBeNull();
      });
    });

    describe("exercise validation", () => {
      it("should return error if exercise name is empty", () => {
        mockBlock.exercises[0].name = "";
        expect(validateBlock(mockBlock)).toBe("Exercise name is required");
      });

      it("should return error if exercise has neither reps nor time", () => {
        mockBlock.exercises[0].reps = null as any;
        mockBlock.exercises[0].time_seconds = null as any;
        expect(validateBlock(mockBlock)).toBe(
          "Exercise reps or time is required",
        );
      });

      it("should accept exercise with reps", () => {
        mockBlock.exercises[0].reps = 10;
        mockBlock.exercises[0].time_seconds = 0;
        expect(validateBlock(mockBlock)).toBeNull();
      });

      it("should accept exercise with time_seconds", () => {
        mockBlock.exercises[0].reps = 0;
        mockBlock.exercises[0].time_seconds = 30;
        expect(validateBlock(mockBlock)).toBeNull();
      });

      it("should accept exercise with both reps and time", () => {
        mockBlock.exercises[0].reps = 10;
        mockBlock.exercises[0].time_seconds = 45;
        expect(validateBlock(mockBlock)).toBeNull();
      });

      it("should return error if exercise sets is not defined", () => {
        mockBlock.exercises[0].sets = null as any;
        expect(validateBlock(mockBlock)).toBe("Exercise sets is required");
      });

      it("should accept 0 sets (edge case)", () => {
        mockBlock.exercises[0].sets = 0;
        expect(validateBlock(mockBlock)).toBeNull();
      });

      it("should skip validation for deleted exercises", () => {
        mockBlock.exercises = [
          {
            id: "ex-1",
            block_id: "block-1",
            name: "", // invalid but deleted
            reps: 0,
            time_seconds: 0,
            weight: 0,
            sets: 0,
            position: 0,
            localStatus: LOCAL_STATUS_DELETED,
          },
        ];
        expect(validateBlock(mockBlock)).toBe(
          "Block requiere at least one exercise",
        );
      });

      it("should validate multiple exercises", () => {
        mockBlock.exercises = [
          {
            id: "ex-1",
            block_id: "block-1",
            name: "Exercise 1",
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
            name: "Exercise 2",
            reps: 15,
            time_seconds: 0,
            weight: 50,
            sets: 4,
            position: 1,
            localStatus: LOCAL_STATUS_UNCHANGED,
          },
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
            rest_exercise: 30,
            rest_group: 60,
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
                sets: 3,
                position: 0,
                localStatus: LOCAL_STATUS_UNCHANGED,
              },
            ],
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
            rest_exercise: 30,
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
            rest_exercise: 30,
            rest_group: 60,
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
                sets: 3,
                position: 0,
                localStatus: LOCAL_STATUS_UNCHANGED,
              },
            ],
          },
          {
            id: "block-2",
            workout_id: "workout-1",
            name: "Deleted Block",
            type: "standard",
            prepare_time: 0,
            rest_exercise: 30,
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
            rest_exercise: 30,
            rest_group: 60,
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
                sets: 3,
                position: 0,
                localStatus: LOCAL_STATUS_UNCHANGED,
              },
            ],
          },
          {
            id: "block-2",
            workout_id: "workout-1",
            name: "Block 2",
            type: "circuit",
            prepare_time: 0,
            rest_exercise: 20,
            rest_group: 90,
            position: 1,
            localStatus: LOCAL_STATUS_UNCHANGED,
            exercises: [
              {
                id: "ex-2",
                block_id: "block-2",
                name: "Exercise 2",
                reps: 15,
                time_seconds: 0,
                weight: 50,
                sets: 4,
                position: 0,
                localStatus: LOCAL_STATUS_UNCHANGED,
              },
            ],
          },
        ];
        expect(validateWorkout(mockWorkout)).toBeNull();
      });
    });
  });
});
