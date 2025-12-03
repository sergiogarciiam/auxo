import { Picker } from "@react-native-picker/picker";
import { Button } from "@react-navigation/elements";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";
import { ExerciseCard } from "../components/exercise-card";
import { ThemedText } from "../components/themed-text";
import { useWorkoutStore } from "../stores/useWorkoutStore";

export default function NewSection() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [sectionId, setSectionId] = useState(params.sectionId);

  const {
    workout,
    section,
    startNewSection,
    loadSection,
    updateSection,
    removeSection,
    addExercise,
    updateExercise,
    removeExercise,
  } = useWorkoutStore();

  useEffect(() => {
    if (!workout) {
      router.replace("/homepage");
    }
  }, [workout]);

  useEffect(() => {
    const load = async () => {
      if (sectionId) {
        loadSection(sectionId as string);
      } else {
        const newSection = startNewSection(`temp-${Date.now()}`);
        setSectionId(newSection.id);
      }
    };

    load();
  }, []);

  const onSave = async () => {
    router.push("/workout");
  };

  const onCancel = () => {
    removeSection(sectionId as string);
    router.push("/workout");
  };

  const onAddNewExercise = () => {
    addExercise(sectionId as string);
  };

  if (!section) return;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedText type="title">New Section</ThemedText>

      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Section name"
          value={section.name}
          onChangeText={(text) =>
            updateSection(sectionId.toString(), { ...section, name: text })
          }
        />

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={section.type}
            onValueChange={(value) =>
              updateSection(sectionId.toString(), { ...section, type: value })
            }
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
            updateSection(sectionId.toString(), {
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
            updateSection(sectionId.toString(), {
              ...section,
              rest_group: Number(text) || 0,
            })
          }
        />
      </View>

      <ThemedText type="subtitle">Exercises</ThemedText>

      {section.exercises.map((exercise, index) => (
        <ExerciseCard
          key={index}
          exercise={exercise}
          index={index}
          setExercise={(idx, ex) => {
            updateExercise(sectionId as string, idx, ex);
          }}
          onRemoveExercise={() =>
            removeExercise(sectionId as string, exercise.id)
          }
        />
      ))}

      <Button onPressIn={onAddNewExercise}>New Exercise</Button>

      <View style={styles.row}>
        <Button onPressIn={onCancel}>Cancel</Button>
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
