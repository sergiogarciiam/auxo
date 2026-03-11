import { useEffect, useState } from "react";
import { useWorkoutStore } from "../../stores/useWorkoutStore";

export const useBlockLifecycle = (initialBlockId?: string) => {
  const { block, loadBlock, startNewBlock } = useWorkoutStore();

  const [blockId, setBlockId] = useState<string | null>(initialBlockId ?? null);

  useEffect(() => {
    if (blockId) {
      loadBlock(blockId);
    } else {
      const newBlock = startNewBlock(`temp-${Date.now()}`);
      if (newBlock) setBlockId(newBlock.id.toString());
    }
  }, [blockId, loadBlock, startNewBlock]);

  return { block, blockId };
};
