import { Button } from "@react-navigation/elements";
import { useRouter } from "expo-router";
import { View } from "react-native";

export default function NewSection() {
  const router = useRouter();

  return (
    <View
      style={{
        flex: 1,
        padding: 20,
      }}
    >
      <h1>New Workouts</h1>
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
