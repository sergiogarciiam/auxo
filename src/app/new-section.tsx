import { Button } from "@react-navigation/elements";
import { useRouter } from "expo-router";
import { View } from "react-native";
import { ThemedText } from "../components/themed-text";

export default function NewSection() {
  const router = useRouter();

  return (
    <View
      style={{
        flex: 1,
        padding: 20,
      }}
    >
      <ThemedText type="title">New Section</ThemedText>
      <Button
        onPressIn={() => router.navigate("/new-workout")}
        style={{
          alignSelf: "flex-end",
        }}
      >
        Create
      </Button>
    </View>
  );
}
