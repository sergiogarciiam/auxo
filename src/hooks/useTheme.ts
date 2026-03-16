import { useColorScheme } from "react-native";
import { getColors } from "../constants/theme";
import { useSettingsContext } from "../context/useSettingsContext";

export const useTheme = () => {
  const { theme } = useSettingsContext();
  const system = useColorScheme();

  const scheme = theme !== "system" ? theme : system || "system";

  return getColors(scheme);
};
