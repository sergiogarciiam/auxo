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
  const {
    items,
    isLoading,
    fetchItems: fetchWorkouts,
    getItemById: getWorkoutById,
    createItem: createWorkout,
    updateItem: updateWorkout,
    deleteItem: deleteWorkout,
  } = useCRUD();

  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  // Additional specialized methods beyond basic CRUD
  const getAllBlocksByWorkoutId = (id: number): Promise<Block[]> =>
    workoutRepository.getAllBlocksByWorkoutId({ id }).catch((error) => {
      console.error("Failed to fetch blocks:", error);
      throw error;
    });

  return {
    workouts: items,
    fetchWorkouts,
    getWorkoutById,
    createWorkout,
    updateWorkout,
    deleteWorkout,
    getAllBlocksByWorkoutId,
    isLoading,
  };
};
