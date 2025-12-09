/**
 * Types for Exercise domain
 * Follows a consistent naming pattern: Entity, CreateEntity, UpdateEntity
 */

export interface Exercise {
  id: number;
  section_id: number;
  name: string;
  reps?: number;
  time?: number;
  weight?: number;
  sets?: number;
  position: number;
}

export interface CreateExercisePayload {
  section_id: number;
  name: string;
  reps: number;
  time: number;
  weight: number;
  sets: number;
  position: number;
}

export interface UpdateExercisePayload {
  id: number;
  section_id?: number;
  name?: string;
  reps?: number;
  time?: number;
  weight?: number;
  sets?: number;
  position?: number;
}
