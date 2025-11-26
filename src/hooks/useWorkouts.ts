import { useEffect, useState } from "react";
import { workoutRepository } from "../repositories/workoutRepository";
import { WorkoutInterface } from "../types/workout";

export const useWorkouts = () => {
  const [workouts, setWorkouts] = useState<WorkoutInterface[]>([]);

  const fetchWorkouts = async () => {
    const data = await workoutRepository.getAll();
    setWorkouts(data);
  };

  const createWorkout = async ({ name }: { name: string }) => {
    await workoutRepository.create({ name });
    await fetchWorkouts();
  };

  const updateWorkout = async ({
    id,
    name,
    total_time,
  }: {
    id: number;
    name: string;
    total_time: number;
  }) => {
    await workoutRepository.update({ id, name, total_time });
    await fetchWorkouts();
  };

  const deleteWorkout = async ({ id }: { id: number }) => {
    await workoutRepository.delete({ id });
    await fetchWorkouts();
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  return {
    workouts,
    fetchWorkouts,
    createWorkout,
    updateWorkout,
    deleteWorkout,
  };
};
