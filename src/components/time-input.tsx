import { StyleSheet, Text, TextInput, View } from "react-native";
import { Sizes, Spacing, Typography } from "../constants/theme";
import { useTheme } from "../hooks/useTheme";

type Props = {
  value: number;
  onChange: (seconds: number) => void;
  disabled?: boolean;
};

export function TimeInput({ value, onChange, disabled }: Props) {
  const colors = useTheme();
  const styles = createStyles(colors);
  const minutes = Math.floor(value / 60);
  const seconds = value % 60;

  const updateMinutes = (text: string) => {
    const m = Number(text) || 0;
    onChange(m * 60 + seconds);
  };

  const updateSeconds = (text: string) => {
    let s = Number(text) || 0;
    if (s > 59) s = 59;
    onChange(minutes * 60 + s);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, disabled && styles.disabled]}
        keyboardType="numeric"
        editable={!disabled}
        value={minutes.toString().padStart(2, "0")}
        onChangeText={updateMinutes}
        placeholder="0"
      />
      <Text>:</Text>
      <TextInput
        style={[styles.input, disabled && styles.disabled]}
        keyboardType="numeric"
        editable={!disabled}
        value={seconds.toString().padStart(2, "0")}
        onChangeText={updateSeconds}
        placeholder="00"
      />
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      gap: Spacing.MEDIUM,
      alignItems: "center",
    },
    input: {
      flex: 1,
      borderWidth: Sizes.BORDER_WIDTH,
      borderColor: colors.BORDER,
      padding: Sizes.PADDING,
      borderRadius: Sizes.BORDER_RADIUS,
      backgroundColor: colors.LIGHT_BACKGROUND,
      fontSize: Typography.FONT_SIZE_DEFAULT,
      textAlign: "center",
      color: colors.TEXT_PRIMARY,
    },
    disabled: {
      backgroundColor: colors.DISABLED_BACKGROUND,
      color: colors.DISABLED_TEXT,
    },
  });
