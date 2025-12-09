import { Button } from "@react-navigation/elements";
import { StyleSheet, Text, View } from "react-native";
import { Colors, Sizes, Spacing } from "../constants/theme";

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
        {onPlay && <Button>Start</Button>}
        {onEdit && <Button onPressIn={onEdit}>Edit</Button>}
        {onDelete && <Button>Delete</Button>}
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
