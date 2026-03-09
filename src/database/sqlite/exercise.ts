import {
  CreateExercisePayload,
  CreateSectionExercisePayload,
  UpdateExercisePayload,
} from "@/src/types/exercise";
import { getAllRows, getFirstRow, runQuery } from "./db";

export const exercise = {
  /**
   * Fetches all exercises
   */
  getAll: async () => {
    const sql = `SELECT * FROM exercises ORDER BY id DESC;`;
    const result = await getAllRows(sql);
    return result;
  },

  /**
   * Fetches an exercise by ID
   */
  getById: async ({ id }: { id: number }) => {
    const sql = `SELECT * FROM exercises WHERE id = ?;`;
    const result = await getFirstRow(sql, [id]);
    return result;
  },

  /**
   * Creates a new independent exercise
   */
  create: async (exerciseData: CreateExercisePayload): Promise<any> => {
    const sql = `
      INSERT INTO exercises 
      (name, reps, time_seconds, weight, sets) 
      VALUES (?, ?, ?, ?, ?);
    `;
    const { name, reps, time_seconds, weight, sets } = exerciseData;
    const result = await runQuery(sql, [
      name,
      reps,
      time_seconds,
      weight,
      sets,
    ]);
    return result;
  },

  /**
   * Updates an existing exercise
   */
  update: async (exerciseData: UpdateExercisePayload): Promise<any> => {
    const sql = `
      UPDATE exercises 
      SET name = ?, reps = ?, time_seconds = ?, weight = ?, sets = ?
      WHERE id = ?;
    `;
    const { id, name, reps, time_seconds, weight, sets } = exerciseData;
    const result = await runQuery(sql, [
      name,
      reps,
      time_seconds,
      weight,
      sets,
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

  /**
   * Adds an exercise to a section (creates junction record)
   */
  addToSection: async (payload: CreateSectionExercisePayload): Promise<any> => {
    const sql = `
      INSERT INTO section_exercises (section_id, exercise_id, position)
      VALUES (?, ?, ?);
    `;
    const result = await runQuery(sql, [
      payload.section_id,
      payload.exercise_id,
      payload.position,
    ]);
    return result;
  },

  /**
   * Removes an exercise from a section
   */
  removeFromSection: async ({
    section_id,
    exercise_id,
  }: {
    section_id: number;
    exercise_id: number;
  }): Promise<any> => {
    const sql = `
      DELETE FROM section_exercises 
      WHERE section_id = ? AND exercise_id = ?;
    `;
    const result = await runQuery(sql, [section_id, exercise_id]);
    return result;
  },

  /**
   * Updates the position of an exercise in a section
   */
  updatePositionInSection: async ({
    section_id,
    exercise_id,
    position,
  }: {
    section_id: number;
    exercise_id: number;
    position: number;
  }): Promise<any> => {
    const sql = `
      UPDATE section_exercises 
      SET position = ?
      WHERE section_id = ? AND exercise_id = ?;
    `;
    const result = await runQuery(sql, [position, section_id, exercise_id]);
    return result;
  },

  /**
   * Gets all exercises in a section ordered by position
   */
  getAllBySection: async ({ section_id }: { section_id: number }) => {
    const sql = `
      SELECT e.* FROM exercises e
      INNER JOIN section_exercises se ON e.id = se.exercise_id
      WHERE se.section_id = ?
      ORDER BY se.position ASC;
    `;
    const result = await getAllRows(sql, [section_id]);
    return result;
  },
} as const;
