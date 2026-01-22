import { useMemo } from "react";
import { UISection } from "../types/ui";

export const useOrderedExercises = (section?: UISection | null) => {
  return useMemo(() => {
    if (!section) return [];

    return section.exercises
      .filter((e) => e.localStatus !== "deleted")
      .sort((a, b) => a.position - b.position);
  }, [section]);
};
