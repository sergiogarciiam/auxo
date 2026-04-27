import { getColors, type ThemeColors } from "@/lib/theme";
import { useColorScheme } from "react-native";
import { useSettingsContext } from "../context/useSettingsContext";

/**
 * Hook que retorna los colores del tema actual.
 * Respeta la preferencia de tema del usuario (light/dark/system).
 */
export const useTheme = (): ThemeColors => {
  const { theme } = useSettingsContext();
  const system = useColorScheme();

  const scheme = theme !== "system" ? theme : system || "light";

  return getColors(scheme as "light" | "dark");
};
