export interface Workout {
  id: number;
  name: string;
  total_time: number;
  position: number;
}

export interface CreateWorkoutPayload {
  name: string;
  position?: number;
}

export interface UpdateWorkoutPayload {
  id: number;
  name?: string;
  total_time?: number;
  position?: number;
}
