import { describe, expect, it } from "vitest";
import {
  ExerciseSetData,
  deserializeSetsData,
  initializeSetsData,
  serializeSetsData,
} from "../exercise-utils";

describe("exercise-utils", () => {
  // ============= initializeSetsData TESTS =============
  describe("initializeSetsData", () => {
    it("should create correct number of sets with default values", () => {
      const sets = initializeSetsData(3, 10, 8, 12, 45, 80, 60);

      expect(sets).toHaveLength(3);
      expect(sets[0]).toEqual({
        last_reps: 10,
        min_reps: 8,
        max_reps: 12,
        time_seconds: 45,
        weight: 80,
        rest_time: 60,
      });
    });

    it("should create single set when numSets is 1", () => {
      const sets = initializeSetsData(1, 15, 10, 20, 30, 100, 90);

      expect(sets).toHaveLength(1);
      expect(sets[0]).toEqual({
        last_reps: 15,
        min_reps: 10,
        max_reps: 20,
        time_seconds: 30,
        weight: 100,
        rest_time: 90,
      });
    });

    it("should create empty array when numSets is 0", () => {
      const sets = initializeSetsData(0, 10, 8, 12, 45, 80, 60);
      expect(sets).toHaveLength(0);
      expect(sets).toEqual([]);
    });

    it("should handle zero values correctly", () => {
      const sets = initializeSetsData(2, 0, 0, 0, 0, 0, 0);

      expect(sets[0]).toEqual({
        last_reps: 0,
        min_reps: 0,
        max_reps: 0,
        time_seconds: 0,
        weight: 0,
        rest_time: 0,
      });
    });

    it("should handle large numbers", () => {
      const sets = initializeSetsData(5, 1000, 500, 2000, 3600, 500, 3600);

      expect(sets).toHaveLength(5);
      expect(sets[4]).toEqual({
        last_reps: 1000,
        min_reps: 500,
        max_reps: 2000,
        time_seconds: 3600,
        weight: 500,
        rest_time: 3600,
      });
    });

    it("should initialize each set independently (all same values)", () => {
      const sets = initializeSetsData(3, 12, 10, 15, 60, 75, 45);

      // Verify each set has the same values but are independent objects
      sets.forEach((set) => {
        expect(set).toEqual({
          last_reps: 12,
          min_reps: 10,
          max_reps: 15,
          time_seconds: 60,
          weight: 75,
          rest_time: 45,
        });
      });

      // Verify they're different objects
      expect(sets[0]).not.toBe(sets[1]);
    });
  });

  // ============= serializeSetsData TESTS =============
  describe("serializeSetsData", () => {
    it("should serialize sets_data to JSON string", () => {
      const setsData: ExerciseSetData[] = [
        {
          last_reps: 10,
          min_reps: 8,
          max_reps: 12,
          time_seconds: 45,
          weight: 80,
          rest_time: 60,
        },
        {
          last_reps: 9,
          min_reps: 8,
          max_reps: 12,
          time_seconds: 45,
          weight: 80,
          rest_time: 60,
        },
      ];

      const result = serializeSetsData(setsData);

      expect(typeof result).toBe("string");
      expect(JSON.parse(result!)).toEqual(setsData);
    });

    it("should return undefined for empty array", () => {
      const result = serializeSetsData([]);
      expect(result).toBeUndefined();
    });

    it("should return undefined for undefined input", () => {
      const result = serializeSetsData(undefined);
      expect(result).toBeUndefined();
    });

    it("should handle single set", () => {
      const setsData: ExerciseSetData[] = [
        {
          last_reps: 10,
          min_reps: 8,
          max_reps: 12,
          time_seconds: 45,
          weight: 80,
          rest_time: 60,
        },
      ];

      const result = serializeSetsData(setsData);

      expect(typeof result).toBe("string");
      expect(JSON.parse(result!)).toEqual(setsData);
    });

    it("should handle sets with zero values", () => {
      const setsData: ExerciseSetData[] = [
        {
          last_reps: 0,
          min_reps: 0,
          max_reps: 0,
          time_seconds: 0,
          weight: 0,
          rest_time: 0,
        },
      ];

      const result = serializeSetsData(setsData);

      expect(JSON.parse(result!)).toEqual(setsData);
    });

    it("should produce valid JSON that can be parsed back", () => {
      const original = initializeSetsData(3, 12, 10, 15, 60, 75, 45);
      const serialized = serializeSetsData(original);
      const deserialized = JSON.parse(serialized!);

      expect(deserialized).toEqual(original);
    });
  });

  // ============= deserializeSetsData TESTS =============
  describe("deserializeSetsData", () => {
    it("should deserialize valid JSON string", () => {
      const jsonString =
        '[{"last_reps":10,"min_reps":8,"max_reps":12,"time_seconds":45,"weight":80,"rest_time":60}]';
      const result = deserializeSetsData(jsonString);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        last_reps: 10,
        min_reps: 8,
        max_reps: 12,
        time_seconds: 45,
        weight: 80,
        rest_time: 60,
      });
    });

    it("should handle multiple sets", () => {
      const jsonString =
        '[{"last_reps":10,"min_reps":8,"max_reps":12,"time_seconds":45,"weight":80,"rest_time":60},{"last_reps":9,"min_reps":8,"max_reps":12,"time_seconds":45,"weight":80,"rest_time":60}]';
      const result = deserializeSetsData(jsonString);

      expect(result).toHaveLength(2);
      expect(result[1].last_reps).toBe(9);
    });

    it("should return empty array for invalid JSON", () => {
      const result = deserializeSetsData("invalid json");
      expect(result).toEqual([]);
    });

    it("should return empty array for malformed JSON", () => {
      const result = deserializeSetsData("{invalid}");
      expect(result).toEqual([]);
    });

    it("should handle empty JSON array", () => {
      const result = deserializeSetsData("[]");
      expect(result).toEqual([]);
    });

    it("should correctly round-trip with serialize", () => {
      const original = initializeSetsData(3, 12, 10, 15, 60, 75, 45);
      const serialized = serializeSetsData(original)!;
      const deserialized = deserializeSetsData(serialized);

      expect(deserialized).toEqual(original);
    });

    it("should handle JSON with extra whitespace", () => {
      const jsonString =
        '  [  {"last_reps": 10, "min_reps": 8, "max_reps": 12, "time_seconds": 45, "weight": 80, "rest_time": 60}  ]  ';
      const result = deserializeSetsData(jsonString);

      expect(result).toHaveLength(1);
      expect(result[0].last_reps).toBe(10);
    });
  });

  // ============= Integration Tests =============
  describe("integration: serialize -> deserialize", () => {
    it("should preserve data through serialize/deserialize cycle", () => {
      const original = initializeSetsData(5, 15, 12, 18, 90, 100, 120);
      const serialized = serializeSetsData(original);
      const deserialized = deserializeSetsData(serialized!);

      expect(deserialized).toEqual(original);
    });

    it("should handle complex set modifications", () => {
      let sets = initializeSetsData(3, 10, 8, 12, 45, 80, 60);

      // Simulate modifying a set
      sets[1].last_reps = 11;
      sets[1].weight = 85;

      const serialized = serializeSetsData(sets);
      const deserialized = deserializeSetsData(serialized!);

      expect(deserialized[1].last_reps).toBe(11);
      expect(deserialized[1].weight).toBe(85);
      expect(deserialized[0].last_reps).toBe(10); // Others unchanged
    });
  });
});
