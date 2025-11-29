import { section } from "../database/sqlite/section";

export const sectionRepository = {
  getAll: section.getALl,
  getByWorkoutId: section.getByWorkoutId,
  getById: section.getById,
  create: section.create,
  update: section.update,
  delete: section.delete,
};
