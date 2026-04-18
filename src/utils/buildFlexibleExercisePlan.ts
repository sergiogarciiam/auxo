export function buildFlexibleExercisePlan(exercise, blockId) {
  const plan = [];

  for (let s = 0; s < (exercise.sets || 1); s++) {
    plan.push({
      type: "exercise",
      blockId,
      exerciseId: exercise.id,
      name: exercise.name,
      reps: exercise.reps,
      time_seconds: exercise.exercise_time,
      set: s + 1,
    });

    if (s < exercise.sets - 1 && exercise.rest_time > 0) {
      plan.push({
        type: "rest",
        name: "Rest",
        duration_seconds: exercise.rest_time,
      });
    }
  }

  return plan;
}
