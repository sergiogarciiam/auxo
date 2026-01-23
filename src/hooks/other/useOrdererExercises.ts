import { useMemo } from "react";
import { LOCAL_STATUS_DELETED } from "../../constants/constants";
import { UISection } from "../../types/ui";

export const useOrderedExercises = (section?: UISection | null) => {
  return useMemo(() => {
    if (!section) return [];

    return section.exercises
      .filter((e) => e.localStatus !== LOCAL_STATUS_DELETED)
      .sort((a, b) => a.position - b.position);
  }, [section]);
};
