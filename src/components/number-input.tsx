import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { IconSizes, Sizes, Typography } from "../constants/theme";
import { useTheme } from "../hooks/useTheme";

type Props = {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
  unit?: string;
  allowKeyboard?: boolean;
};

export function NumberInput({
  value,
  onChange,
  step = 1,
  min = 0,
  max,
  unit,
  allowKeyboard = true,
}: Props) {
  const colors = useTheme();
  const styles = createStyles(colors);

  const [text, setText] = useState(value.toString());
  const interval = useRef<number | null>(null);

  useEffect(() => {
    setText(value.toString());
  }, [value]);

  const clamp = (v: number) => {
    if (v < min) return min;
    if (max !== undefined && v > max) return max;
    return v;
  };

  const update = (delta: number) => {
    const next = clamp(value + delta);
    onChange(next);
  };

  const startHold = (delta: number) => {
    update(delta);
    interval.current = setInterval(() => update(delta), 120);
  };

  const stopHold = () => {
    if (interval.current) clearInterval(interval.current);
  };

  const handleTextChange = (t: string) => {
    const clean = t.replace(/[^0-9.]/g, "");
    setText(clean);

    const num = Number(clean);
    if (!Number.isNaN(num)) onChange(clamp(num));
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => update(-step)}
        onLongPress={() => startHold(-step)}
        onPressOut={stopHold}
        style={styles.button}
      >
        <MaterialIcons
          name="remove"
          size={IconSizes.SMALL}
          color={colors.PRIMARY_ICON_COLOR}
        />
      </TouchableOpacity>

      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={text}
          keyboardType="numeric"
          editable={allowKeyboard}
          selectTextOnFocus
          onChangeText={handleTextChange}
        />

        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>

      <TouchableOpacity
        onPress={() => update(step)}
        onLongPress={() => startHold(step)}
        onPressOut={stopHold}
        style={styles.button}
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
      borderWidth: Sizes.BORDER_WIDTH,
      borderColor: colors.BORDER,
      borderRadius: Sizes.BORDER_RADIUS,
      backgroundColor: colors.LIGHT_BACKGROUND,
      alignItems: "center",
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

    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      flex: 1,
      paddingHorizontal: Sizes.PADDING,
    },

    input: {
      fontSize: Typography.FONT_SIZE_DEFAULT,
      color: colors.TEXT_PRIMARY,
      textAlign: "center",
      minWidth: 40,
    },

    unit: {
      marginLeft: 4,
      color: colors.TEXT_SECONDARY,
      fontSize: Typography.FONT_SIZE_SMALL,
    },
  });
