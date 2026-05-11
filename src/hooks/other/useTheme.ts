import { getColors, type ThemeColors } from "@/lib/theme";
import { useColorScheme } from "react-native";
import { useSettingsContext } from "../../context/useSettingsContext";

/**
 * Hook that returns the colors for the current theme.
 * Respects the user's theme preference (light/dark/system).
 */
export const useTheme = (): ThemeColors => {
  const { theme } = useSettingsContext();
  const system = useColorScheme();

  const scheme = theme !== "system" ? theme : system || "light";

  return getColors(scheme as "light" | "dark");
};
