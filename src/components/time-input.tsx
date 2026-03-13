import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { IconSizes, Sizes, Spacing, Typography } from "../constants/theme";
import { useTheme } from "../hooks/useTheme";

type Props = {
  value: number; // segundos totales
  onChange: (seconds: number) => void;
  disabled?: boolean;
};

export function TimeInput({ value, onChange, disabled }: Props) {
  const colors = useTheme();
  const styles = createStyles(colors);

  const MAX_SECONDS = 59 * 60 + 59; // 59:59
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Guardamos los textos de input localmente para permitir escribir dos dígitos
  const [minutesText, setMinutesText] = useState("00");
  const [secondsText, setSecondsText] = useState("00");

  // Sincronizar cuando value cambie desde afuera (botones u otra fuente)
  useEffect(() => {
    const minutes = Math.floor(value / 60);
    const seconds = value % 60;
    setMinutesText(minutes.toString().padStart(2, "0"));
    setSecondsText(seconds.toString().padStart(2, "0"));
  }, [value]);

  const clamp = (v: number) => Math.max(0, Math.min(v, MAX_SECONDS));

  // Actualizar valor desde botones +/-
  const update = (delta: number) => {
    onChange(clamp(value + delta));
  };

  const startHold = (delta: number) => {
    update(delta);
    interval.current = setInterval(() => update(delta), 120);
  };

  const stopHold = () => {
    if (interval.current) {
      clearInterval(interval.current);
      interval.current = null;
    }
  };

  // Actualización mientras el usuario escribe
  const updateMinutesText = (text: string) => {
    const clean = text.replace(/[^0-9]/g, "").slice(0, 2);
    setMinutesText(clean);
  };

  const updateSecondsText = (text: string) => {
    const clean = text.replace(/[^0-9]/g, "").slice(0, 2);
    setSecondsText(clean);
  };

  // Confirmar valor al terminar de editar (onEndEditing)
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
      <TouchableOpacity
        style={styles.button}
        onPress={() => update(-5)}
        onLongPress={() => startHold(-5)}
        onPressOut={stopHold}
        disabled={disabled || value <= 0}
      >
        <MaterialIcons
          name="remove"
          size={IconSizes.SMALL}
          color={colors.PRIMARY_ICON_COLOR}
        />
      </TouchableOpacity>

      {/* Input de tiempo */}
      <View style={styles.time}>
        <TextInput
          style={[styles.input, disabled && styles.disabled]}
          keyboardType="numeric"
          editable={!disabled}
          selectTextOnFocus
          value={minutesText}
          onChangeText={updateMinutesText}
          onEndEditing={commitMinutes}
        />

        <Text style={styles.separator}>:</Text>

        <TextInput
          style={[styles.input, disabled && styles.disabled]}
          keyboardType="numeric"
          editable={!disabled}
          selectTextOnFocus
          value={secondsText}
          onChangeText={updateSecondsText}
          onEndEditing={commitSeconds}
        />
      </View>

      {/* Botón +5s */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => update(5)}
        onLongPress={() => startHold(5)}
        onPressOut={stopHold}
        disabled={disabled || value >= MAX_SECONDS}
      >
        <MaterialIcons
          name="add"
          size={IconSizes.SMALL}
          color={colors.PRIMARY_ICON_COLOR}
        />
      </TouchableOpacity>
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
      backgroundColor: colors.LIGHT_BACKGROUND,
      overflow: "hidden",
    },

    button: {
      paddingHorizontal: Sizes.PADDING,
      paddingVertical: Sizes.PADDING,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.PRIMARY,
      borderRadius: Sizes.BORDER_RADIUS,
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
      minWidth: 40,
      textAlign: "center",
      fontSize: Typography.FONT_SIZE_DEFAULT,
      color: colors.TEXT_PRIMARY,
    },

    disabled: {
      color: colors.DISABLED_TEXT,
    },
  });
