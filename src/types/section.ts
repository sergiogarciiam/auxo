export interface SectionInterface {
  id: number;
  workout_id: number;
  name: string;
  type: string;
  rest_exercise: number;
  rest_group?: number;
  position: number;
}

export interface CreateSectionInterface {
  workout_id: number;
  name: string;
  type: string;
  rest_exercise?: number;
  rest_group?: number;
  position: number;
}

export interface UpdateSectionInterface {
  id: number;
  workout_id?: number;
  name?: string;
  type?: string;
  rest_exercise?: number;
  rest_group?: number;
  position?: number;
}

export type SectionIdType = { id: number };
