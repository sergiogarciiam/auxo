export interface Exercise {
  id: number;
  block_id: number;
  name: string;
  reps?: number;
  time_seconds?: number;
  weight?: number;
  sets?: number;
  position: number;
}

export interface CreateExercisePayload {
  block_id: number;
  name: string;
  reps: number;
  time_seconds: number;
  weight: number;
  sets: number;
  position: number;
}

export interface UpdateExercisePayload {
  id: number;
  block_id?: number;
  name?: string;
  reps?: number;
  time_seconds?: number;
  weight?: number;
  sets?: number;
  position?: number;
}
