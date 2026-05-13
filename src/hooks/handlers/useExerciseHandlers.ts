import { useCallback } from "react";
import { UIExercise } from "../../types/ui";

interface UseExerciseHandlersProps {
  exercise: UIExercise;
  exerciseId: string;
  configType: string;
  setExercise: (id: string, exercise: Partial<UIExercise>) => void;
}

export function useExerciseHandlers({
  exercise,
  exerciseId,
  configType,
  setExercise,
}: UseExerciseHandlersProps) {
  const handleInputChange = useCallback(
    (field: keyof UIExercise, value: any) => {
      setExercise(exerciseId, { [field]: value });
    },
    [exerciseId, setExercise],
  );

  const handleExerciseTypeChange = useCallback(
    (option: any) => {
      const value = option?.value ?? option;
      handleInputChange("exercise_type", value);
    },
    [handleInputChange],
  );

  const handleConfigTypeChange = useCallback(
    (option: any) => {
      const value = option?.value ?? option;
      handleInputChange("config_type", value);

      if (value === "complex") {
        const sets = exercise.sets || 1;
        const setsData = Array.from({ length: sets }, () => ({
          min_reps: exercise.min_reps ?? 0,
          max_reps: exercise.max_reps ?? 0,
          last_reps: exercise.last_reps ?? 0,
          time_seconds: exercise.exercise_time ?? 0,
          weight: exercise.weight ?? 0,
          rest_time: exercise.rest_time ?? 0,
        }));
        handleInputChange("sets_data", setsData);
      }

      if (value === "simple") {
        handleInputChange("sets_data", undefined);
      }
    },
    [exercise, handleInputChange],
  );

  const handleSetChange = useCallback(
    (setIndex: number, field: string, value: number) => {
      const current = exercise.sets_data || [];
      const targetLength = Math.max(
        current.length,
        setIndex + 1,
        exercise.sets || 1,
      );
      const padding = targetLength - current.length;

      const padded =
        padding > 0
          ? [
              ...current,
              ...Array.from({ length: padding }, () => ({
                min_reps: exercise.min_reps ?? 0,
                max_reps: exercise.max_reps ?? 0,
                last_reps: exercise.last_reps ?? 0,
                time_seconds: exercise.exercise_time ?? 0,
                weight: exercise.weight ?? 0,
                rest_time: exercise.rest_time ?? 0,
              })),
            ]
          : current;

      const updated = padded.map((set, i) =>
        i === setIndex ? { ...set, [field]: value } : set,
      );
      handleInputChange("sets_data", updated);
    },
    [exercise, handleInputChange],
  );

  const handleSetsChange = useCallback(
    (newSets: number) => {
      handleInputChange("sets", newSets);

      if (configType !== "complex") return;

      const current = exercise.sets_data || [];
      let updated = [...current];

      if (newSets > current.length) {
        updated = [
          ...current,
          ...Array.from({ length: newSets - current.length }, () => ({
            min_reps: exercise.min_reps ?? 0,
            max_reps: exercise.max_reps ?? 0,
            last_reps: exercise.last_reps ?? 0,
            time_seconds: exercise.exercise_time ?? 0,
            weight: exercise.weight ?? 0,
            rest_time: exercise.rest_time ?? 0,
          })),
        ];
      } else {
        updated = current.slice(0, newSets);
      }

      handleInputChange("sets_data", updated);
    },
    [configType, exercise, handleInputChange],
  );

  return {
    handleInputChange,
    handleExerciseTypeChange,
    handleConfigTypeChange,
    handleSetChange,
    handleSetsChange,
  };
}
