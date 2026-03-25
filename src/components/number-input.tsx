import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react-native";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Sizes, Typography } from "../constants/theme";
import { useTheme } from "../hooks/useTheme";

type Props = {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
  allowKeyboard?: boolean;
};

export function NumberInput({
  value,
  onChange,
  step = 1,
  min = 0,
  max,
  allowKeyboard = true,
}: Props) {
  const colors = useTheme();
  const styles = createStyles(colors);
  const [text, setText] = useState(value.toString());

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

  const handleTextChange = (t: string) => {
    const clean = t.replace(/[^0-9]/g, ""); // solo enteros
    setText(clean);

    const num = Number(clean);
    if (!Number.isNaN(num)) onChange(clamp(num));
  };

  return (
    <View style={styles.container}>
      <Button
        size="icon"
        variant="outline"
        onPress={() => update(-step)}
        style={styles.button}
      >
        <Icon as={Minus} />
      </Button>

      <View style={styles.inputWrapper}>
        <Input
          value={text}
          keyboardType="numeric"
          editable={allowKeyboard}
          selectTextOnFocus
          onChangeText={handleTextChange}
          style={styles.input}
        />
      </View>

      <Button
        size="icon"
        variant="outline"
        onPress={() => update(step)}
        style={styles.button}
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
      borderRadius: 0, // para que quede unido al input
    },
    inputWrapper: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    input: {
      fontSize: Typography.FONT_SIZE_DEFAULT,
      color: colors.TEXT_PRIMARY,
      textAlign: "center",
      minWidth: 50,
      paddingVertical: Sizes.PADDING / 2,
      borderRadius: 0,
      borderWidth: 0,
    },
    unit: {
      marginLeft: 4,
      color: colors.TEXT_SECONDARY,
      fontSize: Typography.FONT_SIZE_SMALL,
    },
  });
