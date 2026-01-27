import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { Colors, IconSizes, Spacing } from "../constants/theme";
import { ThemedButton } from "./themed-button";

interface ReorderHeaderProps {
  handleDiscard: () => void;
  handleDone: () => void;
}

export function ReorderHeader({
  handleDiscard,
  handleDone,
}: ReorderHeaderProps) {
  return (
    <View style={styles.headerButtonRow}>
      <ThemedButton
        onPress={handleDiscard}
        icon={
          <MaterialIcons
            name="backspace"
            size={IconSizes.MEDIUM}
            color={Colors.PRIMARY_ICON_COLOR}
          />
        }
        variant="destructive"
      />
      <ThemedButton
        icon={
          <MaterialIcons
            name="check"
            size={IconSizes.MEDIUM}
            color={Colors.PRIMARY_ICON_COLOR}
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
