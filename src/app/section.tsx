import { Picker } from "@react-native-picker/picker";
import { Button } from "@react-navigation/elements";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";
import { ExerciseCard } from "../components/exercise-card";
import { ThemedText } from "../components/themed-text";
import { useNewWorkoutStore } from "../stores/useNewWorkoutStore";
import { ExerciseInterface } from "../types/exercise";
import { SectionInterface } from "../types/section";

export default function NewSection() {
  const router = useRouter();
  const { addSection, addExercise } = useNewWorkoutStore();

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
    addSection(section);
    exercises.forEach((exercise) => addExercise(exercise));
    router.push("/workout");
  };

  const onAddNewExercise = () => {
    setExercises((prev) => [
      ...prev,
      {
        id: 0,
        section_id: 0,
        name: "",
        type: "",
        reps: 0,
        time_seconds: 0,
        position: prev.length,
        weight: 0,
        sets: 0,
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedText type="title">New Section</ThemedText>

      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Section name"
          value={section.name}
          onChangeText={(text) => setSection({ ...section, name: text })}
        />

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={section.type}
            onValueChange={(value) => setSection({ ...section, type: value })}
          >
            <Picker.Item label="Type" value="" />
            <Picker.Item label="Warm up" value="warmup" />
            <Picker.Item label="Cooldown" value="cooldown" />
            <Picker.Item label="Traditional" value="traditional" />
            <Picker.Item label="Circuit" value="circuit" />
            <Picker.Item label="Superset" value="superset" />
          </Picker>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Rest between exercises"
          keyboardType="numeric"
          value={section.rest_exercise.toString()}
          onChangeText={(text) =>
            setSection({
              ...section,
              rest_exercise: Number(text) || 0,
            })
          }
        />

        <TextInput
          style={[
            styles.input,
            ,
            section.type !== "circuit" && section.type !== "superset"
              ? styles.inputDisabled
              : null,
          ]}
          editable={section.type === "circuit" || section.type === "superset"}
          placeholder={`Rest between ${section.type}`}
          keyboardType="numeric"
          value={section.rest_group?.toString()}
          onChangeText={(text) =>
            setSection({
              ...section,
              rest_group: Number(text) || 0,
            })
          }
        />
      </View>

      <ThemedText type="subtitle">Exercises</ThemedText>

      {exercises.map((exercise, index) => (
        <ExerciseCard
          key={index}
          exercise={exercise}
          index={index}
          setExercise={(idx, ex) => {
            const copy = [...exercises];
            copy[idx] = ex;
            setExercises(copy);
          }}
          onRemoveExercise={() =>
            setExercises(exercises.filter((_, i) => i !== index))
          }
        />
      ))}

      <Button onPressIn={onAddNewExercise}>New Exercise</Button>

      <View style={styles.row}>
        <Button onPressIn={() => router.push("/workout")}>Cancel</Button>
        <Button onPressIn={onSave}>Save</Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 20 },
  card: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#fafafa",
  },
  inputDisabled: {
    backgroundColor: "#eee",
    borderColor: "#ccc",
    color: "#999",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fafafa",
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
});
