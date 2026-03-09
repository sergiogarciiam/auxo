export interface Exercise {
  id: number;
  name: string;
  reps?: number;
  time_seconds?: number;
  weight?: number;
  sets?: number;
}

export interface CreateExercisePayload {
  name: string;
  reps?: number;
  time_seconds?: number;
  weight?: number;
  sets?: number;
}

export interface UpdateExercisePayload {
  id: number;
  name?: string;
  reps?: number;
  time_seconds?: number;
  weight?: number;
  sets?: number;
}

// Junction table for section_exercises
export interface SectionExercise {
  id: number;
  section_id: number;
  exercise_id: number;
  position: number;
}

export interface CreateSectionExercisePayload {
  section_id: number;
  exercise_id: number;
  position: number;
}
