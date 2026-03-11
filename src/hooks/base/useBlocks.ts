import { useCallback, useEffect, useState } from "react";
import { blockRepository } from "../../repositories/blockRepository";
import {
  Block,
  CreateBlockPayload,
  UpdateBlockPayload,
} from "../../types/block";

export const useBlocks = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);

  const fetchBlocks = useCallback(async () => {
    try {
      const data = await blockRepository.getAll();
      setBlocks(data);
    } catch (error) {
      console.error("Failed to fetch blocks:", error);
      throw error;
    }
  }, []);

  const getBlockById = useCallback(async (id: number) => {
    try {
      const block = await blockRepository.getById({ id });
      return block;
    } catch (error) {
      console.error("Failed to fetch block:", error);
      throw error;
    }
  }, []);

  const createBlock = useCallback(
    async (blockData: CreateBlockPayload) => {
      try {
        const result = await blockRepository.create(blockData);
        await fetchBlocks();
        return result.lastInsertRowId;
      } catch (error) {
        console.error("Failed to create block:", error);
        throw error;
      }
    },
    [fetchBlocks],
  );

  const updateBlock = useCallback(
    async (blockData: UpdateBlockPayload) => {
      try {
        await blockRepository.update(blockData);
        await fetchBlocks();
      } catch (error) {
        console.error("Failed to update block:", error);
        throw error;
      }
    },
    [fetchBlocks],
  );

  const deleteBlock = useCallback(
    async (id: number) => {
      try {
        await blockRepository.delete({ id });
        await fetchBlocks();
      } catch (error) {
        console.error("Failed to delete block:", error);
        throw error;
      }
    },
    [fetchBlocks],
  );

  const getAllExercisesByBlockId = useCallback(async (block_id: number) => {
    try {
      const exercises = await blockRepository.getAllExercisesByBlockId({
        block_id,
      });
      return exercises;
    } catch (error) {
      console.error("Failed to fetch exercises:", error);
      throw error;
    }
  }, []);

  useEffect(() => {
    fetchBlocks();
  }, [fetchBlocks]);

  return {
    blocks,
    fetchBlocks,
    getBlockById,
    createBlock,
    updateBlock,
    deleteBlock,
    getAllExercisesByBlockId,
  };
};
