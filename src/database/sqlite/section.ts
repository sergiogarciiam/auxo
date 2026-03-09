import {
  CreateSectionPayload,
  CreateWorkoutSectionPayload,
  Section,
  UpdateSectionPayload,
} from "@/src/types/section";
import { getAllRows, getFirstRow, runQuery } from "./db";

export const section = {
  /**
   * Fetches all independent sections
   */
  getAll: async (): Promise<Section[]> => {
    const sql = `SELECT * FROM sections ORDER BY id DESC;`;
    const result = (await getAllRows(sql)) as Section[];
    return result;
  },

  /**
   * Fetches a section by ID
   */
  getById: async ({ id }: { id: number }): Promise<Section> => {
    const sql = `SELECT * FROM sections WHERE id = ?;`;
    const result = await getFirstRow(sql, [id]);
    return result;
  },

  /**
   * Creates a new independent section
   */
  create: async ({
    name,
    type,
    prepare_time,
    rest_exercise,
    rest_group,
  }: CreateSectionPayload): Promise<any> => {
    const sql = `
      INSERT INTO sections (name, type, prepare_time, rest_exercise, rest_group) 
      VALUES (?, ?, ?, ?, ?);
    `;
    const result = await runQuery(sql, [
      name,
      type,
      prepare_time,
      rest_exercise,
      rest_group,
    ]);
    return result;
  },

  /**
   * Updates an existing section
   */
  update: async ({
    id,
    name,
    type,
    prepare_time,
    rest_exercise,
    rest_group,
  }: UpdateSectionPayload): Promise<any> => {
    const sql = `
      UPDATE sections 
      SET name = ?, type = ?, prepare_time = ?, rest_exercise = ?, rest_group = ? 
      WHERE id = ?;
    `;
    const result = await runQuery(sql, [
      name,
      type,
      prepare_time,
      rest_exercise,
      rest_group,
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

  /**
   * Adds a section to a workout (creates junction record)
   */
  addToWorkout: async (payload: CreateWorkoutSectionPayload): Promise<any> => {
    const sql = `
      INSERT INTO workout_sections (workout_id, section_id, position)
      VALUES (?, ?, ?);
    `;
    const result = await runQuery(sql, [
      payload.workout_id,
      payload.section_id,
      payload.position,
    ]);
    return result;
  },

  /**
   * Removes a section from a workout
   */
  removeFromWorkout: async ({
    workout_id,
    section_id,
  }: {
    workout_id: number;
    section_id: number;
  }): Promise<any> => {
    const sql = `
      DELETE FROM workout_sections 
      WHERE workout_id = ? AND section_id = ?;
    `;
    const result = await runQuery(sql, [workout_id, section_id]);
    return result;
  },

  /**
   * Updates the position of a section in a workout
   */
  updatePositionInWorkout: async ({
    workout_id,
    section_id,
    position,
  }: {
    workout_id: number;
    section_id: number;
    position: number;
  }): Promise<any> => {
    const sql = `
      UPDATE workout_sections 
      SET position = ?
      WHERE workout_id = ? AND section_id = ?;
    `;
    const result = await runQuery(sql, [position, workout_id, section_id]);
    return result;
  },

  /**
   * Gets all sections for a workout ordered by position
   */
  getAllByWorkout: async ({ workout_id }: { workout_id: number }) => {
    const sql = `
      SELECT s.*, ws.position as sectionPosition FROM sections s
      INNER JOIN workout_sections ws ON s.id = ws.section_id
      WHERE ws.workout_id = ?
      ORDER BY ws.position ASC;
    `;
    const result = await getAllRows(sql, [workout_id]);
    return result.map((row) => ({
      ...row,
      position: row.sectionPosition,
      sectionPosition: undefined,
    }));
  },

  /**
   * Gets all exercises in a section ordered by position
   */
  getAllExercisesBySectionId: async ({
    section_id,
  }: {
    section_id: number;
  }) => {
    const sql = `
      SELECT e.*, se.position as exercisePosition FROM exercises e
      INNER JOIN section_exercises se ON e.id = se.exercise_id
      WHERE se.section_id = ?
      ORDER BY se.position ASC;
    `;
    const result = await getAllRows(sql, [section_id]);
    return result.map((row) => ({
      ...row,
      position: row.exercisePosition,
      exercisePosition: undefined,
    }));
  },
} as const;
