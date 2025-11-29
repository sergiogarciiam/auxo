export interface ExerciseInterface {
  id: number;
  section_id: number;
  name: string;
  type: string;
  reps?: number;
  time_seconds?: number;
  weight?: number;
  sets?: number;
  position: number;
}

export interface CreateExerciseInterface {
  section_id: number;
  name: string;
  type: string;
  reps?: number;
  time_seconds?: number;
  weight?: number;
  sets?: number;
  position: number;
}

export interface UpdateExerciseInterface {
  id: number;
  section_id: number;
  name: string;
  type: string;
  reps?: number;
  time_seconds?: number;
  weight?: number;
  sets?: number;
  position: number;
}

export type ExerciseIdType = { id: number };
