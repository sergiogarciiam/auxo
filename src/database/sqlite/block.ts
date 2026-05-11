import {
  Block,
  CreateBlockPayload,
  UpdateBlockPayload,
} from "@/src/types/block";
import { getAllRows, runQuery } from "./db";

export const block = {
  /**
   * Fetches all blocks ordered by creation date (newest first)
   */
  getAll: async (): Promise<Block[]> => {
    const sql = `SELECT * FROM blocks ORDER BY id DESC;`;
    const result = (await getAllRows(sql)) as Block[];
    return result;
  },

  /**
   * Fetches a block by ID
   */
  getById: async ({ id }: { id: number }): Promise<Block> => {
    const sql = `SELECT * FROM blocks WHERE id = ?;`;
    const result: Block = await runQuery(sql, [id]);
    return result;
  },

  /**
   * Creates a new block
   */
  create: async ({
    workout_id,
    name,
    type,
    prepare_time,
    rest_group,
    position,
  }: CreateBlockPayload): Promise<any> => {
    const sql = `INSERT INTO blocks (workout_id, name, type, prepare_time, rest_group, position) VALUES (?, ?, ?, ?, ?, ?);`;
    const result = await runQuery(sql, [
      workout_id,
      name,
      type,
      prepare_time,
      rest_group,
      position,
    ]);
    return result;
  },

  /**
   * Updates an existing block
   */
  update: async ({
    id,
    workout_id,
    name,
    type,
    prepare_time,
    rest_group,
    position,
  }: UpdateBlockPayload): Promise<any> => {
    const sql = `
      UPDATE blocks 
      SET workout_id = ?, name = ?, type = ?, prepare_time = ?, rest_group = ?, position = ? 
      WHERE id = ?;
    `;
    const result = await runQuery(sql, [
      workout_id,
      name,
      type,
      prepare_time,
      rest_group,
      position,
      id,
    ]);
    return result;
  },

  /**
   * Deletes a block
   */
  delete: async ({ id }: { id: number }): Promise<any> => {
    const sql = `DELETE FROM blocks WHERE id = ?;`;
    const result = await runQuery(sql, [id]);
    return result;
  },

  /**
   * Fetches all exercises for a block ordered by position
   */
  getAllExercisesByBlockId: async ({
    block_id,
  }: {
    block_id: number;
  }): Promise<any[]> => {
    const sql = `SELECT * FROM exercises WHERE block_id = ? ORDER BY position ASC;`;
    const result = await getAllRows(sql, [block_id]);
    return result;
  },
} as const;
