export interface ExerciseInterface {
  id: number;
  section_id: number;
  name: string;
  reps?: number;
  time?: number;
  weight?: number;
  sets?: number;
  position: number;
}

export interface CreateExerciseInterface {
  section_id: number;
  name: string;
  reps: number;
  time: number;
  weight: number;
  sets: number;
  position: number;
}

export interface UpdateExerciseInterface {
  id: number;
  section_id: number;
  name: string;
  reps?: number;
  time?: number;
  weight?: number;
  sets?: number;
  position: number;
}

export type ExerciseIdType = { id: number };
