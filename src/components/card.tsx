import { StyleSheet, Text, View } from "react-native";
import { Colors, Sizes, Spacing } from "../constants/theme";
import { ThemedButton } from "./themed-button";

interface CardProps {
  text: string;
  onPlay?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

/**
 * Reusable card component for displaying workout/section information
 */
export function Card({ text, onPlay, onEdit, onDelete }: CardProps) {
  return (
    <View style={styles.card}>
      <Text>{text}</Text>
      <View style={styles.buttonsContainer}>
        {onPlay && <ThemedButton text="Start" onPress={onPlay} />}
        {onEdit && <ThemedButton text="Edit" onPress={onEdit} />}
        {onDelete && (
          <ThemedButton
            text="Delete"
            onPress={onDelete}
            variant="destructive"
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.BACKGROUND,
    borderRadius: Sizes.BORDER_RADIUS,
    padding: Sizes.PADDING_LARGE,
    shadowColor: "#000",
    shadowOffset: {
      width: Sizes.SHADOW_OFFSET_WIDTH,
      height: Sizes.SHADOW_OFFSET_HEIGHT,
    },
    shadowOpacity: Sizes.SHADOW_OPACITY,
    shadowRadius: Sizes.SHADOW_RADIUS,
    elevation: Sizes.ELEVATION,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: Spacing.LARGE,
  },
});
