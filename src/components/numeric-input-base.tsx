/**
 * Generic numeric input component with increment/decrement buttons
 * Replaces duplicated TimeInput and NumberInput implementations
 *
 * Supports:
 * - Custom increment/decrement step size
 * - Min/max clamping
 * - Custom format/parse functions
 * - Keyboard input (optional)
 * - Disabled state
 */

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Sizes } from "@/lib/theme";
import { Minus, Plus } from "lucide-react-native";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "../hooks/other/useTheme";

export interface NumericInputBaseProps {
  /** Current numeric value */
  value: number;
  /** Callback when value changes */
  onChange: (value: number) => void;
  /** Step size for increment/decrement buttons */
  step?: number;
  /** Minimum allowed value */
  min?: number;
  /** Maximum allowed value */
  max?: number;
  /** Allow direct keyboard input */
  allowKeyboard?: boolean;
  /** Disable all interactions */
  disabled?: boolean;
  /** Convert numeric value to display string */
  format?: (value: number) => string;
  /** Convert input string back to numeric value */
  parse?: (text: string) => number | null;
  /** Custom button increment/decrement values (overrides step) */
  buttonIncrement?: number;
  buttonDecrement?: number;
  /** Helper text shown beside input */
  suffix?: string;
}

export function NumericInputBase({
  value,
  onChange,
  step = 1,
  min = 0,
  max,
  allowKeyboard = true,
  disabled = false,
  format = String,
  parse,
  buttonIncrement = step,
  buttonDecrement = step,
  suffix,
}: NumericInputBaseProps) {
  const colors = useTheme();
  const styles = createStyles(colors);
  const [text, setText] = useState(format(value));

  useEffect(() => {
    setText(format(value));
  }, [value, format]);

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
    setText(t);
    const parsed = parse ? parse(t) : parseFloat(t);
    if (parsed !== null && !Number.isNaN(parsed)) {
      onChange(clamp(parsed));
    }
  };

  return (
    <View style={styles.container}>
      <Button
        size="icon"
        variant="outline"
        onPress={() => update(-buttonDecrement)}
        style={styles.button}
        disabled={disabled}
      >
        <Icon as={Minus} />
      </Button>

      <View style={styles.inputWrapper}>
        <Input
          value={text}
          keyboardType="decimal-pad"
          editable={!disabled && allowKeyboard}
          selectTextOnFocus
          onChangeText={handleTextChange}
          style={styles.input}
        />
        {suffix && <View style={styles.suffix}>{suffix}</View>}
      </View>

      <Button
        size="icon"
        variant="outline"
        onPress={() => update(buttonIncrement)}
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
    },
    inputWrapper: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: Sizes.PADDING,
    },
    input: {
      flex: 1,
      textAlign: "center",
    },
    suffix: {
      marginLeft: Sizes.PADDING,
    },
  });
