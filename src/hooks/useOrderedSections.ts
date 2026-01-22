// hooks/useOrderedSections.ts
import { useMemo } from "react";
import { UIWorkout } from "../types/ui";

export const useOrderedSections = (workout?: UIWorkout | null) => {
  return useMemo(() => {
    if (!workout) return [];

    return workout.sections
      .filter(
        (s) =>
          s.localStatus !== "deleted" &&
          !(s.localStatus === "new" && !s.name?.trim()),
      )
      .sort((a, b) => a.position - b.position);
  }, [workout]);
};
