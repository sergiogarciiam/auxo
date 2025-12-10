import { Picker } from "@react-native-picker/picker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { ExerciseCard } from "../components/exercise-card";
import { Field } from "../components/field";
import { ThemedButton } from "../components/themed-button";
import { ThemedText } from "../components/themed-text";
import { SECTION_TYPE_LABELS, SECTION_TYPES } from "../constants/constants";
import { Colors, Sizes, Spacing, Typography } from "../constants/theme";
import { useWorkoutStore } from "../stores/useWorkoutStore";
import { UISection } from "../types/ui";
import { handleAndShowError } from "../utils/ui";

export default function SectionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [sectionId, setSectionId] = useState(params.sectionId);

  const initialSectionRef = useRef<UISection | null>(null);

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

  // when section loads (capture snapshot once per section.id)
  useEffect(() => {
    if (section)
      initialSectionRef.current = JSON.parse(JSON.stringify(section));
  }, [section]);

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
  }, [sectionId, loadSection, startNewSection]);
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
        updateSection(sectionId?.toString(), data);
      } catch (error) {
        handleAndShowError(error);
      }
    },
    [sectionId, updateSection],
  );

  const handleDeleteSection = useCallback(() => {
    try {
      removeSection(sectionId as string);
      router.push("/workout");
    } catch (error) {
      handleAndShowError(error);
    }
  }, [sectionId, removeSection, router]);

  // determine if current section differs from the initial snapshot
  const isDirty = (() => {
    if (!section) return false;
    const initial = initialSectionRef.current;
    if (!initial) return true;
    return JSON.stringify(initial) !== JSON.stringify(section);
  })();

  const isCreating = section?.id?.toString().startsWith("temp-") || false;

  const handleDone = useCallback(() => {
    router.push("/workout");
  }, [router]);

  const handleDiscard = useCallback(() => {
    Alert.alert(
      "Discard changes?",
      "Are you sure you want to discard changes to this section?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Discard",
          style: "destructive",
          onPress: () => {
            try {
              if (section?.localStatus === "new") {
                removeSection(sectionId as string);
              } else if (initialSectionRef.current) {
                updateSection(sectionId?.toString(), initialSectionRef.current);
              }
              router.push("/workout");
            } catch (error) {
              handleAndShowError(error);
            }
          },
        },
      ],
    );
  }, [section, sectionId, removeSection, updateSection, router]);

  if (!section) return null;

  const isCircuitOrSuperset =
    section.type === "circuit" || section.type === "superset";

  let restExerciseValue = "";
  if (section.rest_exercise) {
    restExerciseValue = section.rest_exercise.toString();
  }

  let restGroupValue = "";
  if (section.rest_group) {
    restGroupValue = section.rest_group.toString();
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Section",
          headerRight: () => (
            <View style={styles.headerButtonRow}>
              {!isCreating && (
                <ThemedButton
                  text="Delete"
                  onPress={handleDeleteSection}
                  variant="destructive"
                />
              )}
              {isDirty && (
                <ThemedButton
                  text="Discard"
                  onPress={handleDiscard}
                  variant="destructive"
                />
              )}
              <ThemedButton
                text={isDirty ? "Done" : "Back"}
                onPress={handleDone}
                variant={isDirty ? "success" : "primary"}
              />
            </View>
          ),
        }}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Field label="Section name" required>
            <TextInput
              style={styles.input}
              value={section.name}
              onChangeText={(text) => handleUpdateSection({ name: text })}
              accessibilityLabel="Section name input"
            />
          </Field>

          <Field label="Section type">
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
          </Field>

          <Field label="Rest between exercises (seconds)">
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={restExerciseValue}
              onChangeText={(text) =>
                handleUpdateSection({
                  rest_exercise: Number(text) || 0,
                })
              }
              accessibilityLabel="Rest between exercises input"
            />
          </Field>

          <Field label={`Rest between ${section.type || "group"}`}>
            <TextInput
              style={[
                styles.input,
                !isCircuitOrSuperset ? styles.inputDisabled : undefined,
              ]}
              editable={isCircuitOrSuperset}
              keyboardType="numeric"
              value={restGroupValue}
              onChangeText={(text) =>
                handleUpdateSection({
                  rest_group: Number(text) || 0,
                })
              }
              accessibilityLabel={`Rest between ${section.type} input`}
            />
          </Field>
        </View>

        <ThemedText type="subtitle">Exercises</ThemedText>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.exercisesScroll}
        >
          {section.exercises
            .filter((exercise) => exercise.localStatus !== "deleted")
            .map((exercise) => (
              <View key={exercise.id} style={styles.exerciseWrapper}>
                <ExerciseCard
                  exercise={exercise}
                  exerciseId={exercise.id}
                  setExercise={(exerciseId, ex) => {
                    updateExercise(sectionId as string, exerciseId, ex);
                  }}
                  onRemoveExercise={() =>
                    removeExercise(sectionId as string, exercise.id)
                  }
                />
              </View>
            ))}
          <View style={styles.newExerciseButtonContainer}>
            <ThemedButton text="New Exercise" onPress={handleAddExercise} />
          </View>
        </ScrollView>
      </ScrollView>
    </>
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
  headerButtonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: Spacing.LARGE,
  },
  exercisesScroll: {
    paddingVertical: Spacing.MEDIUM,
  },
  exerciseWrapper: {
    marginRight: Spacing.LARGE,
    width: 320,
  },
  exerciseAddButton: {
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  newExerciseButtonContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.LARGE,
  },
});
