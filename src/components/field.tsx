import { StyleSheet, Text, View } from "react-native";
import { Spacing, Typography } from "../constants/theme";
import { useTheme } from "../hooks/useTheme";

interface FieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}

export function Field({ label, required = false, children }: FieldProps) {
  const colors = useTheme();
  const styles = createStyles(colors);
  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
        {required && " *"}
      </Text>
      {children}
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    field: {
      gap: Spacing.MEDIUM,
    },
    label: {
      fontSize: Typography.FONT_SIZE_SMALL,
      fontWeight: Typography.FONT_WEIGHT_SEMI_BOLD,
      color: colors.TEXT_SECONDARY,
    },
  });
