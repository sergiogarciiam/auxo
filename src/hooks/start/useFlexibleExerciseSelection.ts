import { useCallback, useState } from "react";
import { ExecutionStep, UIExercise } from "../../types/ui";
import { buildFlexibleExercisePlan } from "../../utils/buildFlexibleExercisePlan";

export function useFlexibleExerciseSelection() {
  const [flexPlan, setFlexPlan] = useState<ExecutionStep[]>([]);
  const [flexIndex, setFlexIndex] = useState(0);
  const [selectedExercise, setSelectedExercise] = useState<UIExercise | null>();

  const handleSelectFlexible = useCallback(
    (exercise: UIExercise, mainBlockId: string) => {
      const plan = buildFlexibleExercisePlan(exercise, mainBlockId);
      setSelectedExercise(exercise);
      setFlexPlan(plan);
      setFlexIndex(0);
    },
    [],
  );

  const resetFlexPlan = useCallback(() => {
    setFlexPlan([]);
    setFlexIndex(0);
    setSelectedExercise(null);
  }, []);

  const nextFlexIndex = useCallback(() => {
    setFlexIndex((p) => p + 1);
  }, []);

  const prevFlexIndex = useCallback(() => {
    setFlexIndex((p) => p - 1);
  }, []);

  const updateFlexPlanSteps = useCallback(
    (
      exerciseId: number | string,
      updates: {
        last_reps?: number | null;
        weight?: number | null;
        sets_data?: {
          last_reps: number;
          weight: number;
          min_reps: number;
          max_reps: number;
          time_seconds: number;
          rest_time: number;
        }[];
      },
    ) => {
      setFlexPlan((prev) =>
        prev.map((step) =>
          step.exerciseId !== undefined &&
          String(step.exerciseId) === String(exerciseId)
            ? { ...step, ...updates }
            : step,
        ),
      );
    },
    [],
  );

  return {
    flexPlan,
    flexIndex,
    selectedExercise,
    isRunningFlexibleExercise: flexPlan.length > 0,
    isLastFlexIndex: flexIndex >= flexPlan.length - 1,
    handleSelectFlexible,
    resetFlexPlan,
    nextFlexIndex,
    prevFlexIndex,
    updateFlexPlanSteps,
  };
}
