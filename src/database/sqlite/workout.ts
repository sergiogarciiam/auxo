import { getAllRows, runQuery } from "./db";

export const workout = {
  getALl: async () => {
    const sql = `SELECT * FROM workouts ORDER BY id DESC;`;
    const result = await getAllRows(sql);
    return result;
  },

  getById: async ({ id }: { id: number }) => {
    const sql = `SELECT * FROM workouts WHERE id = ?;`;
    const result = await runQuery(sql, [id]);
    return result;
  },

  create: async ({ name }: { name: string }) => {
    const sql = `INSERT INTO workouts (name) VALUES (?);`;
    const result = await runQuery(sql, [name]);
    return result;
  },

  update: async ({
    id,
    name,
    total_time,
  }: {
    id: number;
    name: string;
    total_time: number;
  }) => {
    const sql = `
      UPDATE workouts 
      SET name = ?, total_time = ?, updated_at = datetime('now') 
      WHERE id = ?;
    `;
    const result = await runQuery(sql, [name, total_time, id]);
    return result;
  },

  delete: async ({ id }: { id: number }) => {
    const sql = `DELETE FROM workouts WHERE id = ?;`;
    const result = await runQuery(sql, [id]);
    return result;
  },
};
