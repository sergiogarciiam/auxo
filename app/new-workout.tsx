import { Button } from "@react-navigation/elements";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

export default function NewWorkout() {
  const router = useRouter();
  const [workoutName, setWorkoutName] = useState("");

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>New Workout</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter workout name"
          value={workoutName}
          onChangeText={setWorkoutName}
        />

        <View>
          <Text style={styles.subTitle}>Sections</Text>
          <Button onPressIn={() => router.navigate("/new-section")}>
            New Section
          </Button>
        </View>
      </View>

      <View style={styles.buttonRow}>
        <Button onPressIn={() => router.navigate("/homepage")}>Cancel</Button>
        <Button onPressIn={() => router.navigate("/homepage")}>Save</Button>
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
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
