import {
  CreateSectionPayload,
  Section,
  UpdateSectionPayload,
} from "@/src/types/section";
import { getAllRows, runQuery } from "./db";

export const section = {
  /**
   * Fetches all sections ordered by creation date (newest first)
   */
  getAll: async (): Promise<Section[]> => {
    const sql = `SELECT * FROM sections ORDER BY id DESC;`;
    const result = (await getAllRows(sql)) as Section[];
    return result;
  },

  /**
   * Fetches all sections for a workout ordered by position
   */
  getByWorkoutId: async ({
    workout_id,
  }: {
    workout_id: number;
  }): Promise<Section[]> => {
    const sql = `SELECT * FROM sections WHERE workout_id = ? ORDER BY position ASC;`;
    const result = await getAllRows(sql, [workout_id]);
    return result;
  },

  /**
   * Fetches all exercises for a section ordered by position
   */
  getAllExercisesBySectionId: async ({
    section_id,
  }: {
    section_id: number;
  }): Promise<any[]> => {
    const sql = `SELECT * FROM exercises WHERE section_id = ? ORDER BY position ASC;`;
    const result = await getAllRows(sql, [section_id]);
    return result;
  },

  /**
   * Fetches a section by ID
   */
  getById: async ({ id }: { id: number }): Promise<Section> => {
    const sql = `SELECT * FROM sections WHERE id = ?;`;
    const result = await runQuery(sql, [id]);
    return result;
  },

  /**
   * Creates a new section
   */
  create: async ({
    workout_id,
    name,
    type,
    rest_exercise,
    rest_group,
    position,
  }: CreateSectionPayload): Promise<any> => {
    const sql = `INSERT INTO sections (workout_id, name, type, rest_exercise, rest_group, position) VALUES (?, ?, ?, ?, ?, ?);`;
    const result = await runQuery(sql, [
      workout_id,
      name,
      type,
      rest_exercise,
      rest_group,
      position,
    ]);
    return result;
  },

  /**
   * Updates an existing section
   */
  update: async ({
    id,
    workout_id,
    name,
    type,
    rest_exercise,
    rest_group,
    position,
  }: UpdateSectionPayload): Promise<any> => {
    const sql = `
      UPDATE sections 
      SET workout_id = ?, name = ?, type = ?, rest_exercise = ?, rest_group = ?, position = ? 
      WHERE id = ?;
    `;
    const result = await runQuery(sql, [
      workout_id,
      name,
      type,
      rest_exercise,
      rest_group,
      position,
      id,
    ]);
    return result;
  },

  /**
   * Deletes a section
   */
  delete: async ({ id }: { id: number }): Promise<any> => {
    const sql = `DELETE FROM sections WHERE id = ?;`;
    const result = await runQuery(sql, [id]);
    return result;
  },

  // Legacy aliases for backwards compatibility
  getALl: async () => section.getAll(),
} as const;
