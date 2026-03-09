import { useCallback, useEffect, useState } from "react";
import { sectionRepository } from "../../repositories/sectionRepository";
import { workoutRepository } from "../../repositories/workoutRepository";
import { Section } from "../../types/section";
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

  const getAllSectionsByWorkoutId = useCallback(
    async (id: number): Promise<Section[]> => {
      try {
        const sections = (await workoutRepository.getAllSectionsByWorkoutId({
          id,
        })) as Section[];
        return sections;
      } catch (error) {
        console.error("Failed to fetch sections:", error);
        throw error;
      }
    },
    [],
  );

  const getWorkoutWithSectionsAndExercises = useCallback(async (id: number) => {
    try {
      const workout = await workoutRepository.getWithSectionsAndExercises({
        id,
      });
      return workout;
    } catch (error) {
      console.error(
        "Failed to fetch workout with sections and exercises:",
        error,
      );
      throw error;
    }
  }, []);

  const addSectionToWorkout = useCallback(
    async (workoutId: number, sectionId: number, position: number) => {
      try {
        await (sectionRepository as any).addToWorkout({
          workout_id: workoutId,
          section_id: sectionId,
          position,
        });
      } catch (error) {
        console.error("Failed to add section to workout:", error);
        throw error;
      }
    },
    [],
  );

  const removeSectionFromWorkout = useCallback(
    async (workoutId: number, sectionId: number) => {
      try {
        await (sectionRepository as any).removeFromWorkout({
          workout_id: workoutId,
          section_id: sectionId,
        });
      } catch (error) {
        console.error("Failed to remove section from workout:", error);
        throw error;
      }
    },
    [],
  );

  const updateSectionPositionInWorkout = useCallback(
    async (workoutId: number, sectionId: number, position: number) => {
      try {
        await (sectionRepository as any).updatePositionInWorkout({
          workout_id: workoutId,
          section_id: sectionId,
          position,
        });
      } catch (error) {
        console.error("Failed to update section position:", error);
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
    getAllSectionsByWorkoutId,
    getWorkoutWithSectionsAndExercises,
    addSectionToWorkout,
    removeSectionFromWorkout,
    updateSectionPositionInWorkout,
  };
};
