export interface Block {
  id: number;
  workout_id: number;
  name: string;
  type: string;
  prepare_time?: number;
  rest_exercise: number;
  rest_group?: number;
  position: number;
}

export interface CreateBlockPayload {
  workout_id: number;
  name: string;
  type: string;
  prepare_time?: number;
  rest_exercise?: number;
  rest_group?: number;
  position: number;
}

export interface UpdateBlockPayload {
  id: number;
  workout_id?: number;
  name?: string;
  type?: string;
  prepare_time?: number;
  rest_exercise?: number;
  rest_group?: number;
  position?: number;
}
