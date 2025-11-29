import { exerciseRepository } from "../repositories/exerciseRepository";
import {
  CreateExerciseInterface,
  ExerciseIdType,
  UpdateExerciseInterface,
} from "../types/exercise";

export const useExercise = () => {
  const getExercisesBySectionId = async (section_id: number) => {
    const exercises = await exerciseRepository.getBySectionId({ section_id });
    return exercises;
  };

  const createExercise = async (exerciseData: CreateExerciseInterface) => {
    await exerciseRepository.create(exerciseData);
  };

  const updateExercise = async (exerciseData: UpdateExerciseInterface) => {
    await exerciseRepository.update(exerciseData);
  };

  const deleteExercise = async ({ id }: ExerciseIdType) => {
    await exerciseRepository.delete({ id });
  };

  return {
    getExercisesBySectionId,
    createExercise,
    updateExercise,
    deleteExercise,
  };
};
