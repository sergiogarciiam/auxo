import { block } from "../database/sqlite/block";

export const blockRepository = {
  getAll: block.getAll,
  getById: block.getById,
  create: block.create,
  update: block.update,
  delete: block.delete,
  getAllExercisesByBlockId: block.getAllExercisesByBlockId,
};
