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
  const crud = useCRUD();

  // Additional specialized methods beyond basic CRUD
  const getAllExercisesByBlockId = (block_id: number): Promise<Exercise[]> =>
    blockRepository.getAllExercisesByBlockId({ block_id }).catch((error) => {
      console.error("Failed to fetch exercises:", error);
      throw error;
    });

  // Auto-fetch on mount
  useEffect(() => {
    crud.fetchItems();
  }, []);

  return {
    blocks: crud.items,
    fetchBlocks: crud.fetchItems,
    getBlockById: crud.getItemById,
    createBlock: crud.createItem,
    updateBlock: crud.updateItem,
    deleteBlock: crud.deleteItem,
    getAllExercisesByBlockId,
    isLoading: crud.isLoading,
  };
};
