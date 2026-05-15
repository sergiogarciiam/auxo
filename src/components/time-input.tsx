import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Sizes } from "@/lib/theme";
import { Minus, Plus } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { useTheme } from "../hooks/other/useTheme";
import { NumberInput } from "./number-input";

type Props = {
  value: number;
  onChange: (seconds: number) => void;
  disabled?: boolean;
};

/**
 * Time input for selecting duration in seconds
 * Displays as two separate inputs: MM and SS with -5s/+5s buttons
 * Max value: 59:59 (3599 seconds)
 */
export function TimeInput({ value, onChange, disabled }: Props) {
  const MAX_SECONDS = 59 * 60 + 59;
  const colors = useTheme();
  const styles = createStyles(colors);

  const minutes = Math.floor(value / 60);
  const seconds = value % 60;

  const clamp = (v: number) => {
    if (v < 0) return 0;
    if (v > MAX_SECONDS) return MAX_SECONDS;
    return v;
  };

  const getCurrentTotal = () => minutes * 60 + seconds;

  const handleMinutesChange = (newMinutes: number) => {
    onChange(clamp(newMinutes * 60 + seconds));
  };

  const handleSecondsChange = (newSeconds: number) => {
    onChange(clamp(minutes * 60 + newSeconds));
  };

  const updateTotal = (delta: number) => {
    const currentTotal = getCurrentTotal();
    const newTotal = clamp(currentTotal + delta);
    onChange(newTotal);
  };

  return (
    <View style={styles.container}>
      <Button
        size="icon"
        variant="ghost"
        onPress={() => updateTotal(-5)}
        disabled={disabled}
        style={styles.button}
      >
        <Icon as={Minus} />
      </Button>

      <View style={styles.inputsWrapper}>
        <View style={styles.inputField}>
          <NumberInput
            value={minutes}
            onChange={handleMinutesChange}
            min={0}
            max={59}
            step={1}
            allowKeyboard={!disabled}
            showButtons={false}
            containerStyle={styles.numberInputContainer}
          />
        </View>

        <View style={styles.separator} />

        <View style={styles.inputField}>
          <NumberInput
            value={seconds}
            onChange={handleSecondsChange}
            min={0}
            max={59}
            step={1}
            allowKeyboard={!disabled}
            showButtons={false}
            containerStyle={styles.numberInputContainer}
          />
        </View>
      </View>

      <Button
        size="icon"
        variant="ghost"
        onPress={() => updateTotal(5)}
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
    },
    numberInputContainer: {
      borderWidth: 0,
      borderRadius: 0,
    },
    button: {
      paddingHorizontal: Sizes.PADDING,
      paddingVertical: Sizes.PADDING,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 0,
    },
    inputsWrapper: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 40,
    },
    inputField: {
      flex: 1,
    },
    separator: {
      marginHorizontal: 4,
    },
  });
