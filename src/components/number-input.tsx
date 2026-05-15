import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Sizes, Typography } from "@/lib/theme";
import { Minus, Plus } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { useTheme } from "../hooks/other/useTheme";

type Props = {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
  allowKeyboard?: boolean;
  showButtons?: boolean;
  containerStyle?: Record<string, any>;
};

export function NumberInput({
  value,
  onChange,
  step = 1,
  min = 0,
  max,
  allowKeyboard = true,
  showButtons = true,
  containerStyle,
}: Props) {
  const colors = useTheme();
  const styles = createStyles(colors);

  const clamp = (v: number) => {
    if (v < min) return min;
    if (max !== undefined && v > max) return max;
    return v;
  };

  const update = (delta: number) => {
    onChange(clamp(value + delta));
  };

  const handleTextChange = (t: string) => {
    const clean = t.replace(/[^0-9]/g, "");

    if (clean === "") {
      onChange(min);
      return;
    }

    const num = Number(clean);

    if (!Number.isNaN(num)) {
      onChange(clamp(num));
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {showButtons && (
        <Button
          size="icon"
          variant="ghost"
          onPress={() => update(-step)}
          style={styles.button}
        >
          <Icon as={Minus} />
        </Button>
      )}

      <Input
        value={value.toString().padStart(2, "0")}
        keyboardType="numeric"
        editable={allowKeyboard}
        selectTextOnFocus
        onChangeText={handleTextChange}
        style={styles.input}
      />

      {showButtons && (
        <Button
          size="icon"
          variant="ghost"
          onPress={() => update(step)}
          style={styles.button}
        >
          <Icon as={Plus} />
        </Button>
      )}
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
    },

    button: {
      paddingHorizontal: Sizes.PADDING,
      paddingVertical: Sizes.PADDING,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 0,
    },

    input: {
      flex: 1,
      fontSize: Typography.FONT_SIZE_DEFAULT,
      color: colors.TEXT_PRIMARY,
      textAlign: "center",
      minWidth: 50,
      paddingVertical: Sizes.PADDING / 2,
      borderRadius: 0,
      borderWidth: 0,
    },
  });
