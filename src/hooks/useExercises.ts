import { useCallback } from "react";
import { exerciseRepository } from "../repositories/exerciseRepository";
import {
  CreateExercisePayload,
  Exercise,
  UpdateExercisePayload,
} from "../types/exercise";

export const useExercises = () => {
  /**
   * Fetches all exercises for a section
   */
  const getExercisesBySectionId = useCallback(
    async (section_id: number): Promise<Exercise[]> => {
      try {
        const exercises = await exerciseRepository.getBySectionId({
          section_id,
        });
        return exercises;
      } catch (error) {
        console.error("Failed to fetch exercises:", error);
        throw error;
      }
    },
    [],
  );

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
    getExercisesBySectionId,
    createExercise,
    updateExercise,
    deleteExercise,
  };
};
