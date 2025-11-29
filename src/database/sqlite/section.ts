import {
  CreateSectionInterface,
  SectionIdType,
  SectionInterface,
  UpdateSectionInterface,
} from "@/src/types/section";
import { getAllRows, runQuery } from "./db";

export const section = {
  getALl: async () => {
    const sql = `SELECT * FROM sections ORDER BY id DESC;`;
    const result = (await getAllRows(sql)) as SectionInterface[];
    return result;
  },

  getByWorkoutId: async ({ workout_id }: { workout_id: number }) => {
    const sql = `SELECT * FROM sections WHERE workout_id = ? ORDER BY position ASC;`;
    const result = await getAllRows(sql, [workout_id]);
    return result;
  },

  getById: async ({ id }: SectionIdType) => {
    const sql = `SELECT * FROM sections WHERE id = ?;`;
    const result = await runQuery(sql, [id]);
    return result;
  },

  create: async ({
    workout_id,
    name,
    type,
    rest_exercise,
    rest_group,
    position,
  }: CreateSectionInterface) => {
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

  update: async ({
    id,
    workout_id,
    name,
    type,
    rest_exercise,
    rest_group,
    position,
  }: UpdateSectionInterface) => {
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

  delete: async ({ id }: SectionIdType) => {
    const sql = `DELETE FROM sections WHERE id = ?;`;
    const result = await runQuery(sql, [id]);
    return result;
  },
};
