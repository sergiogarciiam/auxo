import { describe, expect, it } from "vitest";
import { LOCAL_STATUS_UNCHANGED } from "../../constants/constants";
import { Exercise } from "../../types/exercise";
import { Section } from "../../types/section";
import { Workout } from "../../types/workout";
import {
  transformExerciseToUI,
  transformSectionToUI,
  transformWorkoutsToUI,
} from "../transformers";

describe("transformers", () => {
  // ============= transformExerciseToUI TESTS =============
  describe("transformExerciseToUI", () => {
    it("should transform exercise with all fields", () => {
      const exercise: Exercise = {
        id: 1,
        section_id: 1,
        name: "Bench Press",
        reps: 8,
        time_seconds: 45,
        weight: 80,
        sets: 3,
        position: 0,
      };

      const result = transformExerciseToUI(exercise);

      expect(result).toEqual({
        id: 1,
        section_id: 1,
        name: "Bench Press",
        reps: 8,
        time_seconds: 45,
        weight: 80,
        sets: 3,
        position: 0,
        localStatus: LOCAL_STATUS_UNCHANGED,
      });
    });

    it("should default null reps to 0", () => {
      const exercise: Exercise = {
        id: 1,
        section_id: 1,
        name: "Exercise",
        reps: undefined,
        time_seconds: 30,
        weight: 0,
        sets: 1,
        position: 0,
      };

      const result = transformExerciseToUI(exercise);
      expect(result.reps).toBe(0);
    });

    it("should default null time_seconds to 0", () => {
      const exercise: Exercise = {
        id: 1,
        section_id: 1,
        name: "Exercise",
        reps: 10,
        time_seconds: undefined,
        weight: 0,
        sets: 1,
        position: 0,
      };

      const result = transformExerciseToUI(exercise);
      expect(result.time_seconds).toBe(0);
    });

    it("should default null weight to 0", () => {
      const exercise: Exercise = {
        id: 1,
        section_id: 1,
        name: "Exercise",
        reps: 10,
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
        section_id: 1,
        name: "Exercise",
        reps: 10,
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
        section_id: 1,
        name: "Minimal Exercise",
        reps: undefined,
        time_seconds: undefined,
        weight: undefined,
        sets: undefined,
        position: 5,
      };

      const result = transformExerciseToUI(exercise);

      expect(result).toEqual({
        id: 1,
        section_id: 1,
        name: "Minimal Exercise",
        reps: 0,
        time_seconds: 0,
        weight: 0,
        sets: 0,
        position: 5,
        localStatus: LOCAL_STATUS_UNCHANGED,
      });
    });

    it("should preserve 0 values (not treat as null)", () => {
      const exercise: Exercise = {
        id: 1,
        section_id: 1,
        name: "Exercise",
        reps: 0,
        time_seconds: 0,
        weight: 0,
        sets: 0,
        position: 0,
      };

      const result = transformExerciseToUI(exercise);

      expect(result.reps).toBe(0);
      expect(result.time_seconds).toBe(0);
      expect(result.weight).toBe(0);
      expect(result.sets).toBe(0);
    });

    it("should set localStatus to UNCHANGED", () => {
      const exercise: Exercise = {
        id: 1,
        section_id: 1,
        name: "Exercise",
        reps: 10,
        time_seconds: 0,
        weight: 0,
        sets: 3,
        position: 0,
      };

      const result = transformExerciseToUI(exercise);
      expect(result.localStatus).toBe(LOCAL_STATUS_UNCHANGED);
    });
  });

  // ============= transformSectionToUI TESTS =============
  describe("transformSectionToUI", () => {
    it("should transform section with exercises", () => {
      const section: Section = {
        id: 1,
        workout_id: 1,
        name: "Chest Day",
        type: "standard",
        prepare_time: 300,
        rest_exercise: 60,
        rest_group: 120,
        position: 0,
      };

      const exercises: Exercise[] = [
        {
          id: 1,
          section_id: 1,
          name: "Bench Press",
          reps: 8,
          time_seconds: 0,
          weight: 80,
          sets: 3,
          position: 0,
        },
        {
          id: 2,
          section_id: 1,
          name: "Incline Press",
          reps: 10,
          time_seconds: 0,
          weight: 60,
          sets: 3,
          position: 1,
        },
      ];

      const result = transformSectionToUI(section, exercises);

      expect(result.id).toBe(1);
      expect(result.workout_id).toBe(1);
      expect(result.name).toBe("Chest Day");
      expect(result.type).toBe("standard");
      expect(result.prepare_time).toBe(300);
      expect(result.rest_exercise).toBe(60);
      expect(result.rest_group).toBe(120);
      expect(result.position).toBe(0);
      expect(result.localStatus).toBe(LOCAL_STATUS_UNCHANGED);
      expect(result.exercises).toHaveLength(2);
      expect(result.exercises[0].name).toBe("Bench Press");
      expect(result.exercises[1].name).toBe("Incline Press");
    });

    it("should handle empty exercises array", () => {
      const section: Section = {
        id: 1,
        workout_id: 1,
        name: "Empty Section",
        type: "circuit",
        prepare_time: 0,
        rest_exercise: 30,
        rest_group: 0,
        position: 0,
      };

      const result = transformSectionToUI(section, []);

      expect(result.exercises).toEqual([]);
    });

    it("should default null prepare_time to 0", () => {
      const section: Section = {
        id: 1,
        workout_id: 1,
        name: "Section",
        type: "standard",
        prepare_time: null as any,
        rest_exercise: 30,
        rest_group: 0,
        position: 0,
      };

      const result = transformSectionToUI(section, []);
      expect(result.prepare_time).toBe(0);
    });

    it("should default null rest_group to 0", () => {
      const section: Section = {
        id: 1,
        workout_id: 1,
        name: "Section",
        type: "standard",
        prepare_time: 0,
        rest_exercise: 30,
        rest_group: null as any,
        position: 0,
      };

      const result = transformSectionToUI(section, []);
      expect(result.rest_group).toBe(0);
    });

    it("should transform exercises within section", () => {
      const section: Section = {
        id: 1,
        workout_id: 1,
        name: "Section",
        type: "standard",
        prepare_time: 0,
        rest_exercise: 30,
        rest_group: 0,
        position: 0,
      };

      const exercises: Exercise[] = [
        {
          id: 1,
          section_id: 1,
          name: "Exercise",
          reps: undefined,
          time_seconds: 45,
          weight: undefined,
          sets: 1,
          position: 0,
        },
      ];

      const result = transformSectionToUI(section, exercises);

      expect(result.exercises[0]).toEqual({
        id: 1,
        section_id: 1,
        name: "Exercise",
        reps: 0,
        time_seconds: 45,
        weight: 0,
        sets: 1,
        position: 0,
        localStatus: LOCAL_STATUS_UNCHANGED,
      });
    });

    it("should preserve section position", () => {
      const section: Section = {
        id: 1,
        workout_id: 1,
        name: "Section",
        type: "standard",
        prepare_time: 0,
        rest_exercise: 30,
        rest_group: 0,
        position: 5,
      };

      const result = transformSectionToUI(section, []);
      expect(result.position).toBe(5);
    });

    it("should handle different section types", () => {
      const baseSection: Omit<Section, "type"> = {
        id: 1,
        workout_id: 1,
        name: "Section",
        prepare_time: 0,
        rest_exercise: 30,
        rest_group: 0,
        position: 0,
      };

      const types: Section["type"][] = ["standard", "circuit", "superset"];

      types.forEach((type) => {
        const section: Section = { ...baseSection, type };
        const result = transformSectionToUI(section, []);
        expect(result.type).toBe(type);
      });
    });

    it("should set localStatus to UNCHANGED", () => {
      const section: Section = {
        id: 1,
        workout_id: 1,
        name: "Section",
        type: "standard",
        prepare_time: 0,
        rest_exercise: 30,
        rest_group: 0,
        position: 0,
      };

      const result = transformSectionToUI(section, []);
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
        sections: [],
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

    it("should initialize sections as empty array", () => {
      const workouts: Workout[] = [
        {
          id: 1,
          name: "Workout",
          position: 0,
        },
      ];

      const result = transformWorkoutsToUI(workouts);
      expect(result[0].sections).toEqual([]);
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
          section_id: 1,
          name: "Bench Press",
          reps: 8,
          time_seconds: undefined,
          weight: 80,
          sets: 3,
          position: 0,
        },
      ];

      const section: Section = {
        id: 1,
        workout_id: 1,
        name: "Chest",
        type: "standard",
        prepare_time: 300,
        rest_exercise: 60,
        rest_group: 120,
        position: 0,
      };

      const uiSection = transformSectionToUI(section, exercises);

      expect(uiSection.name).toBe("Chest");
      expect(uiSection.exercises).toHaveLength(1);
      expect(uiSection.exercises[0].reps).toBe(8);
      expect(uiSection.exercises[0].time_seconds).toBe(0); // defaulted
      expect(uiSection.exercises[0].weight).toBe(80);
    });

    it("should transform workouts with proper structure", () => {
      const workouts: Workout[] = [
        { id: 1, name: "Program A", position: 0 },
        { id: 2, name: "Program B", position: 1 },
      ];

      const uiWorkouts = transformWorkoutsToUI(workouts);

      expect(uiWorkouts).toHaveLength(2);
      expect(uiWorkouts.every((w) => w.sections instanceof Array)).toBe(true);
      expect(
        uiWorkouts.every((w) => w.localStatus === LOCAL_STATUS_UNCHANGED),
      ).toBe(true);
    });
  });
});
