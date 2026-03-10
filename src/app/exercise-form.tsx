import { useTheme } from "@react-navigation/native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";

export default function ExerciseForm() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colors = useTheme();

  return (
    <>
      <Stack.Screen
        options={{
          title: "Exercise",
        }}
      />
    </>
  );
}
