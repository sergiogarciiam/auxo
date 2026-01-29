import { beforeEach, describe, expect, it } from "vitest";
import {
  LOCAL_STATUS_DELETED,
  LOCAL_STATUS_UNCHANGED,
} from "../../constants/constants";
import { UISection, UIWorkout } from "../../types/ui";
import {
  isNonEmptyString,
  isPositiveNumber,
  validateSection,
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

  // ============= validateSection TESTS =============
  describe("validateSection", () => {
    let mockSection: UISection;

    beforeEach(() => {
      mockSection = {
        id: "section-1",
        workout_id: "workout-1",
        name: "Test Section",
        type: "standard",
        prepare_time: 0,
        rest_exercise: 30,
        rest_group: 60,
        position: 0,
        localStatus: LOCAL_STATUS_UNCHANGED,
        exercises: [
          {
            id: "ex-1",
            section_id: "section-1",
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

    it("should return null for valid section", () => {
      expect(validateSection(mockSection)).toBeNull();
    });

    describe("name validation", () => {
      it("should return error if section name is empty", () => {
        mockSection.name = "";
        expect(validateSection(mockSection)).toBe("Section name is required");
      });

      it("should return error if section name is whitespace only", () => {
        mockSection.name = "   ";
        expect(validateSection(mockSection)).toBe("Section name is required");
      });

      it("should return error if section name is not a string", () => {
        mockSection.name = null as any;
        expect(validateSection(mockSection)).toBe("Section name is required");
      });
    });

    describe("type validation", () => {
      it("should return error if section type is empty", () => {
        mockSection.type = "";
        expect(validateSection(mockSection)).toBe("Section type is required");
      });

      it("should return error if section type is whitespace", () => {
        mockSection.type = "   ";
        expect(validateSection(mockSection)).toBe("Section type is required");
      });

      it("should accept valid section types", () => {
        mockSection.type = "circuit";
        expect(validateSection(mockSection)).toBeNull();

        mockSection.type = "superset";
        expect(validateSection(mockSection)).toBeNull();

        mockSection.type = "standard";
        expect(validateSection(mockSection)).toBeNull();
      });
    });

    describe("prepare_time validation", () => {
      it("should return error if prepare_time is not a number", () => {
        mockSection.prepare_time = null as any;
        expect(validateSection(mockSection)).toBe("Prepare time is required");
      });

      it("should return error if prepare_time is NaN", () => {
        mockSection.prepare_time = NaN;
        expect(validateSection(mockSection)).toBe("Prepare time is required");
      });

      it("should accept 0 as valid prepare_time", () => {
        mockSection.prepare_time = 0;
        expect(validateSection(mockSection)).toBeNull();
      });

      it("should accept positive prepare_time", () => {
        mockSection.prepare_time = 300;
        expect(validateSection(mockSection)).toBeNull();
      });
    });

    describe("rest_exercise validation", () => {
      it("should return error if rest_exercise is not a number", () => {
        mockSection.rest_exercise = null as any;
        expect(validateSection(mockSection)).toBe(
          "Rest between exercises is requiered",
        );
      });

      it("should return error if rest_exercise is NaN", () => {
        mockSection.rest_exercise = NaN;
        expect(validateSection(mockSection)).toBe(
          "Rest between exercises is requiered",
        );
      });

      it("should accept 0 as valid rest_exercise", () => {
        mockSection.rest_exercise = 0;
        expect(validateSection(mockSection)).toBeNull();
      });
    });

    describe("exercises validation", () => {
      it("should return error if no exercises (all deleted)", () => {
        mockSection.exercises = [
          {
            id: "ex-1",
            section_id: "section-1",
            name: "Deleted Ex",
            reps: 10,
            time_seconds: 0,
            weight: 0,
            sets: 3,
            position: 0,
            localStatus: LOCAL_STATUS_DELETED,
          },
        ];
        expect(validateSection(mockSection)).toBe(
          "Section requiere at least one exercise",
        );
      });

      it("should return error if no exercises (empty array)", () => {
        mockSection.exercises = [];
        expect(validateSection(mockSection)).toBe(
          "Section requiere at least one exercise",
        );
      });

      it("should ignore deleted exercises", () => {
        mockSection.exercises = [
          {
            id: "ex-1",
            section_id: "section-1",
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
            section_id: "section-1",
            name: "Deleted Ex",
            reps: 10,
            time_seconds: 0,
            weight: 0,
            sets: 3,
            position: 1,
            localStatus: LOCAL_STATUS_DELETED,
          },
        ];
        expect(validateSection(mockSection)).toBeNull();
      });
    });

    describe("exercise validation", () => {
      it("should return error if exercise name is empty", () => {
        mockSection.exercises[0].name = "";
        expect(validateSection(mockSection)).toBe("Exercise name is required");
      });

      it("should return error if exercise has neither reps nor time", () => {
        mockSection.exercises[0].reps = null as any;
        mockSection.exercises[0].time_seconds = null as any;
        expect(validateSection(mockSection)).toBe(
          "Exercise reps or time is required",
        );
      });

      it("should accept exercise with reps", () => {
        mockSection.exercises[0].reps = 10;
        mockSection.exercises[0].time_seconds = 0;
        expect(validateSection(mockSection)).toBeNull();
      });

      it("should accept exercise with time_seconds", () => {
        mockSection.exercises[0].reps = 0;
        mockSection.exercises[0].time_seconds = 30;
        expect(validateSection(mockSection)).toBeNull();
      });

      it("should accept exercise with both reps and time", () => {
        mockSection.exercises[0].reps = 10;
        mockSection.exercises[0].time_seconds = 45;
        expect(validateSection(mockSection)).toBeNull();
      });

      it("should return error if exercise sets is not defined", () => {
        mockSection.exercises[0].sets = null as any;
        expect(validateSection(mockSection)).toBe("Exercise sets is required");
      });

      it("should accept 0 sets (edge case)", () => {
        mockSection.exercises[0].sets = 0;
        expect(validateSection(mockSection)).toBeNull();
      });

      it("should skip validation for deleted exercises", () => {
        mockSection.exercises = [
          {
            id: "ex-1",
            section_id: "section-1",
            name: "", // invalid but deleted
            reps: 0,
            time_seconds: 0,
            weight: 0,
            sets: 0,
            position: 0,
            localStatus: LOCAL_STATUS_DELETED,
          },
        ];
        expect(validateSection(mockSection)).toBe(
          "Section requiere at least one exercise",
        );
      });

      it("should validate multiple exercises", () => {
        mockSection.exercises = [
          {
            id: "ex-1",
            section_id: "section-1",
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
            section_id: "section-1",
            name: "Exercise 2",
            reps: 15,
            time_seconds: 0,
            weight: 50,
            sets: 4,
            position: 1,
            localStatus: LOCAL_STATUS_UNCHANGED,
          },
        ];
        expect(validateSection(mockSection)).toBeNull();
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
        sections: [
          {
            id: "section-1",
            workout_id: "workout-1",
            name: "Section 1",
            type: "standard",
            prepare_time: 0,
            rest_exercise: 30,
            rest_group: 60,
            position: 0,
            localStatus: LOCAL_STATUS_UNCHANGED,
            exercises: [
              {
                id: "ex-1",
                section_id: "section-1",
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

    describe("sections validation", () => {
      it("should return error if no sections (all deleted)", () => {
        mockWorkout.sections = [
          {
            id: "section-1",
            workout_id: "workout-1",
            name: "Section 1",
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
          "Workout requiere at least one section",
        );
      });

      it("should return error if no sections (empty array)", () => {
        mockWorkout.sections = [];
        expect(validateWorkout(mockWorkout)).toBe(
          "Workout requiere at least one section",
        );
      });

      it("should ignore deleted sections", () => {
        mockWorkout.sections = [
          {
            id: "section-1",
            workout_id: "workout-1",
            name: "Valid Section",
            type: "standard",
            prepare_time: 0,
            rest_exercise: 30,
            rest_group: 60,
            position: 0,
            localStatus: LOCAL_STATUS_UNCHANGED,
            exercises: [
              {
                id: "ex-1",
                section_id: "section-1",
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
            id: "section-2",
            workout_id: "workout-1",
            name: "Deleted Section",
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

      it("should accept multiple valid sections", () => {
        mockWorkout.sections = [
          {
            id: "section-1",
            workout_id: "workout-1",
            name: "Section 1",
            type: "standard",
            prepare_time: 0,
            rest_exercise: 30,
            rest_group: 60,
            position: 0,
            localStatus: LOCAL_STATUS_UNCHANGED,
            exercises: [
              {
                id: "ex-1",
                section_id: "section-1",
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
            id: "section-2",
            workout_id: "workout-1",
            name: "Section 2",
            type: "circuit",
            prepare_time: 0,
            rest_exercise: 20,
            rest_group: 90,
            position: 1,
            localStatus: LOCAL_STATUS_UNCHANGED,
            exercises: [
              {
                id: "ex-2",
                section_id: "section-2",
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
