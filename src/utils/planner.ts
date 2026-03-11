import { nanoid } from "nanoid/non-secure";
import {
  CIRCUIT_TYPE,
  EXERCISE_STEP_TYPE,
  LOCAL_STATUS_DELETED,
  REST_STEP_TYPE,
  SUPERSET_TYPE,
} from "../constants/constants";
import { ExecutionStep, UIWorkout } from "../types/ui";

export function buildExecutionPlan(workout: UIWorkout): ExecutionStep[] {
  const plan: ExecutionStep[] = [];

  const sections = [...workout.sections]
    .filter((s) => s.localStatus !== LOCAL_STATUS_DELETED)
    .sort((a, b) => a.position - b.position);

  sections.forEach((section) => {
    const exercises = (section.exercises || [])
      .filter((e) => e.localStatus !== LOCAL_STATUS_DELETED)
      .sort((a, b) => a.position - b.position);

    if (exercises.length === 0) return;

    if (section.prepare_time > 0) {
      plan.push({
        id: nanoid(),
        type: REST_STEP_TYPE,
        sectionId: section.id,
        name: `Prepare for ${section.name}`,
        duration_seconds: section.prepare_time,
      });
    }

    // SUPERSET PLANNING
    if (section.type === SUPERSET_TYPE) {
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
            if (nextIndex === -1) break; // ya no quedan sets
            first = nextIndex;
            second = nextIndex + 1 < queue.length ? nextIndex + 1 : nextIndex;
            activeExercise = first;
          }
        }

        const exercise = exercises[activeExercise];

        plan.push({
          id: nanoid(),
          type: EXERCISE_STEP_TYPE,
          sectionId: section.id,
          exerciseId: exercise.id,
          name: exercise.name,
          reps: exercise.reps,
          time_seconds: exercise.time_seconds,
          weight: exercise.weight,
          set: queue[activeExercise].completedSets + 1,
        });

        if (activeExercise % 2 === 0 && section.rest_exercise > 0) {
          plan.push({
            id: nanoid(),
            type: REST_STEP_TYPE,
            sectionId: section.id,
            name: "Rest",
            duration_seconds: section.rest_exercise,
          });
        } else if (activeExercise % 2 !== 0 && section.rest_group > 0) {
          plan.push({
            id: nanoid(),
            type: REST_STEP_TYPE,
            sectionId: section.id,
            name: "Superset Rest",
            duration_seconds: section.rest_group,
          });
        }

        queue[activeExercise].remainingSets -= 1;
        queue[activeExercise].completedSets += 1;

        nextExercise = !nextExercise;
      }

      // CIRCUIT PLANNING
    } else if (section.type === CIRCUIT_TYPE) {
      const maxSets = Math.max(...exercises.map((e) => e.sets || 0));
      for (let round = 0; round < maxSets; round++) {
        exercises.forEach((ex, idx) => {
          if ((ex.sets || 0) > round) {
            plan.push({
              id: nanoid(),
              type: EXERCISE_STEP_TYPE,
              sectionId: section.id,
              exerciseId: ex.id,
              name: ex.name,
              reps: ex.reps,
              time_seconds: ex.time_seconds,
              weight: ex.weight,
              set: round + 1,
            });

            // rest between exercises in circuit
            if (section.rest_exercise > 0 && idx < exercises.length - 1) {
              plan.push({
                id: nanoid(),
                type: REST_STEP_TYPE,
                sectionId: section.id,
                name: "Rest",
                duration_seconds: section.rest_exercise,
              });
            }
          }
        });

        if (round < maxSets - 1 && section.rest_group > 0) {
          plan.push({
            id: nanoid(),
            type: REST_STEP_TYPE,
            sectionId: section.id,
            name: "Circuit Rest",
            duration_seconds: section.rest_group,
          });
        }
      }

      // STANDARD PLANNING
    } else {
      exercises.forEach((ex, exIdx) => {
        for (let s = 0; s < (ex.sets || 0); s++) {
          plan.push({
            id: nanoid(),
            type: EXERCISE_STEP_TYPE,
            sectionId: section.id,
            exerciseId: ex.id,
            name: ex.name,
            reps: ex.reps,
            time_seconds: ex.time_seconds,
            weight: ex.weight,
            set: s + 1,
          });

          // rest between sets
          if (s < (ex.sets || 0) - 1 && section.rest_exercise > 0) {
            plan.push({
              id: nanoid(),
              type: REST_STEP_TYPE,
              sectionId: section.id,
              name: "Rest",
              duration_seconds: section.rest_exercise,
            });
          }
        }

        // rest between exercises
        if (exIdx < exercises.length - 1 && section.rest_exercise > 0) {
          plan.push({
            id: nanoid(),
            type: REST_STEP_TYPE,
            sectionId: section.id,
            name: "Rest",
            duration_seconds: section.rest_exercise,
          });
        }
      });
    }
  });

  return plan;
}
