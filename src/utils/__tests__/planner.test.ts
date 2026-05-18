import { describe, expect, it, vi } from "vitest";
import {
  CIRCUIT_TYPE,
  COOLDOWN_TYPE,
  EXERCISE_STEP_TYPE,
  FLEXIBLE_TYPE,
  LOCAL_STATUS_DELETED,
  LOCAL_STATUS_NEW,
  LOCAL_STATUS_UNCHANGED,
  REST_STEP_TYPE,
  SUPERSET_TYPE,
  TRADITIONAL_TYPE,
  WARMUP_TYPE,
} from "../../constants/constants";
import { UIBlock, UIExercise, UIWorkout } from "../../types/ui";
import { buildExecutionPlan } from "../planner";

vi.mock("nanoid/non-secure", () => ({
  nanoid: () => "test-nanoid",
}));

function exercise(overrides: Partial<UIExercise> = {}): UIExercise {
  return {
    id: 1,
    block_id: 1,
    name: "Push Ups",
    last_reps: 10,
    min_reps: 8,
    max_reps: 12,
    exercise_time: 0,
    exercise_type: "reps",
    config_type: "simple",
    rest_time: 60,
    weight: 0,
    sets: 3,
    position: 0,
    localStatus: LOCAL_STATUS_UNCHANGED,
    ...overrides,
  };
}

function block(
  overrides: Partial<UIBlock> = {},
  exercises: UIExercise[] = [],
): UIBlock {
  return {
    id: 1,
    workout_id: 1,
    name: "Test Block",
    type: TRADITIONAL_TYPE,
    prepare_time: 0,
    rest_group: 0,
    position: 0,
    localStatus: LOCAL_STATUS_UNCHANGED,
    exercises,
    ...overrides,
  };
}

function workout(
  overrides: Partial<UIWorkout> = {},
  blocks: UIBlock[] = [],
): UIWorkout {
  return {
    id: 1,
    name: "Test Workout",
    position: 0,
    localStatus: LOCAL_STATUS_UNCHANGED,
    blocks,
    ...overrides,
  };
}

function stripIds(steps: ReturnType<typeof buildExecutionPlan>) {
  return steps.map(({ id, ...rest }) => rest);
}

describe("buildExecutionPlan", () => {
  it("returns empty plan for workout with no blocks", () => {
    const result = buildExecutionPlan(workout());
    expect(result).toEqual([]);
  });

  it("returns empty plan when all blocks are deleted", () => {
    const w = workout({}, [
      block({ localStatus: LOCAL_STATUS_DELETED }),
      block({ localStatus: LOCAL_STATUS_DELETED }),
    ]);
    expect(buildExecutionPlan(w)).toEqual([]);
  });

  it("returns empty plan when block has no exercises", () => {
    const w = workout({}, [block()]);
    expect(buildExecutionPlan(w)).toEqual([]);
  });

  it("filters out deleted exercises", () => {
    const ex = exercise({ position: 0, rest_time: 0, sets: 2 });
    const deletedEx = exercise({
      id: 2,
      position: 1,
      localStatus: LOCAL_STATUS_DELETED,
      rest_time: 0,
    });
    const w = workout({}, [block({}, [ex, deletedEx])]);
    const result = buildExecutionPlan(w);
    expect(result).toHaveLength(2); // 2 sets, no rest, no deleted exercise
    expect(result.every((s) => s.exerciseId !== 2)).toBe(true);
  });
});

describe("standard block", () => {
  it("generates steps for each set of a single exercise", () => {
    const ex = exercise({ sets: 2, rest_time: 0 });
    const w = workout({}, [block({}, [ex])]);
    const result = stripIds(buildExecutionPlan(w));

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      type: EXERCISE_STEP_TYPE,
      blockId: 1,
      exerciseId: 1,
      name: "Push Ups",
      set: 1,
      totalSets: 2,
      last_reps: 10,
      min_reps: 8,
      max_reps: 12,
    });
    expect(result[1]).toMatchObject({
      type: EXERCISE_STEP_TYPE,
      blockId: 1,
      exerciseId: 1,
      name: "Push Ups",
      set: 2,
      totalSets: 2,
    });
  });

  it("adds rest between sets when rest_time > 0", () => {
    const ex = exercise({ sets: 3, rest_time: 45 });
    const w = workout({}, [block({}, [ex])]);
    const result = stripIds(buildExecutionPlan(w));

    // set1 → rest → set2 → rest → set3
    expect(result).toHaveLength(5);
    expect(result[0].type).toBe(EXERCISE_STEP_TYPE);
    expect(result[0].set).toBe(1);
    expect(result[1]).toMatchObject({
      type: REST_STEP_TYPE,
      name: "Rest",
      duration_seconds: 45,
    });
    expect(result[2].type).toBe(EXERCISE_STEP_TYPE);
    expect(result[2].set).toBe(2);
    expect(result[3]).toMatchObject({
      type: REST_STEP_TYPE,
      name: "Rest",
      duration_seconds: 45,
    });
    expect(result[4].type).toBe(EXERCISE_STEP_TYPE);
    expect(result[4].set).toBe(3);
  });

  it("adds prepare_time rest before exercises", () => {
    const ex = exercise({ sets: 1, rest_time: 0 });
    const w = workout({}, [block({ prepare_time: 30 }, [ex])]);
    const result = stripIds(buildExecutionPlan(w));

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      type: REST_STEP_TYPE,
      name: "Prepare for Test Block",
      duration_seconds: 30,
    });
    expect(result[1].type).toBe(EXERCISE_STEP_TYPE);
  });

  it("adds rest between different exercises", () => {
    const ex1 = exercise({
      id: 1,
      name: "Squats",
      sets: 1,
      rest_time: 60,
      position: 0,
    });
    const ex2 = exercise({
      id: 2,
      name: "Press",
      sets: 1,
      rest_time: 45,
      position: 1,
    });
    const w = workout({}, [block({}, [ex1, ex2])]);
    const result = stripIds(buildExecutionPlan(w));

    // Squats → rest → Press
    expect(result).toHaveLength(3);
    expect(result[0]).toMatchObject({
      type: EXERCISE_STEP_TYPE,
      exerciseId: 1,
    });
    expect(result[1]).toMatchObject({
      type: REST_STEP_TYPE,
      duration_seconds: 60,
    });
    expect(result[2]).toMatchObject({
      type: EXERCISE_STEP_TYPE,
      exerciseId: 2,
    });
  });

  it("uses per-set metrics for complex exercises", () => {
    const ex = exercise({
      config_type: "complex",
      sets: 2,
      rest_time: 30,
      sets_data: [
        {
          last_reps: 10,
          min_reps: 8,
          max_reps: 12,
          time_seconds: 0,
          weight: 20,
          rest_time: 30,
        },
        {
          last_reps: 8,
          min_reps: 8,
          max_reps: 10,
          time_seconds: 0,
          weight: 25,
          rest_time: 40,
        },
      ],
    });
    const w = workout({}, [block({}, [ex])]);
    const result = stripIds(buildExecutionPlan(w));

    // set1 → rest → set2 (no rest after last set)
    expect(result).toHaveLength(3);
    expect(result[0]).toMatchObject({
      type: EXERCISE_STEP_TYPE,
      set: 1,
      last_reps: 10,
      weight: 20,
    });
    expect(result[1]).toMatchObject({
      type: REST_STEP_TYPE,
      duration_seconds: 30,
    });
    expect(result[2]).toMatchObject({
      type: EXERCISE_STEP_TYPE,
      set: 2,
      last_reps: 8,
      weight: 25,
    });
  });

  it("handles time-based exercises", () => {
    const ex = exercise({
      exercise_type: "time",
      exercise_time: 30,
      rest_time: 15,
      sets: 2,
    });
    const w = workout({}, [block({}, [ex])]);
    const result = stripIds(buildExecutionPlan(w));

    expect(result).toHaveLength(3); // set1 → rest → set2
    expect(result[0]).toMatchObject({
      type: EXERCISE_STEP_TYPE,
      time_seconds: 30,
      set: 1,
    });
    expect(result[1]).toMatchObject({
      type: REST_STEP_TYPE,
      duration_seconds: 15,
    });
    expect(result[2]).toMatchObject({
      type: EXERCISE_STEP_TYPE,
      time_seconds: 30,
      set: 2,
    });
  });

  it("sorts exercises by position", () => {
    const ex1 = exercise({
      id: 1,
      name: "B",
      position: 1,
      sets: 1,
      rest_time: 0,
    });
    const ex2 = exercise({
      id: 2,
      name: "A",
      position: 0,
      sets: 1,
      rest_time: 0,
    });
    const w = workout({}, [block({}, [ex1, ex2])]);
    const result = stripIds(buildExecutionPlan(w));

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("A");
    expect(result[1].name).toBe("B");
  });
});

describe("superset block", () => {
  it("alternates sets between two exercises", () => {
    const ex1 = exercise({
      id: 1,
      name: "Bench",
      sets: 2,
      rest_time: 30,
      position: 0,
    });
    const ex2 = exercise({
      id: 2,
      name: "Row",
      sets: 2,
      rest_time: 30,
      position: 1,
    });
    const w = workout({}, [
      block({ type: SUPERSET_TYPE, rest_group: 45 }, [ex1, ex2]),
    ]);
    const result = stripIds(buildExecutionPlan(w));

    // Bench1 → rest → Row1 → superset-rest → Bench2 → rest → Row2 → superset-rest
    expect(result).toHaveLength(8);
    expect(result[0]).toMatchObject({
      type: EXERCISE_STEP_TYPE,
      exerciseId: 1,
      set: 1,
    });
    expect(result[1]).toMatchObject({
      type: REST_STEP_TYPE,
      duration_seconds: 30,
    }); // Even index → exercise rest
    expect(result[2]).toMatchObject({
      type: EXERCISE_STEP_TYPE,
      exerciseId: 2,
      set: 1,
    });
    expect(result[3]).toMatchObject({
      type: REST_STEP_TYPE,
      name: "Superset Rest",
      duration_seconds: 45,
    }); // Odd index → superset rest
    expect(result[4]).toMatchObject({
      type: EXERCISE_STEP_TYPE,
      exerciseId: 1,
      set: 2,
    });
    expect(result[5]).toMatchObject({
      type: REST_STEP_TYPE,
      duration_seconds: 30,
    });
    expect(result[6]).toMatchObject({
      type: EXERCISE_STEP_TYPE,
      exerciseId: 2,
      set: 2,
    });
    expect(result[7]).toMatchObject({
      type: REST_STEP_TYPE,
      name: "Superset Rest",
      duration_seconds: 45,
    });
  });

  it("handles single exercise as standard sets", () => {
    const ex = exercise({ id: 1, name: "Solo", sets: 2, rest_time: 30 });
    const w = workout({}, [
      block({ type: SUPERSET_TYPE, rest_group: 45 }, [ex]),
    ]);
    const result = stripIds(buildExecutionPlan(w));

    // Solo1 → rest → Solo2 → rest
    expect(result).toHaveLength(4);
    expect(result[0]).toMatchObject({
      type: EXERCISE_STEP_TYPE,
      exerciseId: 1,
      set: 1,
    });
    expect(result[1]).toMatchObject({
      type: REST_STEP_TYPE,
      duration_seconds: 30,
    });
    expect(result[2]).toMatchObject({
      type: EXERCISE_STEP_TYPE,
      exerciseId: 1,
      set: 2,
    });
    expect(result[3]).toMatchObject({
      type: REST_STEP_TYPE,
      duration_seconds: 30,
    });
  });

  it("handles exercises with different set counts", () => {
    const ex1 = exercise({
      id: 1,
      name: "A",
      sets: 3,
      rest_time: 20,
      position: 0,
    });
    const ex2 = exercise({
      id: 2,
      name: "B",
      sets: 1,
      rest_time: 20,
      position: 1,
    });
    const w = workout({}, [
      block({ type: SUPERSET_TYPE, rest_group: 30 }, [ex1, ex2]),
    ]);
    const result = stripIds(buildExecutionPlan(w));

    // A1 → rest → B1 → superset-rest → A2 → rest → A3 → rest
    expect(result[0]).toMatchObject({ exerciseId: 1, set: 1 });
    expect(result[1]).toMatchObject({
      type: REST_STEP_TYPE,
      duration_seconds: 20,
    });
    expect(result[2]).toMatchObject({ exerciseId: 2, set: 1 });
    expect(result[3]).toMatchObject({
      type: REST_STEP_TYPE,
      name: "Superset Rest",
    });
    expect(result[4]).toMatchObject({ exerciseId: 1, set: 2 });
    expect(result[5]).toMatchObject({
      type: REST_STEP_TYPE,
      duration_seconds: 20,
    });
    expect(result[6]).toMatchObject({ exerciseId: 1, set: 3 });
  });
});

describe("circuit block", () => {
  it("runs exercises in rounds", () => {
    const ex1 = exercise({
      id: 1,
      name: "A",
      sets: 2,
      rest_time: 10,
      position: 0,
    });
    const ex2 = exercise({
      id: 2,
      name: "B",
      sets: 2,
      rest_time: 10,
      position: 1,
    });
    const w = workout({}, [
      block({ type: CIRCUIT_TYPE, rest_group: 30 }, [ex1, ex2]),
    ]);
    const result = stripIds(buildExecutionPlan(w));

    // Round1: A1 → rest → B1 → circuit-rest
    // Round2: A2 → rest → B2 (no circuit-rest after last round)
    expect(result).toHaveLength(7);
    expect(result[0]).toMatchObject({ exerciseId: 1, set: 1 });
    expect(result[1]).toMatchObject({
      type: REST_STEP_TYPE,
      duration_seconds: 10,
    });
    expect(result[2]).toMatchObject({ exerciseId: 2, set: 1 });
    expect(result[3]).toMatchObject({
      type: REST_STEP_TYPE,
      name: "Circuit Rest",
      duration_seconds: 30,
    });
    expect(result[4]).toMatchObject({ exerciseId: 1, set: 2 });
    expect(result[5]).toMatchObject({
      type: REST_STEP_TYPE,
      duration_seconds: 10,
    });
    expect(result[6]).toMatchObject({ exerciseId: 2, set: 2 });
  });

  it("handles exercises with different set counts", () => {
    const ex1 = exercise({
      id: 1,
      name: "A",
      sets: 3,
      rest_time: 5,
      position: 0,
    });
    const ex2 = exercise({
      id: 2,
      name: "B",
      sets: 2,
      rest_time: 5,
      position: 1,
    });
    const w = workout({}, [
      block({ type: CIRCUIT_TYPE, rest_group: 20 }, [ex1, ex2]),
    ]);
    const result = stripIds(buildExecutionPlan(w));

    // 3 rounds based on maxSets (3)
    // Round1: A1 → rest → B1 → circuit-rest
    // Round2: A2 → rest → B2 → circuit-rest
    // Round3: A3 → rest (no circuit-rest after last round)
    // Total: 5 exercise + 5 rest
    expect(result.filter((s) => s.type === EXERCISE_STEP_TYPE)).toHaveLength(5); // 3+2
    expect(result[result.length - 1]).toMatchObject({ type: REST_STEP_TYPE });
  });

  it("skips circuit rest on last round", () => {
    const ex = exercise({ id: 1, name: "A", sets: 1, rest_time: 0 });
    const w = workout({}, [
      block({ type: CIRCUIT_TYPE, rest_group: 30 }, [ex]),
    ]);
    const result = stripIds(buildExecutionPlan(w));

    expect(result).toHaveLength(1);
    expect(result[0].type).toBe(EXERCISE_STEP_TYPE);
  });
});

describe("flexible block", () => {
  it("creates a flexible-selection step with available exercises", () => {
    const ex1 = exercise({
      id: 1,
      name: "Pick Me",
      rest_time: 45,
      position: 0,
    });
    const ex2 = exercise({ id: 2, name: "Or Me", rest_time: 30, position: 1 });
    const w = workout({}, [block({ type: FLEXIBLE_TYPE }, [ex1, ex2])]);
    const result = stripIds(buildExecutionPlan(w));

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      type: "flexible-selection",
      blockId: 1,
      name: "Test Block",
      blockName: "Test Block",
      lastRestTime: 45, // max of 45 and 30
    });
    expect(result[0].availableExercises).toHaveLength(2);
    expect(result[0].availableExercises![0].id).toBe(1);
    expect(result[0].availableExercises![1].id).toBe(2);
  });

  it("uses 0 as lastRestTime when no exercises have rest_time", () => {
    const ex = exercise({ id: 1, name: "Quick", rest_time: 0 });
    const w = workout({}, [block({ type: FLEXIBLE_TYPE }, [ex])]);
    const result = stripIds(buildExecutionPlan(w));

    expect(result[0].lastRestTime).toBe(0);
  });

  it("skips prepare_time rest after flexible selection", () => {
    // prepare_time should be added, then flexible-selection step
    const ex = exercise({ id: 1, name: "Ex", rest_time: 0 });
    const w = workout({}, [
      block({ type: FLEXIBLE_TYPE, prepare_time: 15 }, [ex]),
    ]);
    const result = stripIds(buildExecutionPlan(w));

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      type: REST_STEP_TYPE,
      name: "Prepare for Test Block",
    });
    expect(result[1]).toMatchObject({ type: "flexible-selection" });
  });
});

describe("warmup / cooldown blocks", () => {
  it("treats warmup as standard block", () => {
    const ex = exercise({ sets: 1, rest_time: 0 });
    const w = workout({}, [block({ type: WARMUP_TYPE }, [ex])]);
    const result = stripIds(buildExecutionPlan(w));

    expect(result).toHaveLength(1);
    expect(result[0].type).toBe(EXERCISE_STEP_TYPE);
  });

  it("treats cooldown as standard block", () => {
    const ex = exercise({ sets: 2, rest_time: 0 });
    const w = workout({}, [block({ type: COOLDOWN_TYPE }, [ex])]);
    const result = stripIds(buildExecutionPlan(w));

    expect(result).toHaveLength(2);
  });
});

describe("mixed block types", () => {
  it("processes multiple blocks in position order", () => {
    const ex1 = exercise({ id: 1, sets: 1, rest_time: 0 });
    const ex2 = exercise({ id: 2, sets: 1, rest_time: 0 });
    const block1 = block(
      { id: 1, name: "First", position: 1, type: TRADITIONAL_TYPE },
      [ex1],
    );
    const block2 = block(
      { id: 2, name: "Second", position: 0, type: TRADITIONAL_TYPE },
      [ex2],
    );
    const w = workout({}, [block1, block2]);
    const result = stripIds(buildExecutionPlan(w));

    expect(result).toHaveLength(2);
    expect(result[0].blockId).toBe(2); // Second block (position 0)
    expect(result[1].blockId).toBe(1); // First block (position 1)
  });

  it("handles a full workout with mixed block types", () => {
    const warmupEx = exercise({
      id: 1,
      name: "Jacks",
      exercise_type: "time",
      exercise_time: 30,
      sets: 1,
      rest_time: 0,
    });
    const mainEx = exercise({ id: 2, name: "Squats", sets: 2, rest_time: 30 });
    const cooldownEx = exercise({
      id: 3,
      name: "Stretch",
      exercise_type: "time",
      exercise_time: 60,
      sets: 1,
      rest_time: 0,
    });
    const flexEx = exercise({ id: 4, name: "Choose", sets: 1, rest_time: 0 });

    const warmup = block(
      { id: 1, name: "Warm", type: WARMUP_TYPE, position: 0 },
      [warmupEx],
    );
    const main = block(
      { id: 2, name: "Main", type: TRADITIONAL_TYPE, position: 1 },
      [mainEx],
    );
    const flex = block(
      { id: 3, name: "Pick", type: FLEXIBLE_TYPE, position: 2 },
      [flexEx],
    );
    const cooldown = block(
      { id: 4, name: "Cool", type: COOLDOWN_TYPE, position: 3 },
      [cooldownEx],
    );
    const w = workout({}, [warmup, main, flex, cooldown]);

    const result = stripIds(buildExecutionPlan(w));

    // Jacks → Squats1 → rest → Squats2 → flexible-selection → Stretch
    expect(result).toHaveLength(6);
    expect(result[0]).toMatchObject({
      type: EXERCISE_STEP_TYPE,
      exerciseId: 1,
    });
    expect(result[1]).toMatchObject({
      type: EXERCISE_STEP_TYPE,
      exerciseId: 2,
      set: 1,
    });
    expect(result[2]).toMatchObject({ type: REST_STEP_TYPE });
    expect(result[3]).toMatchObject({
      type: EXERCISE_STEP_TYPE,
      exerciseId: 2,
      set: 2,
    });
    expect(result[4]).toMatchObject({ type: "flexible-selection" });
    expect(result[5]).toMatchObject({
      type: EXERCISE_STEP_TYPE,
      exerciseId: 3,
    });
  });
});
