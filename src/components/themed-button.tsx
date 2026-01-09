import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Colors, Sizes, Typography } from "../constants/theme";

interface ThemedButtonProps {
  text?: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "success" | "destructive" | "icon";
  icon?: React.ReactNode;
  style?: object;
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
  icon,
  style,
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
        variant === "icon" && styles.iconButton,
        { backgroundColor: getButtonColor() },
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
        style,
      ]}
    >
      <View style={styles.content}>
        {icon && text ? (
          <View style={styles.iconWithTextRow}>
            {icon}
            <Text
              style={[
                styles.text,
                variant === "icon" && styles.iconText,
                disabled && styles.textDisabled,
                styles.iconTextSpacing,
              ]}
            >
              {text}
            </Text>
          </View>
        ) : icon ? (
          icon
        ) : (
          <Text
            style={[
              styles.text,
              variant === "icon" && styles.iconText,
              disabled && styles.textDisabled,
            ]}
          >
            {text}
          </Text>
        )}
      </View>
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

  iconButton: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    minWidth: 32,
    minHeight: 32,
    borderRadius: 16,
  },

  content: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconWithTextRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconTextSpacing: {
    marginLeft: Sizes.PADDING,
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
  iconText: {
    fontSize: 14,
  },
  textDisabled: {
    color: Colors.DISABLED_TEXT,
  },
});
