import { section } from "../database/sqlite/section";

export const sectionRepository = {
  getAll: section.getAll,
  getById: section.getById,
  create: section.create,
  update: section.update,
  delete: section.delete,
  getAllExercisesBySectionId: section.getAllExercisesBySectionId,
};
