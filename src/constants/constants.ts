export const WARMUP_TYPE = "warmup";
export const COOLDOWN_TYPE = "cooldown";
export const TRADITIONAL_TYPE = "traditional";
export const CIRCUIT_TYPE = "circuit";
export const SUPERSET_TYPE = "superset";
export const FLEXIBLE_TYPE = "flexible";

export const BLOCK_TYPES = [
  WARMUP_TYPE,
  COOLDOWN_TYPE,
  TRADITIONAL_TYPE,
  CIRCUIT_TYPE,
  SUPERSET_TYPE,
  FLEXIBLE_TYPE,
] as const;

export const BLOCK_TYPE_LABELS: Record<string, string> = {
  warmup: "Warm up",
  cooldown: "Cooldown",
  traditional: "Traditional",
  circuit: "Circuit",
  superset: "Superset",
  flexible: "Flexible",
} as const;

export const EXERCISE_TYPES_REPS = "reps";
export const EXERCISE_TYPES_TIME = "time";
export const EXERCISE_TYPES = [
  EXERCISE_TYPES_REPS,
  EXERCISE_TYPES_TIME,
] as const;

export const CONFIG_TYPES_SIMPLE = "simple";
export const CONFIG_TYPES_COMPLEX = "complex";
export const CONFIG_TYPES = [
  CONFIG_TYPES_SIMPLE,
  CONFIG_TYPES_COMPLEX,
] as const;

export const LOCAL_STATUS_NEW = "new";
export const LOCAL_STATUS_UPDATED = "updated";
export const LOCAL_STATUS_DELETED = "deleted";
export const LOCAL_STATUS_UNCHANGED = "unchanged";

export const EXERCISE_STEP_TYPE = "exercise";
export const REST_STEP_TYPE = "rest";

export const SNACKBAR_VARIANT_SUCCESS = "success";
export const SNACKBAR_VARIANT_ERROR = "error";
export const SNACKBAR_VARIANT_WARNING = "warning";

export const MAX_SECONDS = 59 * 60 + 59; // 3599
