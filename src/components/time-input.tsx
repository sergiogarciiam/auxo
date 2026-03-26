import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react-native";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
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

  const MAX_SECONDS = 59 * 60 + 59;

  const [minutesText, setMinutesText] = useState("00");
  const [secondsText, setSecondsText] = useState("00");

  useEffect(() => {
    const minutes = Math.floor(value / 60);
    const seconds = value % 60;
    setMinutesText(minutes.toString().padStart(2, "0"));
    setSecondsText(seconds.toString().padStart(2, "0"));
  }, [value]);

  const clamp = (v: number) => Math.max(0, Math.min(v, MAX_SECONDS));

  const update = (delta: number) => onChange(clamp(value + delta));

  const updateMinutesText = (text: string) => {
    const clean = text.replace(/[^0-9]/g, "").slice(0, 2);
    setMinutesText(clean);
  };

  const updateSecondsText = (text: string) => {
    const clean = text.replace(/[^0-9]/g, "").slice(0, 2);
    setSecondsText(clean);
  };

  const commitMinutes = () => {
    let m = Number(minutesText) || 0;
    if (m > 59) m = 59;
    const s = Number(secondsText) || 0;
    onChange(clamp(m * 60 + s));
  };

  const commitSeconds = () => {
    let s = Number(secondsText) || 0;
    if (s > 59) s = 59;
    const m = Number(minutesText) || 0;
    onChange(clamp(m * 60 + s));
  };

  return (
    <View style={styles.container}>
      {/* Botón -5s */}
      <Button
        size="icon"
        variant="outline"
        onPress={() => update(-5)}
        style={styles.button}
        disabled={disabled}
      >
        <Icon as={Minus} />
      </Button>

      {/* Inputs */}
      <View style={styles.time}>
        <Input
          value={minutesText}
          onChangeText={updateMinutesText}
          onEndEditing={commitMinutes}
          keyboardType="numeric"
          editable={!disabled}
          selectTextOnFocus
          style={styles.input}
        />
        <Text style={styles.separator}>:</Text>
        <Input
          value={secondsText}
          onChangeText={updateSecondsText}
          onEndEditing={commitSeconds}
          keyboardType="numeric"
          editable={!disabled}
          selectTextOnFocus
          style={styles.input}
        />
      </View>

      {/* Botón +5s */}
      <Button
        size="icon"
        variant="outline"
        onPress={() => update(+5)}
        style={styles.button}
        disabled={disabled}
      >
        <Icon as={Plus} />
      </Button>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: Sizes.BORDER_WIDTH,
      borderColor: colors.BORDER,
      borderRadius: Sizes.BORDER_RADIUS,
      overflow: "hidden",
      backgroundColor: colors.LIGHT_BACKGROUND,
    },
    button: {
      paddingHorizontal: Sizes.PADDING,
      paddingVertical: Sizes.PADDING,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 0,
    },
    time: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: Spacing.SMALL,
      paddingHorizontal: Sizes.PADDING,
    },
    separator: {
      fontSize: Typography.FONT_SIZE_DEFAULT,
      color: colors.TEXT_PRIMARY,
    },
    input: {
      fontSize: Typography.FONT_SIZE_DEFAULT,
      color: colors.TEXT_PRIMARY,
      width: 40,
      paddingVertical: Sizes.PADDING / 2,
      borderWidth: 0,
      borderRadius: 0,
      paddingHorizontal: 0,
    },
  });
