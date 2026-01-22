import { StyleSheet, Text, TextInput, View } from "react-native";
import { Colors, Sizes, Spacing, Typography } from "../constants/theme";

type Props = {
  value: number;
  onChange: (seconds: number) => void;
  disabled?: boolean;
};

export function TimeInput({ value, onChange, disabled }: Props) {
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

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: Spacing.MEDIUM,
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: Sizes.BORDER_WIDTH,
    borderColor: Colors.BORDER,
    padding: Sizes.PADDING,
    borderRadius: Sizes.BORDER_RADIUS,
    backgroundColor: Colors.LIGHT_BACKGROUND,
    fontSize: Typography.FONT_SIZE_DEFAULT,
    textAlign: "center",
  },
  disabled: {
    backgroundColor: Colors.DISABLED_BACKGROUND,
    color: Colors.DISABLED_TEXT,
  },
});
