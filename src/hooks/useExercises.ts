import { useCallback } from "react";
import { exerciseRepository } from "../repositories/exerciseRepository";
import {
  CreateExercisePayload,
  UpdateExercisePayload,
} from "../types/exercise";

export const useExercises = () => {
  /**
   * Creates a new exercise
   */
  const createExercise = useCallback(
    async (exerciseData: CreateExercisePayload) => {
      try {
        await exerciseRepository.create(exerciseData);
      } catch (error) {
        console.error("Failed to create exercise:", error);
        throw error;
      }
    },
    [],
  );

  /**
   * Updates an existing exercise
   */
  const updateExercise = useCallback(
    async (exerciseData: UpdateExercisePayload) => {
      try {
        await exerciseRepository.update(exerciseData);
      } catch (error) {
        console.error("Failed to update exercise:", error);
        throw error;
      }
    },
    [],
  );

  /**
   * Deletes an exercise
   */
  const deleteExercise = useCallback(async (id: number) => {
    try {
      await exerciseRepository.delete({ id });
    } catch (error) {
      console.error("Failed to delete exercise:", error);
      throw error;
    }
  }, []);

  return {
    createExercise,
    updateExercise,
    deleteExercise,
  };
};
