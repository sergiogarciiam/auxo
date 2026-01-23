import { ColorSchemeName } from "react-native";

export const Colors = {
  PRIMARY: "#7a96d1ff",
  BACKGROUND: "#fff",
  BORDER: "#ccc",
  LIGHT_BACKGROUND: "#fafafa",
  DISABLED_BACKGROUND: "#ddd",
  DISABLED_TEXT: "#999",
  TEXT_SECONDARY: "#555",
  INDICATOR_INACTIVE: "#ccc",
  ERROR_TEXT: "#d17a7aff",
  SUCCESS: "#7ad18fff",
  DESTRUCTIVE: "#d17a7aff",
  WARNING: "#f6b042ff",
  NEUTRAL: "#7a96d1ff",
  DARK_GRAY: "#333",
} as const;

export const DarkColors = {
  PRIMARY: "#7a96d1ff",
  BACKGROUND: "#121212",
  BORDER: "#2c2c2c",
  LIGHT_BACKGROUND: "#1e1e1e",
  DISABLED_BACKGROUND: "#2a2a2a",
  DISABLED_TEXT: "#777",
  TEXT_PRIMARY: "#fff",
  TEXT_SECONDARY: "#bbb",
  INDICATOR_INACTIVE: "#555",
  ERROR_TEXT: "#ff8a8a",
  SUCCESS: "#8affb1",
  DESTRUCTIVE: "#ff8a8a",
  WARNING: "#ffd27a",
  NEUTRAL: "#7a96d1ff",
  DARK_GRAY: "#aaa",
} as const;

export const Sizes = {
  BORDER_RADIUS: 8,
  BORDER_RADIUS_LARGE: 12,
  PADDING: 10,
  PADDING_LARGE: 20,
  BORDER_WIDTH: 1,
  SHADOW_OFFSET_HEIGHT: 2,
  SHADOW_OFFSET_WIDTH: 0,
  SHADOW_OPACITY: 0.1,
  SHADOW_RADIUS: 4,
  SHADOW_RADIUS_LARGE: 6,
  ELEVATION: 3,
} as const;

export const Typography = {
  FONT_SIZE_SMALL: 14,
  FONT_SIZE_DEFAULT: 15,
  FONT_SIZE_MEDIUM: 16,
  FONT_SIZE_LARGE: 20,
  FONT_SIZE_TITLE: 32,
  LINE_HEIGHT_DEFAULT: 24,
  LINE_HEIGHT_LARGE: 30,
  FONT_WEIGHT_SEMI_BOLD: "600",
  FONT_WEIGHT_BOLD: "bold",
} as const;

export const Spacing = {
  SMALL: 4,
  MEDIUM: 6,
  LARGE: 8,
  EXTRA_LARGE: 12,
  DOUBLE_EXTRA_LARGE: 16,
  TRIPLE_EXTRA_LARGE: 20,
} as const;

export const IconSizes = {
  SMALL: 16,
  MEDIUM: 18,
  LARGE: 20,
} as const;

export const IconColors = {
  ON_PRIMARY: "#fff",
} as const;

export const getColors = (scheme: ColorSchemeName) =>
  scheme === "dark" ? DarkColors : Colors;
