import { exercise } from "../database/sqlite/exercise";

export const exerciseRepository = {
  getBySectionId: exercise.getBySectionId,
  create: exercise.create,
  update: exercise.update,
  delete: exercise.delete,
};
