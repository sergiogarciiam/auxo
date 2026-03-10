import { exercise } from "../database/sqlite/exercise";

export const exerciseRepository = {
  getAll: exercise.getAll,
  create: exercise.create,
  update: exercise.update,
  delete: exercise.delete,
  addToSection: exercise.addToSection,
  removeFromSection: exercise.removeFromSection,
  updatePositionInSection: exercise.updatePositionInSection,
};
