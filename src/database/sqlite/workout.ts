import {
  CreateWorkoutPayload,
  UpdateWorkoutPayload,
  Workout,
} from "@/src/types/workout";
import { getAllRows, getFirstRow, runQuery } from "./db";

export const workout = {
  /**
   * Fetches all workouts ordered by creation date (newest first)
   */
  getAll: async (): Promise<Workout[]> => {
    const sql = `SELECT * FROM workouts ORDER BY position ASC;`;
    const result = (await getAllRows(sql)) as Workout[];
    return result;
  },

  /**
   * Fetches a workout by ID
   */
  getById: async ({ id }: { id: number }): Promise<Workout> => {
    const sql = `SELECT * FROM workouts WHERE id = ?;`;
    const result = (await getFirstRow(sql, [id])) as Workout;
    return result;
  },

  /**
   * Creates a new workout
   */
  create: async ({ name, position }: CreateWorkoutPayload): Promise<any> => {
    const sql = `INSERT INTO workouts (name, position) VALUES (?, ?);`;
    const result = await runQuery(sql, [name, position]);
    return result;
  },

  /**
   * Updates an existing workout
   */
  update: async ({
    id,
    name,
    total_time,
    position,
  }: UpdateWorkoutPayload): Promise<any> => {
    const sql = `
      UPDATE workouts 
      SET name = ?, total_time = ?, position = ?
      WHERE id = ?;
    `;
    const result = await runQuery(sql, [name, total_time, position, id]);
    return result;
  },

  /**
   * Deletes a workout
   */
  delete: async ({ id }: { id: number }): Promise<any> => {
    const sql = `DELETE FROM workouts WHERE id = ?;`;
    const result = await runQuery(sql, [id]);
    return result;
  },

  /**
   * Fetches all sections for a workout
   */
  getAllSections: async ({ id }: { id: number }): Promise<any[]> => {
    const sql = `SELECT * FROM sections WHERE workout_id = ? ORDER BY position ASC;`;
    const result = await getAllRows(sql, [id]);
    return result;
  },

  // Legacy aliases for backwards compatibility
  getALl: async () => workout.getAll(),
} as const;
