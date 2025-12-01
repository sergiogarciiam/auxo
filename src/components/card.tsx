import { Button } from "@react-navigation/elements";
import { StyleSheet, Text, View } from "react-native";

interface CardProps {
  text: string;
  onPlay?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function Card({ text, onPlay, onEdit, onDelete }: CardProps) {
  return (
    <View style={style.card}>
      <Text>{text}</Text>
      <View style={style.buttonsContainer}>
        {onPlay && <Button>Start</Button>}
        {onEdit && <Button onPressIn={onEdit}>Edit</Button>}
        {onDelete && <Button>Delete</Button>}
      </View>
    </View>
  );
}

const style = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  buttonsContainer: {
    flexDirection: "row",
    gap: 8,
  },
});
