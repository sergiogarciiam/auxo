export type LocalStatus = "new" | "updated" | "deleted" | "unchanged";

export interface UIExercise {
  id: number | string;
  section_id: number | string;
  name: string;
  reps: number;
  time_seconds: number;
  weight: number;
  sets: number;
  position: number;
  localStatus: LocalStatus;
}

export interface UISection {
  id: number | string;
  workout_id: number | string;
  name: string;
  type: string;
  rest_exercise: number;
  rest_group: number;
  position: number;
  localStatus: LocalStatus;
  exercises: UIExercise[];
}

export interface UIWorkout {
  id: number | string;
  name: string;
  sections: UISection[];
  localStatus: LocalStatus;
}
