export type LocalStatus = "new" | "updated" | "deleted" | "unchanged";

export interface UIExercise {
  id: number | string;
  block_id: number | string;
  name: string;
  reps: number;
  exercise_time: number;
  exercise_type: string;
  config_type: string;
  rest_time: number;
  weight: number;
  sets: number;
  sets_data?: {
    reps: number;
    time_seconds: number;
    weight: number;
    rest_time: number;
  }[]; // Complex mode only
  position: number;
  localStatus: LocalStatus;
}

export interface UIBlock {
  id: number | string;
  workout_id: number | string;
  name: string;
  type: string;
  prepare_time: number;
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

export type ExecutionStepType = "exercise" | "rest" | "flexible-selection";

/**
 * Tracks progress within a flexible block for a specific exercise
 * Updated as user completes sets, carries forward until they skip/exit
 */
export interface FlexibleBlockSelection {
  exerciseId: number | string;
  currentSet: number; // 0-indexed
  isComplete: boolean;
}

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
  availableExercises?: UIExercise[]; // for flexible-selection steps
  lastRestTime?: number; // for flexible blocks - rest after last completed exercise
  blockName?: string; // for flexible blocks - display block name
}

export type ThemeOption = "system" | "light" | "dark";
export type WeightUnit = "kg" | "lb";
