export interface Section {
  id: number;
  workout_id: number;
  name: string;
  type: string;
  prepare_time?: number;
  rest_exercise: number;
  rest_group?: number;
  position: number;
}

export interface CreateSectionPayload {
  workout_id: number;
  name: string;
  type: string;
  prepare_time?: number;
  rest_exercise?: number;
  rest_group?: number;
  position: number;
}

export interface UpdateSectionPayload {
  id: number;
  workout_id?: number;
  name?: string;
  type?: string;
  prepare_time?: number;
  rest_exercise?: number;
  rest_group?: number;
  position?: number;
}
