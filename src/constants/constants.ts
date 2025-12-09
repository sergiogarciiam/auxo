export const SECTION_TYPES = [
  "warmup",
  "cooldown",
  "traditional",
  "circuit",
  "superset",
] as const;

export const SECTION_TYPE_LABELS: Record<string, string> = {
  warmup: "Warm up",
  cooldown: "Cooldown",
  traditional: "Traditional",
  circuit: "Circuit",
  superset: "Superset",
} as const;
