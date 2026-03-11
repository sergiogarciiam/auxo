import { exercise } from "../database/sqlite/exercise";

export const exerciseRepository = {
  create: exercise.create,
  update: exercise.update,
  delete: exercise.delete,
};
