import { workout } from "../database/sqlite/workout";

export const workoutRepository = {
  getAll: workout.getAll,
  getById: workout.getById,
  create: workout.create,
  update: workout.update,
  delete: workout.delete,
  getAllBlocksByWorkoutId: workout.getAllBlocksByWorkoutId,
};
