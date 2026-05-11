import { exerciseRepository } from "../../repositories/exerciseRepository";
import {
  CreateExercisePayload,
  Exercise,
  UpdateExercisePayload,
} from "../../types/exercise";
import { createCRUDHook } from "./createCRUDHook";

const useCRUD = createCRUDHook<
  Exercise,
  CreateExercisePayload,
  UpdateExercisePayload
>(exerciseRepository, { entityName: "Exercise" });

/**
 * Hook for exercise CRUD operations
 * Note: Exercise operations don't auto-fetch since they're typically part of block operations
 */
export const useExercises = () => {
  const crud = useCRUD();

  return {
    exercises: crud.items,
    fetchExercises: crud.fetchItems,
    getExerciseById: crud.getItemById,
    createExercise: crud.createItem,
    updateExercise: crud.updateItem,
    deleteExercise: crud.deleteItem,
    isLoading: crud.isLoading,
  };
};
