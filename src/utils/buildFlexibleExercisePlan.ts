import { ExecutionStep, UIExercise } from "../types/ui";

function getSetMetrics(exercise: UIExercise, setIndex: number) {
  if (exercise.config_type === "complex" && exercise.sets_data?.[setIndex]) {
    const setData = exercise.sets_data[setIndex];
    return {
      last_reps: setData.last_reps,
      min_reps: setData.min_reps,
      max_reps: setData.max_reps,
      weight: setData.weight,
      time_seconds: setData.time_seconds,
      rest_time: setData.rest_time,
    };
  }

  return {
    last_reps: exercise.last_reps,
    min_reps: exercise.min_reps,
    max_reps: exercise.max_reps,
    weight: exercise.weight,
    time_seconds: exercise.exercise_time,
    rest_time: exercise.rest_time,
  };
}

export function buildFlexibleExercisePlan(
  exercise: UIExercise,
  blockId: string | number,
): ExecutionStep[] {
  const plan: ExecutionStep[] = [];

  for (let s = 0; s < (exercise.sets || 1); s++) {
    const metrics = getSetMetrics(exercise, s);

    plan.push({
      id: `flex-${blockId}-${exercise.id}-${s}`,
      type: "exercise",
      blockId,
      exerciseId: exercise.id,
      name: exercise.name,
      last_reps: metrics.last_reps,
      min_reps: metrics.min_reps,
      max_reps: metrics.max_reps,
      weight: metrics.weight,
      time_seconds: metrics.time_seconds,
      set: s + 1,
      totalSets: exercise.sets || 1,
      sets_data: exercise.sets_data,
    });

    if (s < (exercise.sets || 1) - 1 && metrics.rest_time > 0) {
      plan.push({
        id: `flex-rest-${blockId}-${exercise.id}-${s}`,
        type: "rest",
        blockId,
        name: "Rest",
        duration_seconds: metrics.rest_time,
      });
    }
  }

  return plan;
}
