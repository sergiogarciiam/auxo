import { Button } from "@react-navigation/elements";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { ThemedText } from "../components/themed-text";
import { useSections } from "../hooks/useSections";
import { useWorkouts } from "../hooks/useWorkouts";
import { SectionInterface } from "../types/section";

export default function NewWorkout() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [workoutName, setWorkoutName] = useState("");
  const [sections, setSections] = useState<SectionInterface[]>([]);
  const { createWorkout, getWorkoutById, deleteWorkout, getAllSections } =
    useWorkouts();

  const { createSection } = useSections();

  useEffect(() => {
    if (params?.section) {
      const sectionParsed: SectionInterface = JSON.parse(
        params.section as string,
      );
      setSections((prev) => [...prev, sectionParsed]);
    }

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
  }, [params.section, params.id, getWorkoutById, getAllSections]);

  const onSave = async () => {
    const workoutId = await createWorkout({ name: workoutName });
    const newSections = sections.map((section, index) => ({
      ...section,
      workout_id: workoutId,
      position: index,
    }));

    for (const section of newSections) {
      console.log("Creating section:", section);
      await createSection(section);
    }

    setSections(newSections);
    router.navigate("/homepage");
  };

  const onDelete = async () => {
    await deleteWorkout({ id: parseInt(params.id as string, 10) });
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
          {sections.map((section, index) => (
            <ThemedText key={index}>
              {section.name} - {section.type}
            </ThemedText>
          ))}
          <Button onPressIn={() => router.navigate("/section")}>
            New Section
          </Button>
        </View>
      </View>

      <View style={styles.buttonRow}>
        <Button onPressIn={onDelete}>Delete</Button>
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
