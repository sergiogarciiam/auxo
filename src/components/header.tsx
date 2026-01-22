import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { IconColors, IconSizes, Spacing } from "../constants/theme";
import { ThemedButton } from "./themed-button";

interface HeaderProps {
  handleDiscard: () => void;
  handleDelete: () => void;
  handleDone: () => void;
  isCreating: boolean;
}

export function Header({
  handleDiscard,
  handleDelete,
  handleDone,
  isCreating,
}: HeaderProps) {
  return (
    <View style={styles.headerButtonRow}>
      <ThemedButton
        icon={
          <MaterialIcons
            name="arrow-back"
            size={IconSizes.MEDIUM}
            color={IconColors.ON_PRIMARY}
          />
        }
        onPress={handleDiscard}
      />

      {!isCreating && (
        <ThemedButton
          icon={
            <MaterialIcons
              name="delete"
              size={IconSizes.MEDIUM}
              color={IconColors.ON_PRIMARY}
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
            color={IconColors.ON_PRIMARY}
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
