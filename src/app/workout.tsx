import { Button } from "@react-navigation/elements";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";
import { Card } from "../components/card";
import { ThemedText } from "../components/themed-text";
import { useSaveWorkout } from "../hooks/useSaveWorkout";
import { useWorkoutStore } from "../stores/useWorkoutStore";

export default function NewWorkout() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const { saveWorkout } = useSaveWorkout();
  const { workout, startNewWorkout, setName, reset } = useWorkoutStore();

  useEffect(() => {
    const load = async () => {
      if (!workout) {
        startNewWorkout();
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const onSave = async () => {
    if (!workout) return;
    saveWorkout(workout);
    reset();
    router.replace("/homepage");
  };

  const onDelete = async () => {
    reset();
    router.replace("/homepage");
  };

  if (!workout) return;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedText type="title">Workout</ThemedText>

      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Workout name"
          value={workout.name}
          onChangeText={setName}
        />

        <ThemedText type="subtitle">Sections</ThemedText>
        {workout.sections
          .filter((section) => section.localStatus !== "deleted")
          .map((section, index) => (
            <Card key={index} text={section.name} />
          ))}

        <Button onPressIn={() => router.push("/section")}>New Section</Button>
      </View>

      <View style={styles.row}>
        {workout.localStatus === "updated" && (
          <Button onPressIn={onDelete}>Delete</Button>
        )}
        <Button onPressIn={() => router.push("/homepage")}>Cancel</Button>
        <Button onPressIn={onSave}>Save</Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 20 },
  card: {
    padding: 20,
    backgroundColor: "white",
    borderRadius: 12,
    gap: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#fafafa",
  },
  row: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
});
