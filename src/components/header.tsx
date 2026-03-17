import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { IconSizes, Spacing } from "../constants/theme";
import { useTheme } from "../hooks/useTheme";
import { ThemedButton } from "./themed-button";

interface HeaderProps {
  handleDelete: () => void;
  handleDone: () => void;
  isCreating: boolean;
}

export function Header({ handleDelete, handleDone, isCreating }: HeaderProps) {
  const colors = useTheme();
  return (
    <View style={styles.headerButtonRow}>
      {!isCreating && (
        <ThemedButton
          icon={
            <MaterialIcons
              name="delete"
              size={IconSizes.MEDIUM}
              color={colors.PRIMARY_ICON_COLOR}
            />
          }
          onPress={handleDelete}
          variant="destructive"
        />
      )}
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
    padding: Spacing.LARGE,
    gap: Spacing.MEDIUM,
  },
});
