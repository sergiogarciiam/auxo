import { useCallback, useEffect, useState } from "react";
import { workoutRepository } from "../repositories/workoutRepository";
import { Section } from "../types/section";
import {
  CreateWorkoutPayload,
  UpdateWorkoutPayload,
  Workout,
} from "../types/workout";

export const useWorkouts = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  /**
   * Fetches all workouts from database
   */
  const fetchWorkouts = useCallback(async () => {
    try {
      const data = await workoutRepository.getAll();
      setWorkouts(data);
    } catch (error) {
      console.error("Failed to fetch workouts:", error);
      throw error;
    }
  }, []);

  /**
   * Fetches a specific workout by ID
   */
  const getWorkoutById = useCallback(async (id: number) => {
    try {
      const workout = await workoutRepository.getById({ id });
      return workout;
    } catch (error) {
      console.error("Failed to fetch workout:", error);
      throw error;
    }
  }, []);

  /**
   * Creates a new workout
   */
  const createWorkout = useCallback(
    async (workoutData: CreateWorkoutPayload) => {
      try {
        const result = await workoutRepository.create(workoutData);
        await fetchWorkouts();
        return result.lastInsertRowId;
      } catch (error) {
        console.error("Failed to create workout:", error);
        throw error;
      }
    },
    [fetchWorkouts],
  );

  /**
   * Updates an existing workout
   */
  const updateWorkout = useCallback(
    async (workoutData: UpdateWorkoutPayload) => {
      try {
        await workoutRepository.update(workoutData);
        await fetchWorkouts();
      } catch (error) {
        console.error("Failed to update workout:", error);
        throw error;
      }
    },
    [fetchWorkouts],
  );

  /**
   * Deletes a workout
   */
  const deleteWorkout = useCallback(
    async (id: number) => {
      try {
        await workoutRepository.delete({ id });
        await fetchWorkouts();
      } catch (error) {
        console.error("Failed to delete workout:", error);
        throw error;
      }
    },
    [fetchWorkouts],
  );

  /**
   * Fetches all sections for a workout
   */
  const getAllSections = useCallback(async (id: number): Promise<Section[]> => {
    try {
      const sections = (await workoutRepository.getAllSections({
        id,
      })) as Section[];
      return sections;
    } catch (error) {
      console.error("Failed to fetch sections:", error);
      throw error;
    }
  }, []);

  // Load workouts on mount
  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  return {
    workouts,
    fetchWorkouts,
    getWorkoutById,
    createWorkout,
    updateWorkout,
    deleteWorkout,
    getAllSections,
  };
};
