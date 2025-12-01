import { Picker } from "@react-native-picker/picker";
import { Button } from "@react-navigation/elements";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";
import { ExerciseCard } from "../components/exercise-card";
import { ThemedText } from "../components/themed-text";
import { ExerciseInterface } from "../types/exercise";
import { SectionInterface } from "../types/section";

export default function NewSection() {
  const router = useRouter();

  const [section, setSection] = useState<SectionInterface>({
    id: 0,
    workout_id: 0,
    name: "",
    type: "",
    position: 0,
    rest_exercise: 0,
    rest_group: 0,
  });

  const [exercises, setExercises] = useState<ExerciseInterface[]>([]);

  const onSave = async () => {
    router.push({
      pathname: "/workout",
      params: { section: JSON.stringify({ ...section, exercises }) },
    });
  };

  const onAddNewExercise = () => {
    const newExercise: ExerciseInterface = {
      id: 0,
      section_id: 0,
      name: "",
      type: "",
      reps: 0,
      time_seconds: 0,
      position: exercises.length,
      weight: 0,
      sets: 0,
    };
    setExercises((prev) => [...prev, newExercise]);
  };

  const setExercise = (index: number, exercise: ExerciseInterface) => {
    const updated = [...exercises];
    updated[index] = exercise;
    setExercises(updated);
  };

  const onRemoveExercise = (indexToRemove: number) => {
    const updated = exercises.filter((_, i) => i !== indexToRemove);
    setExercises(updated);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <ThemedText type="title">New Section</ThemedText>

      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Enter section name (ex. warmup)"
          value={section.name}
          onChangeText={(text) => setSection({ ...section, name: text })}
        />

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={section.type}
            onValueChange={(value) => setSection({ ...section, type: value })}
          >
            <Picker.Item label="Select a type" value="" />
            <Picker.Item label="Warm up" value="warmup" />
            <Picker.Item label="Cooldown" value="cooldown" />
            <Picker.Item label="Traditional" value="traditional" />
            <Picker.Item label="Circuit" value="circuit" />
            <Picker.Item label="Superset" value="superset" />
          </Picker>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Enter rest time between exercises (seconds)"
          keyboardType="numeric"
          value={section.rest_exercise?.toString()}
          onChangeText={(text) =>
            setSection({
              ...section,
              rest_exercise: text === "" ? 0 : parseInt(text, 10),
            })
          }
        />

        {["circuit", "superset"].includes(section.type) && (
          <TextInput
            style={styles.input}
            placeholder={`Enter rest time between ${section.type} (seconds)`}
            keyboardType="numeric"
            value={section.rest_group?.toString()}
            onChangeText={(text) =>
              setSection({
                ...section,
                rest_group: text === "" ? 0 : parseInt(text, 10),
              })
            }
          />
        )}
      </View>

      <View style={styles.exercisesContainer}>
        <ThemedText type="subtitle">Exercises</ThemedText>

        {exercises.map((exercise, index) => (
          <ExerciseCard
            key={index}
            exercise={exercise}
            index={index}
            setExercise={setExercise}
            onRemoveExercise={() => onRemoveExercise(index)}
          />
        ))}

        <Button onPressIn={onAddNewExercise}>New exercise</Button>
      </View>

      <View style={styles.buttonRow}>
        <Button onPressIn={() => router.navigate("/workout")}>Cancel</Button>
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
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fafafa",
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    marginBottom: 15,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fafafa",
    borderRadius: 8,
    marginBottom: 15,
    overflow: "hidden",
  },
  exercisesContainer: {
    gap: 12,
  },
  buttonRow: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
});
