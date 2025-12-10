import { Pressable, StyleSheet, Text } from "react-native";
import { Colors, Sizes, Typography } from "../constants/theme";

interface ThemedButtonProps {
  text: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "success" | "destructive";
}

/**
 * Themed button component with consistent styling
 * Custom styled button that fully respects disabled state with color changes
 */
export const ThemedButton = ({
  text,
  onPress,
  disabled = false,
  variant = "primary",
}: ThemedButtonProps) => {
  const getButtonColor = () => {
    switch (variant) {
      case "success":
        return Colors.SUCCESS;
      case "destructive":
        return Colors.DESTRUCTIVE;
      case "primary":
      default:
        return Colors.NEUTRAL;
    }
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: getButtonColor() },
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
      ]}
    >
      <Text style={[styles.text, disabled && styles.textDisabled]}>{text}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: Sizes.PADDING_LARGE,
    paddingVertical: Sizes.PADDING,
    borderRadius: Sizes.BORDER_RADIUS,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    backgroundColor: Colors.DISABLED_BACKGROUND,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  text: {
    color: "#fff",
    fontWeight: Typography.FONT_WEIGHT_SEMI_BOLD,
    fontSize: Typography.FONT_SIZE_DEFAULT,
  },
  textDisabled: {
    color: Colors.DISABLED_TEXT,
  },
});
