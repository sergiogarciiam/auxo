import {
  CreateExerciseInterface,
  ExerciseIdType,
  UpdateExerciseInterface,
} from "@/src/types/exercise";
import { getAllRows, runQuery } from "./db";

export const exercise = {
  getBySectionId: async ({ section_id }: { section_id: number }) => {
    const sql = `SELECT * FROM exercises WHERE section_id = ? ORDER BY position ASC;`;
    const result = await getAllRows(sql, [section_id]);
    return result;
  },

  create: async (exerciseData: CreateExerciseInterface) => {
    const sql = `
      INSERT INTO exercises 
      (section_id, name, type, reps, time_seconds, weight, sets, position) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `;
    const {
      section_id,
      name,
      type,
      reps,
      time_seconds,
      weight,
      sets,
      position,
    } = exerciseData;
    const result = await runQuery(sql, [
      section_id,
      name,
      type,
      reps,
      time_seconds,
      weight,
      sets,
      position,
    ]);
    return result;
  },

  update: async (exerciseData: UpdateExerciseInterface) => {
    const sql = `
      UPDATE exercises 
      SET section_id = ?, name = ?, type = ?, reps = ?, time_seconds = ?, weight = ?, sets = ?, position = ?
      WHERE id = ?;
    `;
    const {
      id,
      section_id,
      name,
      type,
      reps,
      time_seconds,
      weight,
      sets,
      position,
    } = exerciseData;
    const result = await runQuery(sql, [
      section_id,
      name,
      type,
      reps,
      time_seconds,
      weight,
      sets,
      position,
      id,
    ]);
    return result;
  },

  delete: async ({ id }: ExerciseIdType) => {
    const sql = `DELETE FROM exercises WHERE id = ?;`;
    const result = await runQuery(sql, [id]);
    return result;
  },
};
