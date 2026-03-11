import { useMemo } from "react";
import { LOCAL_STATUS_DELETED } from "../../constants/constants";
import { UIBlock } from "../../types/ui";

export const useOrderedExercises = (block?: UIBlock | null) => {
  return useMemo(() => {
    if (!block) return [];

    return block.exercises
      .filter((e) => e.localStatus !== LOCAL_STATUS_DELETED)
      .sort((a, b) => a.position - b.position);
  }, [block]);
};
