export interface Section {
  id: number;
  name: string;
  type: string;
  prepare_time?: number;
  rest_exercise: number;
  rest_group?: number;
}

export interface CreateSectionPayload {
  name: string;
  type: string;
  prepare_time?: number;
  rest_exercise?: number;
  rest_group?: number;
}

export interface UpdateSectionPayload {
  id: number;
  name?: string;
  type?: string;
  prepare_time?: number;
  rest_exercise?: number;
  rest_group?: number;
}

// Junction table for workout_sections
export interface WorkoutSection {
  id: number;
  workout_id: number;
  section_id: number;
  position: number;
}

export interface CreateWorkoutSectionPayload {
  workout_id: number;
  section_id: number;
  position: number;
}
