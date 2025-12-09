/**
 * Types for Workout domain
 * Follows a consistent naming pattern: Entity, CreateEntity, UpdateEntity
 */

export interface Workout {
  id: number;
  name: string;
  total_time: number;
}

export interface CreateWorkoutPayload {
  name: string;
}

export interface UpdateWorkoutPayload {
  id: number;
  name?: string;
  total_time?: number;
}
