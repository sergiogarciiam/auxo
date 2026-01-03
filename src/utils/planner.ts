import { nanoid } from "nanoid/non-secure";
import { ExecutionStep, UIWorkout } from "../types/ui";

export function buildExecutionPlan(workout: UIWorkout): ExecutionStep[] {
  const plan: ExecutionStep[] = [];

  const sections = [...workout.sections]
    .filter((s) => s.localStatus !== "deleted")
    .sort((a, b) => a.position - b.position);

  sections.forEach((section) => {
    const exercises = (section.exercises || [])
      .filter((e) => e.localStatus !== "deleted")
      .sort((a, b) => a.position - b.position);

    if (exercises.length === 0) return;

    // SUPERSET PLANNING
    if (section.type === "superset") {
      const pairExercises = [];

      for (let i = 0; i < exercises.length; i += 2) {
        const first = exercises[i];
        const second = exercises[i + 1];
        pairExercises.push([first, second]);
      }

      const maxSets = Math.max(...exercises.map((e) => e.sets || 0));
      for (let setIdx = 0; setIdx < maxSets; setIdx++) {
        exercises.forEach((ex) => {
          if ((ex.sets || 0) > setIdx) {
            plan.push({
              id: nanoid(),
              type: "exercise",
              sectionId: section.id,
              exerciseId: ex.id,
              name: ex.name,
              reps: ex.reps,
              time_seconds: ex.time_seconds,
              weight: ex.weight,
              set: setIdx + 1,
            });
          }
        });

        if (setIdx < maxSets - 1 && section.rest_group > 0) {
          plan.push({
            id: nanoid(),
            type: "rest",
            sectionId: section.id,
            name: "Rest",
            duration_seconds: section.rest_group,
          });
        }
      }

      // CIRCUIT PLANNING
    } else if (section.type === "circuit") {
      const maxSets = Math.max(...exercises.map((e) => e.sets || 0));
      for (let round = 0; round < maxSets; round++) {
        exercises.forEach((ex, idx) => {
          if ((ex.sets || 0) > round) {
            plan.push({
              id: nanoid(),
              type: "exercise",
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
                type: "rest",
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
            type: "rest",
            sectionId: section.id,
            name: "Round Rest",
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
            type: "exercise",
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
              type: "rest",
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
            type: "rest",
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
