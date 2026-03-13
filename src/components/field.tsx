import { Pressable, StyleSheet, Text, View } from "react-native";
import { Spacing, Typography } from "../constants/theme";
import { useTheme } from "../hooks/useTheme";

interface FieldProps {
  label: string;
  required?: boolean;
  onHelpPress?: () => void;
  children: React.ReactNode;
}

export function Field({
  label,
  required = false,
  onHelpPress,
  children,
}: FieldProps) {
  const colors = useTheme();
  const styles = createStyles(colors);
  return (
    <View style={styles.field}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>
          {label}
          {required && " *"}
        </Text>
        {onHelpPress && (
          <Pressable style={styles.button} onPress={onHelpPress}>
            <Text style={styles.buttonText}>?</Text>
          </Pressable>
        )}
      </View>
      {children}
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    field: {
      gap: Spacing.MEDIUM,
      flex: 1,
    },
    label: {
      fontSize: Typography.FONT_SIZE_SMALL,
      fontWeight: Typography.FONT_WEIGHT_SEMI_BOLD,
      color: colors.TEXT_SECONDARY,
    },
    labelContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.SMALL,
    },
    button: {
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.BORDER,
    },
    buttonText: {
      color: colors.TEXT_PRIMARY,
      fontSize: Typography.FONT_SIZE_SMALL,
      fontWeight: "bold",
    },
  });
