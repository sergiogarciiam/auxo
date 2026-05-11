import { ExecutionStep, UIExercise } from "../types/ui";

export function buildFlexibleExercisePlan(
  exercise: UIExercise,
  blockId: string | number,
): ExecutionStep[] {
  const plan: ExecutionStep[] = [];

  for (let s = 0; s < (exercise.sets || 1); s++) {
    plan.push({
      id: `flex-${blockId}-${exercise.id}-${s}`,
      type: "exercise",
      blockId,
      exerciseId: exercise.id,
      name: exercise.name,
      last_reps: exercise.last_reps,
      min_reps: exercise.min_reps,
      max_reps: exercise.max_reps,
      weight: exercise.weight,
      time_seconds: exercise.exercise_time,
      set: s + 1,
      totalSets: exercise.sets || 1,
    });

    if (s < exercise.sets - 1 && exercise.rest_time > 0) {
      plan.push({
        id: `flex-rest-${blockId}-${exercise.id}-${s}`,
        type: "rest",
        blockId,
        name: "Rest",
        duration_seconds: exercise.rest_time,
      });
    }
  }

  return plan;
}
