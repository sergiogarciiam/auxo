import { Button } from "@react-navigation/elements";
import { StyleSheet } from "react-native";

interface ThemedButtonProps {
  text: string;
  onPress: () => void;
  disabled?: boolean;
}

/**
 * Themed button component with consistent styling
 */
export const ThemedButton = ({
  text,
  onPress,
  disabled = false,
}: ThemedButtonProps) => {
  return (
    <Button onPress={onPress} disabled={disabled}>
      {text}
    </Button>
  );
};

// Currently using default Button styling from React Navigation
// Can be extended with custom styles as needed
StyleSheet.create({});
