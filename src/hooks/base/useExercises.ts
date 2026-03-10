import { useCallback, useEffect, useState } from "react";
import { exerciseRepository } from "../../repositories/exerciseRepository";
import {
  CreateExercisePayload,
  Exercise,
  UpdateExercisePayload,
} from "../../types/exercise";

export const useExercises = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);

  const fetchExercises = useCallback(async () => {
    try {
      const data = await exerciseRepository.getAll();
      setExercises(data);
    } catch (error) {
      console.error("Failed to fetch exercises:", error);
      throw error;
    }
  }, []);

  const createExercise = useCallback(
    async (exerciseData: CreateExercisePayload) => {
      try {
        const result = await exerciseRepository.create(exerciseData);
        await fetchExercises();
        return result.lastInsertRowId;
      } catch (error) {
        console.error("Failed to create exercise:", error);
        throw error;
      }
    },
    [fetchExercises],
  );

  const updateExercise = useCallback(
    async (exerciseData: UpdateExercisePayload) => {
      try {
        await exerciseRepository.update(exerciseData);
        await fetchExercises();
      } catch (error) {
        console.error("Failed to update exercise:", error);
        throw error;
      }
    },
    [fetchExercises],
  );

  const deleteExercise = useCallback(
    async (id: number) => {
      try {
        await exerciseRepository.delete({ id });
        await fetchExercises();
      } catch (error) {
        console.error("Failed to delete exercise:", error);
        throw error;
      }
    },
    [fetchExercises],
  );

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  return {
    exercises,
    createExercise,
    updateExercise,
    deleteExercise,
  };
};
