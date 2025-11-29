export interface WorkoutInterface {
  id: number;
  name: string;
  total_time: number;
}

export interface CreateWorkoutInterface {
  name: string;
}

export interface UpdateWorkoutInterface {
  id: number;
  name: string;
  total_time: number;
}

export type WorkoutIdType = { id: number };
