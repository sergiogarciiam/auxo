import { useCallback, useEffect, useState } from "react";
import { workoutRepository } from "../../repositories/workoutRepository";
import { Block } from "../../types/block";
import {
  CreateWorkoutPayload,
  UpdateWorkoutPayload,
  Workout,
} from "../../types/workout";

export const useWorkouts = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  const fetchWorkouts = useCallback(async () => {
    try {
      const data = await workoutRepository.getAll();
      setWorkouts(data);
    } catch (error) {
      console.error("Failed to fetch workouts:", error);
      throw error;
    }
  }, []);

  const getWorkoutById = useCallback(async (id: number) => {
    try {
      const workout = await workoutRepository.getById({ id });
      return workout;
    } catch (error) {
      console.error("Failed to fetch workout:", error);
      throw error;
    }
  }, []);

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

  const getAllBlocksByWorkoutId = useCallback(
    async (id: number): Promise<Block[]> => {
      try {
        const blocks = (await workoutRepository.getAllBlocksByWorkoutId({
          id,
        })) as Block[];
        return blocks;
      } catch (error) {
        console.error("Failed to fetch blocks:", error);
        throw error;
      }
    },
    [],
  );

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
    getAllBlocksByWorkoutId,
  };
};
