import { Picker } from "@react-native-picker/picker";
import { Button } from "@react-navigation/elements";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";
import { ExerciseCard } from "../components/exercise-card";
import { ThemedText } from "../components/themed-text";
import { SECTION_TYPE_LABELS, SECTION_TYPES } from "../constants/constants";
import { Colors, Sizes, Spacing, Typography } from "../constants/theme";
import { useWorkoutStore } from "../stores/useWorkoutStore";
import { handleAndShowError } from "../utils/ui";

export default function SectionScreen() {
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

  // Redirect if no workout exists
  useEffect(() => {
    if (!workout) {
      router.replace("/homepage");
    }
  }, [workout, router]);

  // Load or create section
  useEffect(() => {
    if (sectionId) {
      loadSection(sectionId as string);
    } else {
      const newSection = startNewSection(`temp-${Date.now()}`);
      setSectionId(newSection.id.toString());
    }
  }, []);

  const handleSave = useCallback(async () => {
    try {
      router.push("/workout");
    } catch (error) {
      handleAndShowError(error);
    }
  }, [router]);

  const handleCancel = useCallback(() => {
    try {
      removeSection(sectionId as string);
      router.push("/workout");
    } catch (error) {
      handleAndShowError(error);
    }
  }, [sectionId, removeSection, router]);

  const handleAddExercise = useCallback(() => {
    try {
      addExercise(sectionId as string);
    } catch (error) {
      handleAndShowError(error);
    }
  }, [sectionId, addExercise]);

  const handleUpdateSection = useCallback(
    (data: any) => {
      try {
        updateSection(sectionId?.toString(), {
          ...section,
          ...data,
        });
      } catch (error) {
        handleAndShowError(error);
      }
    },
    [sectionId, section, updateSection],
  );

  if (!section) return null;

  const isCircuitOrSuperset =
    section.type === "circuit" || section.type === "superset";

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedText type="title">New Section</ThemedText>

      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Section name"
          value={section.name}
          onChangeText={(text) => handleUpdateSection({ name: text })}
          accessibilityLabel="Section name input"
        />

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={section.type}
            onValueChange={(value) => handleUpdateSection({ type: value })}
            accessibilityLabel="Section type picker"
          >
            <Picker.Item label="Select Type" value="" />
            {SECTION_TYPES.map((type) => (
              <Picker.Item
                key={type}
                label={SECTION_TYPE_LABELS[type]}
                value={type}
              />
            ))}
          </Picker>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Rest between exercises (seconds)"
          keyboardType="numeric"
          value={section.rest_exercise.toString()}
          onChangeText={(text) =>
            handleUpdateSection({
              rest_exercise: Number(text) || 0,
            })
          }
          accessibilityLabel="Rest between exercises input"
        />

        <TextInput
          style={[
            styles.input,
            !isCircuitOrSuperset ? styles.inputDisabled : undefined,
          ]}
          editable={isCircuitOrSuperset}
          placeholder={`Rest between ${section.type || "group"}`}
          keyboardType="numeric"
          value={section.rest_group?.toString()}
          onChangeText={(text) =>
            handleUpdateSection({
              rest_group: Number(text) || 0,
            })
          }
          accessibilityLabel={`Rest between ${section.type} input`}
        />
      </View>

      <ThemedText type="subtitle">Exercises</ThemedText>

      {section.exercises
        .filter((exercise) => exercise.localStatus !== "deleted")
        .map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            index={exercise.id}
            setExercise={(exerciseId, ex) => {
              updateExercise(sectionId as string, exerciseId, ex);
            }}
            onRemoveExercise={() =>
              removeExercise(sectionId as string, exercise.id)
            }
          />
        ))}

      <Button onPress={handleAddExercise}>New Exercise</Button>

      <View style={styles.row}>
        <Button onPress={handleCancel}>Cancel</Button>
        <Button onPress={handleSave}>Save</Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Sizes.PADDING_LARGE,
    gap: Spacing.DOUBLE_EXTRA_LARGE,
  },
  card: {
    padding: Sizes.PADDING_LARGE,
    backgroundColor: Colors.BACKGROUND,
    borderRadius: Sizes.BORDER_RADIUS_LARGE,
    borderWidth: Sizes.BORDER_WIDTH,
    gap: Spacing.LARGE,
  },
  input: {
    borderWidth: Sizes.BORDER_WIDTH,
    borderColor: Colors.BORDER,
    padding: Sizes.PADDING,
    borderRadius: Sizes.BORDER_RADIUS,
    backgroundColor: Colors.LIGHT_BACKGROUND,
    fontSize: Typography.FONT_SIZE_DEFAULT,
  },
  inputDisabled: {
    backgroundColor: Colors.DISABLED_BACKGROUND,
    borderColor: Colors.BORDER,
    color: Colors.DISABLED_TEXT,
  },
  pickerContainer: {
    borderWidth: Sizes.BORDER_WIDTH,
    borderColor: Colors.BORDER,
    borderRadius: Sizes.BORDER_RADIUS,
    backgroundColor: Colors.LIGHT_BACKGROUND,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: Spacing.LARGE,
  },
});
