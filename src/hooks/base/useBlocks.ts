import { Exercise } from "@/src/types/exercise";
import { useEffect } from "react";
import { blockRepository } from "../../repositories/blockRepository";
import {
  Block,
  CreateBlockPayload,
  UpdateBlockPayload,
} from "../../types/block";
import { createCRUDHook } from "./createCRUDHook";

const useCRUD = createCRUDHook<Block, CreateBlockPayload, UpdateBlockPayload>(
  blockRepository,
  { entityName: "Block" },
);

export const useBlocks = () => {
  const {
    items,
    isLoading,
    fetchItems: fetchBlocks,
    getItemById: getBlockById,
    createItem: createBlock,
    updateItem: updateBlock,
    deleteItem: deleteBlock,
  } = useCRUD();

  useEffect(() => {
    fetchBlocks();
  }, [fetchBlocks]);

  // Additional specialized methods beyond basic CRUD
  const getAllExercisesByBlockId = (block_id: number): Promise<Exercise[]> =>
    blockRepository.getAllExercisesByBlockId({ block_id }).catch((error) => {
      console.error("Failed to fetch exercises:", error);
      throw error;
    });

  return {
    blocks: items,
    fetchBlocks,
    getBlockById,
    createBlock,
    updateBlock,
    deleteBlock,
    getAllExercisesByBlockId,
    isLoading,
  };
};
