import { Button } from "@react-navigation/elements";
import { StyleSheet } from "react-native";

interface ThemedButtonInterface {
  text: string;
  onPress: () => void;
}

export const ThemedButton = ({ text, onPress }: ThemedButtonInterface) => {
  return <Button onPress={onPress}>{text}</Button>;
};

const styles = StyleSheet.create({});
