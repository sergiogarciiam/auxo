/**
 * Types for Section domain
 * Follows a consistent naming pattern: Entity, CreateEntity, UpdateEntity
 */

export interface Section {
  id: number;
  workout_id: number;
  name: string;
  type: string;
  rest_exercise: number;
  rest_group?: number;
  position: number;
}

export interface CreateSectionPayload {
  workout_id: number;
  name: string;
  type: string;
  rest_exercise?: number;
  rest_group?: number;
  position: number;
}

export interface UpdateSectionPayload {
  id: number;
  workout_id?: number;
  name?: string;
  type?: string;
  rest_exercise?: number;
  rest_group?: number;
  position?: number;
}
