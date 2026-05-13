import { nanoid } from "nanoid/non-secure";
import {
  CIRCUIT_TYPE,
  EXERCISE_STEP_TYPE,
  FLEXIBLE_TYPE,
  LOCAL_STATUS_DELETED,
  REST_STEP_TYPE,
  SUPERSET_TYPE,
} from "../constants/constants";
import { ExecutionStep, UIExercise, UIWorkout } from "../types/ui";

/**
 * Get exercise metrics for a specific set
 * Handles both SIMPLE mode (single values) and COMPLEX mode (per-set data)
 */
function getExerciseMetricsForSet(exercise: UIExercise, setIndex: number) {
  if (exercise.config_type === "complex" && exercise.sets_data?.[setIndex]) {
    const setData = exercise.sets_data[setIndex];
    return {
      exercise_type: exercise.exercise_type,
      last_reps: setData.last_reps,
      min_reps: setData.min_reps,
      max_reps: setData.max_reps,
      time_seconds: setData.time_seconds,
      weight: setData.weight,
      rest_time: setData.rest_time,
    };
  }

  // SIMPLE mode: use base values
  return {
    exercise_type: exercise.exercise_type,
    last_reps: exercise.last_reps,
    min_reps: exercise.min_reps,
    max_reps: exercise.max_reps,
    time_seconds: exercise.exercise_time,
    weight: exercise.weight,
    rest_time: exercise.rest_time,
  };
}

export function buildExecutionPlan(workout: UIWorkout): ExecutionStep[] {
  const plan: ExecutionStep[] = [];

  const blocks = [...workout.blocks]
    .filter((s) => s.localStatus !== LOCAL_STATUS_DELETED)
    .sort((a, b) => a.position - b.position);

  blocks.forEach((block) => {
    const exercises = (block.exercises || [])
      .filter((e) => e.localStatus !== LOCAL_STATUS_DELETED)
      .sort((a, b) => a.position - b.position);

    if (exercises.length === 0) return;

    if (block.prepare_time > 0) {
      plan.push({
        id: nanoid(),
        type: REST_STEP_TYPE,
        blockId: block.id,
        name: `Prepare for ${block.name}`,
        duration_seconds: block.prepare_time,
      });
    }

    // FLEXIBLE PLANNING - User selects exercises on the fly
    if (block.type === FLEXIBLE_TYPE) {
      // Get last rest time from any exercise in the block for final rest
      const lastRestTime = Math.max(
        ...exercises.map((ex) => ex.rest_time || 0),
        0,
      );

      plan.push({
        id: nanoid(),
        type: "flexible-selection" as const,
        blockId: block.id,
        name: block.name,
        blockName: block.name,
        availableExercises: exercises,
        lastRestTime: lastRestTime,
      });
      return; // Skip all other type handling
    }

    // SUPERSET PLANNING
    if (block.type === SUPERSET_TYPE) {
      const queue = exercises.map((ex) => ({
        ...ex,
        remainingSets: ex.sets || 0,
        completedSets: 0,
      }));

      let first = 0;
      let second = exercises.length > 1 ? 1 : 0;
      let nextExercise = true;

      while (queue.some((ex) => ex.remainingSets > 0)) {
        let activeExercise = nextExercise ? first : second;

        if (queue[activeExercise].remainingSets === 0) {
          activeExercise = nextExercise ? second : first;

          if (queue[activeExercise]?.remainingSets === 0) {
            const nextIndex = queue.findIndex((ex) => ex.remainingSets > 0);
            if (nextIndex === -1) break;
            first = nextIndex;
            second = nextIndex + 1 < queue.length ? nextIndex + 1 : nextIndex;
            activeExercise = first;
          }
        }

        const exercise = exercises[activeExercise];
        const setIndex = queue[activeExercise].completedSets;
        const metrics = getExerciseMetricsForSet(exercise, setIndex);

        plan.push({
          id: nanoid(),
          type: EXERCISE_STEP_TYPE,
          blockId: block.id,
          exerciseId: exercise.id,
          name: exercise.name,
          exercise_type: exercise.exercise_type,
          last_reps: metrics.last_reps,
          min_reps: metrics.min_reps,
          max_reps: metrics.max_reps,
          time_seconds: metrics.time_seconds,
          weight: metrics.weight,
          set: setIndex + 1,
          totalSets: exercise.sets || 0,
          sets_data: exercise.sets_data,
        });

        if (activeExercise % 2 === 0 && metrics.rest_time > 0) {
          plan.push({
            id: nanoid(),
            type: REST_STEP_TYPE,
            blockId: block.id,
            name: "Rest",
            duration_seconds: metrics.rest_time,
          });
        } else if (activeExercise % 2 !== 0 && block.rest_group > 0) {
          plan.push({
            id: nanoid(),
            type: REST_STEP_TYPE,
            blockId: block.id,
            name: "Superset Rest",
            duration_seconds: block.rest_group,
          });
        }

        queue[activeExercise].remainingSets -= 1;
        queue[activeExercise].completedSets += 1;

        nextExercise = !nextExercise;
      }

      // CIRCUIT PLANNING
    } else if (block.type === CIRCUIT_TYPE) {
      const maxSets = Math.max(...exercises.map((e) => e.sets || 0));
      for (let round = 0; round < maxSets; round++) {
        exercises.forEach((ex, idx) => {
          if ((ex.sets || 0) > round) {
            const metrics = getExerciseMetricsForSet(ex, round);

            plan.push({
              id: nanoid(),
              type: EXERCISE_STEP_TYPE,
              blockId: block.id,
              exerciseId: ex.id,
              name: ex.name,
              exercise_type: metrics.exercise_type,
              last_reps: metrics.last_reps,
              min_reps: metrics.min_reps,
              max_reps: metrics.max_reps,
              time_seconds: metrics.time_seconds,
              weight: metrics.weight,
              set: round + 1,
              totalSets: ex.sets || 0,
              sets_data: ex.sets_data,
            });

            // rest between exercises in circuit
            if (metrics.rest_time > 0 && idx < exercises.length - 1) {
              plan.push({
                id: nanoid(),
                type: REST_STEP_TYPE,
                blockId: block.id,
                name: "Rest",
                duration_seconds: metrics.rest_time,
              });
            }
          }
        });

        if (round < maxSets - 1 && block.rest_group > 0) {
          plan.push({
            id: nanoid(),
            type: REST_STEP_TYPE,
            blockId: block.id,
            name: "Circuit Rest",
            duration_seconds: block.rest_group,
          });
        }
      }

      // STANDARD PLANNING
    } else {
      exercises.forEach((ex, exIdx) => {
        for (let s = 0; s < (ex.sets || 0); s++) {
          const metrics = getExerciseMetricsForSet(ex, s);

          plan.push({
            id: nanoid(),
            type: EXERCISE_STEP_TYPE,
            blockId: block.id,
            exerciseId: ex.id,
            name: ex.name,
            exercise_type: ex.exercise_type,
            last_reps: metrics.last_reps,
            min_reps: metrics.min_reps,
            max_reps: metrics.max_reps,
            time_seconds: metrics.time_seconds,
            weight: metrics.weight,
            set: s + 1,
            totalSets: ex.sets || 0,
            sets_data: ex.sets_data,
          });

          // rest between sets
          if (s < (ex.sets || 0) - 1 && metrics.rest_time > 0) {
            plan.push({
              id: nanoid(),
              type: REST_STEP_TYPE,
              blockId: block.id,
              name: "Rest",
              duration_seconds: metrics.rest_time,
            });
          }
        }

        // rest between exercises
        if (exIdx < exercises.length - 1) {
          const lastSet = ex.sets ? ex.sets - 1 : 0;
          const lastMetrics = getExerciseMetricsForSet(ex, lastSet);
          if (lastMetrics.rest_time > 0) {
            plan.push({
              id: nanoid(),
              type: REST_STEP_TYPE,
              blockId: block.id,
              name: "Rest",
              duration_seconds: lastMetrics.rest_time,
            });
          }
        }
      });
    }
  });

  return plan;
}
