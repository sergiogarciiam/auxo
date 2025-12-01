import { Button } from "@react-navigation/elements";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";
import { Card } from "../components/card";
import { ThemedText } from "../components/themed-text";
import { useWorkouts } from "../hooks/useWorkouts";
import { SectionInterface } from "../types/section";

export default function NewWorkout() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [workoutName, setWorkoutName] = useState("");
  const [sections, setSections] = useState<SectionInterface[]>([]);
  const { createWorkout, getWorkoutById, deleteWorkout, getAllSections } =
    useWorkouts();

  useEffect(() => {
    if (params?.id) {
      const fetchWorkout = async () => {
        const workout = await getWorkoutById({
          id: parseInt(params.id as string, 10),
        });
        if (workout) {
          setWorkoutName(workout.name);
          const sections = await getAllSections({ id: workout.id });
          setSections(sections);
        }
      };
      fetchWorkout();
    }
  }, [params.id, getWorkoutById, getAllSections]);

  const onSave = async () => {
    await createWorkout({ name: workoutName });
    router.navigate("/homepage");
  };

  const onDelete = async () => {
    await deleteWorkout({ id: parseInt(params.id as string, 10) });
    router.navigate("/homepage");
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <ThemedText type="title">New Workout</ThemedText>
      <View style={styles.card}>
        <View>
          <TextInput
            style={styles.input}
            placeholder="Enter workout name"
            value={workoutName}
            onChangeText={setWorkoutName}
          />

          <View style={styles.sectionsContainer}>
            <ThemedText type="subtitle">Sections</ThemedText>
            {sections.map((section, index) => (
              <Card key={index} text={section.name}></Card>
            ))}
            <Button onPressIn={() => router.navigate("/section")}>
              New Section
            </Button>
          </View>
        </View>
      </View>
      <View style={styles.buttonRow}>
        <Button onPressIn={onDelete}>Delete</Button>
        <Button onPressIn={() => router.navigate("/homepage")}>Cancel</Button>
        <Button onPressIn={onSave}>Save</Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 20,
    paddingBottom: 80,
  },
  card: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    gap: 12,
  },
  sectionsContainer: {
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fafafa",
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    marginBottom: 15,
  },
  buttonRow: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
});
