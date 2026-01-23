import { workout } from "../database/sqlite/workout";

export const workoutRepository = {
  getAll: workout.getALl,
  getById: workout.getById,
  create: workout.create,
  update: workout.update,
  delete: workout.delete,
  getAllSectionsByWorkoutId: workout.getAllSectionsByWorkoutId,
};
