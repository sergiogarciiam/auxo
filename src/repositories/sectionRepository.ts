import { section } from "../database/sqlite/section";

export const sectionRepository = {
  getAll: section.getALl,
  getAllExercisesBySectionId: section.getAllExercisesBySectionId,
  getByWorkoutId: section.getByWorkoutId,
  getById: section.getById,
  create: section.create,
  update: section.update,
  delete: section.delete,
};
