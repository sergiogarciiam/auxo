import { useColorScheme } from "react-native";
import { getColors } from "../constants/theme";

export const useTheme = () => {
  const colorScheme = useColorScheme();
  return getColors(colorScheme);
};
