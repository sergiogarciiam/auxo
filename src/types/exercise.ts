export interface Exercise {
  id: number;
  section_id: number;
  name: string;
  reps?: number;
  time_seconds?: number;
  weight?: number;
  sets?: number;
  position: number;
}

export interface CreateExercisePayload {
  section_id: number;
  name: string;
  reps: number;
  time_seconds: number;
  weight: number;
  sets: number;
  position: number;
}

export interface UpdateExercisePayload {
  id: number;
  section_id?: number;
  name?: string;
  reps?: number;
  time_seconds?: number;
  weight?: number;
  sets?: number;
  position?: number;
}
