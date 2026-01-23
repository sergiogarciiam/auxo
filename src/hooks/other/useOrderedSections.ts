// hooks/useOrderedSections.ts
import { useMemo } from "react";
import {
  LOCAL_STATUS_DELETED,
  LOCAL_STATUS_NEW,
} from "../../constants/constants";
import { UIWorkout } from "../../types/ui";

export const useOrderedSections = (workout?: UIWorkout | null) => {
  return useMemo(() => {
    if (!workout) return [];

    return workout.sections
      .filter(
        (s) =>
          s.localStatus !== LOCAL_STATUS_DELETED &&
          !(s.localStatus === LOCAL_STATUS_NEW && !s.name?.trim()),
      )
      .sort((a, b) => a.position - b.position);
  }, [workout]);
};
