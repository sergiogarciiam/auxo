export type LocalStatus = "new" | "updated" | "deleted" | "unchanged";

export interface UIExercise {
  id: number | string;
  block_id: number | string;
  name: string;
  reps: number;
  time_seconds: number;
  weight: number;
  sets: number;
  position: number;
  localStatus: LocalStatus;
}

export interface UIBlock {
  id: number | string;
  workout_id: number | string;
  name: string;
  type: string;
  prepare_time: number;
  rest_exercise: number;
  rest_group: number;
  position: number;
  localStatus: LocalStatus;
  exercises: UIExercise[];
}

export interface UIWorkout {
  id: number | string;
  name: string;
  position: number;
  blocks: UIBlock[];
  localStatus: LocalStatus;
}

export type ExecutionStepType = "exercise" | "rest";

export interface ExecutionStep {
  id: string;
  type: ExecutionStepType;
  blockId: number | string;
  exerciseId?: number | string;
  name?: string;
  reps?: number;
  time_seconds?: number;
  set?: number;
  weight?: number;
  duration_seconds?: number; // for rest steps
}

export type ThemeOption = "system" | "light" | "dark";
export type WeightUnit = "kg" | "lb";
