import {
  CreateWorkoutInterface,
  UpdateWorkoutInterface,
  WorkoutIdType,
  WorkoutInterface,
} from "@/src/types/workout";
import { getAllRows, getFirstRow, runQuery } from "./db";

export const workout = {
  getALl: async () => {
    const sql = `SELECT * FROM workouts ORDER BY id DESC;`;
    const result = (await getAllRows(sql)) as WorkoutInterface[];
    return result;
  },

  getById: async ({ id }: WorkoutIdType) => {
    const sql = `SELECT * FROM workouts WHERE id = ?;`;
    const result = (await getFirstRow(sql, [id])) as WorkoutInterface;
    return result;
  },

  create: async ({ name }: CreateWorkoutInterface) => {
    const sql = `INSERT INTO workouts (name) VALUES (?);`;
    const result = await runQuery(sql, [name]);
    return result;
  },

  update: async ({ id, name, total_time }: UpdateWorkoutInterface) => {
    const sql = `
      UPDATE workouts 
      SET name = ?, total_time = ?
      WHERE id = ?;
    `;
    const result = await runQuery(sql, [name, total_time, id]);
    return result;
  },

  delete: async ({ id }: WorkoutIdType) => {
    const sql = `DELETE FROM workouts WHERE id = ?;`;
    const result = await runQuery(sql, [id]);
    return result;
  },

  getAllSections: async ({ id }: WorkoutIdType) => {
    const sql = `SELECT * FROM sections WHERE workout_id = ? ORDER BY position ASC;`;
    const result = await getAllRows(sql, [id]);
    return result;
  },
};
