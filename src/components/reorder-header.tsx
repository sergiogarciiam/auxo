import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { IconSizes, Spacing } from "../constants/theme";
import { useTheme } from "../hooks/useTheme";
import { ThemedButton } from "./themed-button";

interface ReorderHeaderProps {
  handleDiscard: () => void;
  handleDone: () => void;
}

export function ReorderHeader({
  handleDiscard,
  handleDone,
}: ReorderHeaderProps) {
  const colors = useTheme();
  return (
    <View style={styles.headerButtonRow}>
      <ThemedButton
        onPress={handleDiscard}
        icon={
          <MaterialIcons
            name="backspace"
            size={IconSizes.MEDIUM}
            color={colors.PRIMARY_ICON_COLOR}
          />
        }
        variant="destructive"
      />
      <ThemedButton
        icon={
          <MaterialIcons
            name="check"
            size={IconSizes.MEDIUM}
            color={colors.PRIMARY_ICON_COLOR}
          />
        }
        onPress={handleDone}
        variant="success"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerButtonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: Spacing.LARGE,
  },
});
