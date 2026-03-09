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
    position,
  }: UpdateWorkoutPayload): Promise<any> => {
    const sql = `
      UPDATE workouts 
      SET name = ?,  position = ?
      WHERE id = ?;
    `;
    const result = await runQuery(sql, [name, position, id]);
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
   * Gets all sections for a workout with their exercises
   * Returns nested structure: workout -> sections -> exercises
   */
  getWithSectionsAndExercises: async ({ id }: { id: number }): Promise<any> => {
    // Get all sections for this workout with positions from junction table
    const sectionsQuery = `
      SELECT s.*, ws.position as sectionPosition FROM sections s
      INNER JOIN workout_sections ws ON s.id = ws.section_id
      WHERE ws.workout_id = ?
      ORDER BY ws.position ASC;
    `;
    const sections = await getAllRows(sectionsQuery, [id]);

    // Get exercises for each section with positions from junction table
    const sectionsWithExercises = await Promise.all(
      sections.map(async (section) => {
        const exercisesQuery = `
          SELECT e.*, se.position as exercisePosition FROM exercises e
          INNER JOIN section_exercises se ON e.id = se.exercise_id
          WHERE se.section_id = ?
          ORDER BY se.position ASC;
        `;
        const exercises = await getAllRows(exercisesQuery, [section.id]);
        return {
          ...section,
          position: section.sectionPosition,
          sectionPosition: undefined, // Remove the temporary field
          exercises: exercises.map((ex) => ({
            ...ex,
            position: ex.exercisePosition,
            exercisePosition: undefined, // Remove the temporary field
          })),
        };
      }),
    );

    const workoutData = await workout.getById({ id });
    return { ...workoutData, sections: sectionsWithExercises };
  },

  /**
   * Updates position of all workouts
   */
  updatePositions: async (workoutIds: number[]): Promise<any> => {
    const promises = workoutIds.map((id, index) =>
      runQuery(`UPDATE workouts SET position = ? WHERE id = ?;`, [index, id]),
    );
    return Promise.all(promises);
  },

  // Legacy aliases for backwards compatibility
  getALl: async () => workout.getAll(),
} as const;
