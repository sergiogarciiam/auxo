import {
  CreateExercisePayload,
  Exercise,
  UpdateExercisePayload,
} from "@/src/types/exercise";
import { getAllRows, runQuery } from "./db";

export const exercise = {
  /**
   * Fetches all exercises for a section ordered by position
   */
  getBySectionId: async ({
    section_id,
  }: {
    section_id: number;
  }): Promise<Exercise[]> => {
    const sql = `SELECT * FROM exercises WHERE section_id = ? ORDER BY position ASC;`;
    const result = await getAllRows(sql, [section_id]);
    return result;
  },

  /**
   * Creates a new exercise
   */
  create: async (exerciseData: CreateExercisePayload): Promise<any> => {
    const sql = `
      INSERT INTO exercises 
      (section_id, name, reps, time_seconds, weight, sets, position) 
      VALUES (?, ?, ?, ?, ?, ?, ?);
    `;
    const { section_id, name, reps, time, weight, sets, position } =
      exerciseData;
    const result = await runQuery(sql, [
      section_id,
      name,
      reps,
      time,
      weight,
      sets,
      position,
    ]);
    return result;
  },

  /**
   * Updates an existing exercise
   */
  update: async (exerciseData: UpdateExercisePayload): Promise<any> => {
    const sql = `
      UPDATE exercises 
      SET section_id = ?, name = ?, reps = ?, time_seconds = ?, weight = ?, sets = ?, position = ?
      WHERE id = ?;
    `;
    const { id, section_id, name, reps, time, weight, sets, position } =
      exerciseData;
    const result = await runQuery(sql, [
      section_id,
      name,
      reps,
      time,
      weight,
      sets,
      position,
      id,
    ]);
    return result;
  },

  /**
   * Deletes an exercise
   */
  delete: async ({ id }: { id: number }): Promise<any> => {
    const sql = `DELETE FROM exercises WHERE id = ?;`;
    const result = await runQuery(sql, [id]);
    return result;
  },
} as const;
