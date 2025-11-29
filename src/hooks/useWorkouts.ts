import { useEffect, useState } from "react";
import { workoutRepository } from "../repositories/workoutRepository";
import { SectionInterface } from "../types/section";
import {
  CreateWorkoutInterface,
  UpdateWorkoutInterface,
  WorkoutIdType,
  WorkoutInterface,
} from "../types/workout";

export const useWorkouts = () => {
  const [workouts, setWorkouts] = useState<WorkoutInterface[]>([]);

  const fetchWorkouts = async () => {
    const data = await workoutRepository.getAll();
    setWorkouts(data);
  };

  const getWorkoutById = async ({ id }: WorkoutIdType) => {
    const workout = await workoutRepository.getById({ id });
    return workout;
  };

  const createWorkout = async (workoutData: CreateWorkoutInterface) => {
    const result = await workoutRepository.create(workoutData);
    await fetchWorkouts();
    return result.lastInsertRowId;
  };

  const updateWorkout = async (workoutData: UpdateWorkoutInterface) => {
    await workoutRepository.update(workoutData);
    await fetchWorkouts();
  };

  const deleteWorkout = async ({ id }: WorkoutIdType) => {
    await workoutRepository.delete({ id });
    await fetchWorkouts();
  };

  const getAllSections = async ({ id }: WorkoutIdType) => {
    const sections = (await workoutRepository.getAllSections({
      id,
    })) as SectionInterface[];
    return sections;
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

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
