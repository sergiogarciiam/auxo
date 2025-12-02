import { Button } from "@react-navigation/elements";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";
import { Card } from "../components/card";
import { ThemedText } from "../components/themed-text";
import { useSections } from "../hooks/useSections";
import { useWorkouts } from "../hooks/useWorkouts";
import { useNewWorkoutStore } from "../stores/useNewWorkoutStore";

export default function NewWorkout() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const { getWorkoutById, getAllSections, createWorkout, deleteWorkout } =
    useWorkouts();
  const { createSection } = useSections();

  const { workoutId, name, setName, sections, setSections, reset } =
    useNewWorkoutStore();

  useEffect(() => {
    const load = async () => {
      if (workoutId) {
        const workout = await getWorkoutById({ id: workoutId });
        if (workout) {
          setName(workout.name);
          const sectionsData = await getAllSections({ id: workoutId });
          setSections(sectionsData);
        }
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const onSave = async () => {
    const workoutId = await createWorkout({
      name,
    });

    for (const section of sections) {
      section.workout_id = workoutId;
      await createSection(section);
    }

    reset();
    router.replace("/homepage");
  };

  const onDelete = async () => {
    if (!workoutId) return;
    await deleteWorkout({ id: workoutId });
    reset();
    router.replace("/homepage");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedText type="title">Workout</ThemedText>

      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Workout name"
          value={name}
          onChangeText={setName}
        />

        <ThemedText type="subtitle">Sections</ThemedText>
        {sections.map((sec, index) => (
          <Card key={index} text={sec.name} />
        ))}

        <Button onPressIn={() => router.push("/section")}>New Section</Button>
      </View>

      <View style={styles.row}>
        {workoutId && <Button onPressIn={onDelete}>Delete</Button>}
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
