import { DarkTheme, DefaultTheme, type Theme } from "@react-navigation/native";

// ============================================================================
// CORE THEME COLORS
// ============================================================================

const BASE_COLORS = {
  light: {
    background: "hsl(0 0% 100%)",
    foreground: "hsl(0 0% 3.9%)",
    card: "hsl(0 0% 100%)",
    cardForeground: "hsl(0 0% 3.9%)",
    popover: "hsl(0 0% 100%)",
    popoverForeground: "hsl(0 0% 3.9%)",
    primary: "hsl(0 0% 9%)",
    primaryForeground: "hsl(0 0% 98%)",
    secondary: "hsl(0 0% 96.1%)",
    secondaryForeground: "hsl(0 0% 9%)",
    muted: "hsl(0 0% 96.1%)",
    mutedForeground: "hsl(0 0% 45.1%)",
    accent: "hsl(0 0% 96.1%)",
    accentForeground: "hsl(0 0% 9%)",
    destructive: "hsl(0 84.2% 60.2%)",
    border: "hsl(0 0% 89.8%)",
    input: "hsl(0 0% 89.8%)",
    ring: "hsl(0 0% 63%)",
    radius: "0.625rem",
    chart1: "hsl(12 76% 61%)",
    chart2: "hsl(173 58% 39%)",
    chart3: "hsl(197 37% 24%)",
    chart4: "hsl(43 74% 66%)",
    chart5: "hsl(27 87% 67%)",
  },
  dark: {
    background: "hsl(0 0% 3.9%)",
    foreground: "hsl(0 0% 98%)",
    card: "hsl(0 0% 3.9%)",
    cardForeground: "hsl(0 0% 98%)",
    popover: "hsl(0 0% 3.9%)",
    popoverForeground: "hsl(0 0% 98%)",
    primary: "hsl(0 0% 98%)",
    primaryForeground: "hsl(0 0% 9%)",
    secondary: "hsl(0 0% 14.9%)",
    secondaryForeground: "hsl(0 0% 98%)",
    muted: "hsl(0 0% 14.9%)",
    mutedForeground: "hsl(0 0% 63.9%)",
    accent: "hsl(0 0% 14.9%)",
    accentForeground: "hsl(0 0% 98%)",
    destructive: "hsl(0 70.9% 59.4%)",
    border: "hsl(0 0% 14.9%)",
    input: "hsl(0 0% 14.9%)",
    ring: "hsl(300 0% 45%)",
    radius: "0.625rem",
    chart1: "hsl(220 70% 50%)",
    chart2: "hsl(160 60% 45%)",
    chart3: "hsl(30 80% 55%)",
    chart4: "hsl(280 65% 60%)",
    chart5: "hsl(340 75% 55%)",
  },
};

// ============================================================================
// ADDITIONAL COLORS & SEMANTIC TOKENS
// ============================================================================

const ADDITIONAL_COLORS = {
  light: {
    PRIMARY: "#2E90FA",
    BACKGROUND_SECONDARY: "#f5f5f5",
    MENU_BACKGROUND: "#333",
    PICKER_BACKGROUND: "#fff",
    LIGHT_BACKGROUND: "#fafafa",
    DISABLED_BACKGROUND: "#ddd",
    DISABLED_TEXT: "#999",
    TEXT_PRIMARY: "#000",
    TEXT_SECONDARY: "#555",
    INDICATOR_INACTIVE: "#ccc",
    SUCCESS: "#039855",
    WARNING: "#DC6803",
    PRIMARY_ICON_COLOR: "#fff",
    DISABLE_ICON_COLOR: "#777",
    SHADOW_COLOR: "#000",
  },
  dark: {
    PRIMARY: "#2E90FA",
    BACKGROUND_SECONDARY: "#1e1e1e",
    MENU_BACKGROUND: "#1e1e1e",
    PICKER_BACKGROUND: "#1e1e1e",
    LIGHT_BACKGROUND: "#1e1e1e",
    DISABLED_BACKGROUND: "#2a2a2a",
    DISABLED_TEXT: "#777",
    TEXT_PRIMARY: "#fff",
    TEXT_SECONDARY: "#bbb",
    INDICATOR_INACTIVE: "#555",
    SUCCESS: "#039855",
    WARNING: "#DC6803",
    PRIMARY_ICON_COLOR: "#fff",
    DISABLE_ICON_COLOR: "#555",
    SHADOW_COLOR: "#777",
  },
};

// ============================================================================
// SIZING & TYPOGRAPHY
// ============================================================================

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

// ============================================================================
// COMPLETE COLOR PALETTE
// ============================================================================

export type ColorScheme = "light" | "dark";

export type ThemeColors = ReturnType<typeof getColors>;

/**
 * Retorna el esquema de colores completo para el tema especificado
 */
export const getColors = (scheme: ColorScheme) => {
  const baseColors = BASE_COLORS[scheme];
  const additionalColors = ADDITIONAL_COLORS[scheme];

  return {
    ...baseColors,
    ...additionalColors,
    // Aliases for backward compatibility (uppercase versions of base colors)
    BORDER: baseColors.border,
  };
};

/**
 * Legacy export for backward compatibility
 */
export const THEME = {
  light: BASE_COLORS.light,
  dark: BASE_COLORS.dark,
};

// ============================================================================
// REACT NAVIGATION THEME
// ============================================================================

export const NAV_THEME: Record<"light" | "dark", Theme> = {
  light: {
    ...DefaultTheme,
    colors: {
      background: BASE_COLORS.light.background,
      border: BASE_COLORS.light.border,
      card: BASE_COLORS.light.card,
      notification: BASE_COLORS.light.destructive,
      primary: BASE_COLORS.light.primary,
      text: BASE_COLORS.light.foreground,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      background: BASE_COLORS.dark.background,
      border: BASE_COLORS.dark.border,
      card: BASE_COLORS.dark.card,
      notification: BASE_COLORS.dark.destructive,
      primary: BASE_COLORS.dark.primary,
      text: BASE_COLORS.dark.foreground,
    },
  },
};
