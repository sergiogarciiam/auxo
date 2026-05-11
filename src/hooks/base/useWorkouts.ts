import { useEffect } from "react";
import { workoutRepository } from "../../repositories/workoutRepository";
import { Block } from "../../types/block";
import {
  CreateWorkoutPayload,
  UpdateWorkoutPayload,
  Workout,
} from "../../types/workout";
import { createCRUDHook } from "./createCRUDHook";

const useCRUD = createCRUDHook<
  Workout,
  CreateWorkoutPayload,
  UpdateWorkoutPayload
>(workoutRepository, { entityName: "Workout" });

export const useWorkouts = () => {
  const crud = useCRUD();

  // Additional specialized methods beyond basic CRUD
  const getAllBlocksByWorkoutId = (id: number): Promise<Block[]> =>
    workoutRepository.getAllBlocksByWorkoutId({ id }).catch((error) => {
      console.error("Failed to fetch blocks:", error);
      throw error;
    });

  // Auto-fetch on mount
  useEffect(() => {
    crud.fetchItems();
  }, []);

  return {
    workouts: crud.items,
    fetchWorkouts: crud.fetchItems,
    getWorkoutById: crud.getItemById,
    createWorkout: crud.createItem,
    updateWorkout: crud.updateItem,
    deleteWorkout: crud.deleteItem,
    getAllBlocksByWorkoutId,
    isLoading: crud.isLoading,
  };
};
