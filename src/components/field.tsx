import { StyleSheet, Text, View } from "react-native";
import { Colors, Spacing, Typography } from "../constants/theme";

interface FieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}

/**
 * Component for form field layout
 */
export function Field({ label, required = false, children }: FieldProps) {
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

const styles = StyleSheet.create({
  field: {
    gap: Spacing.MEDIUM,
  },
  label: {
    fontSize: Typography.FONT_SIZE_SMALL,
    fontWeight: Typography.FONT_WEIGHT_SEMI_BOLD,
    color: Colors.TEXT_SECONDARY,
  },
});
