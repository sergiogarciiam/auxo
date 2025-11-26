import { Button } from "@react-navigation/elements";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { ThemedText } from "../components/themed-text";
import { useWorkouts } from "../hooks/useWorkouts";

export default function NewWorkout() {
  const router = useRouter();
  const [workoutName, setWorkoutName] = useState("");
  const { createWorkout } = useWorkouts();

  const onSave = async () => {
    await createWorkout({ name: workoutName });
    router.navigate("/homepage");
  };

  return (
    <View style={styles.container}>
      <View>
        <ThemedText type="title">New Workout</ThemedText>

        <TextInput
          style={styles.input}
          placeholder="Enter workout name"
          value={workoutName}
          onChangeText={setWorkoutName}
        />

        <View>
          <ThemedText type="subtitle">Sections</ThemedText>
          <Button onPressIn={() => router.navigate("/new-section")}>
            New Section
          </Button>
        </View>
      </View>

      <View style={styles.buttonRow}>
        <Button onPressIn={() => router.navigate("/homepage")}>Cancel</Button>
        <Button onPressIn={onSave}>Save</Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  buttonRow: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
});
