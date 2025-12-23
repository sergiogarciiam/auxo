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

    if (section.type === "superset") {
      // Superset: perform exercises back-to-back (no rest between exercises),
      // repeat for the number of sets (max sets among exercises). After each set (group), apply rest_group.
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
    } else if (section.type === "circuit") {
      // Circuit: perform each exercise once per round, include rest_exercise between exercises,
      // after finishing a round, apply rest_group if more rounds remain.
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
    } else {
      // traditional, warmup, cooldown or default: do each exercise with its sets sequentially,
      // add rest_exercise between sets and between exercises
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

    // After finishing section, add group rest if defined (but not if last section)
    // Note: caller may want to handle global sequencing; we leave group rest insertion to per-type logic
  });

  return plan;
}
