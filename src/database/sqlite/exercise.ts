import {
  CreateExercisePayload,
  UpdateExercisePayload,
} from "@/src/types/exercise";
import { runQuery } from "./db";

export const exercise = {
  /**
   * Creates a new exercise
   */
  create: async (exerciseData: CreateExercisePayload): Promise<any> => {
    const sql = `
      INSERT INTO exercises 
      (block_id, name, last_reps, min_reps, max_reps, time_seconds, weight, sets, rest_time, exercise_type, config_type, sets_data, position) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;
    const {
      block_id,
      name,
      last_reps,
      min_reps,
      max_reps,
      time_seconds,
      weight,
      sets,
      rest_time,
      exercise_type,
      config_type,
      sets_data,
      position,
    } = exerciseData;
    const result = await runQuery(sql, [
      block_id,
      name,
      last_reps,
      min_reps,
      max_reps,
      time_seconds,
      weight,
      sets,
      rest_time,
      exercise_type,
      config_type,
      sets_data ?? null,
      position,
    ]);
    return result;
  },

  /**
   * Updates an existing exercise
   */
  update: async (exerciseData: UpdateExercisePayload): Promise<any> => {
    const { id, ...fields } = exerciseData;

    const keys = Object.keys(fields).filter(
      (k) => fields[k as keyof typeof fields] !== undefined,
    );

    if (keys.length === 0) return;

    const setClause = keys.map((k) => `${k} = ?`).join(", ");
    const values = keys.map((k) => fields[k as keyof typeof fields]);

    const sql = `
    UPDATE exercises
    SET ${setClause}
    WHERE id = ?;
  `;

    return await runQuery(sql, [...values, id]);
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
