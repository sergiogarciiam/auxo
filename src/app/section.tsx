import { MaterialIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { ExerciseCard } from "../components/exercise-card";
import { Field } from "../components/field";
import { ThemedButton } from "../components/themed-button";
import { ThemedText } from "../components/themed-text";
import { SECTION_TYPE_LABELS, SECTION_TYPES } from "../constants/constants";
import {
  Colors,
  IconColors,
  IconSizes,
  Sizes,
  Spacing,
  Typography,
} from "../constants/theme";
import { useWorkoutStore } from "../stores/useWorkoutStore";
import { UISection } from "../types/ui";
import { handleAndShowError } from "../utils/ui";
import { validateSection } from "../utils/validation";

export default function SectionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [sectionId, setSectionId] = useState(params.sectionId);

  const initialSectionRef = useRef<UISection | null>(null);

  const {
    section,
    startNewSection,
    loadSection,
    updateSection,
    removeSection,
    addExercise,
    updateExercise,
    removeExercise,
  } = useWorkoutStore();

  const [localExercises, setLocalExercises] = useState<any[]>([]);

  useEffect(() => {
    if (section) {
      const filtered = section.exercises
        .filter((e) => e.localStatus !== "deleted")
        .sort((a, b) => a.position - b.position);
      setLocalExercises(filtered);
    }
  }, [section]);

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

  const handleMovePrevExercise = useCallback(
    (index: number) => {
      const newExercises = [...localExercises];
      [newExercises[index - 1], newExercises[index]] = [
        newExercises[index],
        newExercises[index - 1],
      ];

      const updated = newExercises.map((e, idx) => ({ ...e, position: idx }));
      setLocalExercises(updated);

      // Persist positions to store
      updated.forEach((e) => {
        updateExercise(sectionId as string, e.id, { position: e.position });
      });
    },
    [localExercises, updateExercise, sectionId],
  );

  const handleMoveNextExercise = useCallback(
    (index: number) => {
      const newExercises = [...localExercises];
      [newExercises[index], newExercises[index + 1]] = [
        newExercises[index + 1],
        newExercises[index],
      ];

      const updated = newExercises.map((e, idx) => ({ ...e, position: idx }));
      setLocalExercises(updated);

      // Persist positions to store
      updated.forEach((e) => {
        updateExercise(sectionId as string, e.id, { position: e.position });
      });
    },
    [localExercises, updateExercise, sectionId],
  );

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
      router.replace("/workout");
    } catch (error) {
      handleAndShowError(error);
    }
  }, [sectionId, removeSection, router]);

  const isCreating = section?.id?.toString().startsWith("temp-") || false;

  const handleDone = useCallback(() => {
    try {
      const currentSection = useWorkoutStore.getState().section;
      const validationError = validateSection(currentSection as UISection);
      if (validationError) {
        throw new Error(validationError);
      }
      router.replace("/workout");
    } catch (error) {
      handleAndShowError(error);
    }
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
              router.replace("/workout");
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

  return (
    <>
      <Stack.Screen
        options={{
          title: "Section",
          headerRight: () => (
            <View style={styles.headerButtonRow}>
              <ThemedButton
                icon={
                  <MaterialIcons
                    name="arrow-back"
                    size={IconSizes.MEDIUM}
                    color={IconColors.ON_PRIMARY}
                  />
                }
                onPress={handleDiscard}
              />

              {!isCreating && (
                <ThemedButton
                  icon={
                    <MaterialIcons
                      name="delete"
                      size={IconSizes.MEDIUM}
                      color={IconColors.ON_PRIMARY}
                    />
                  }
                  onPress={handleDeleteSection}
                  variant="destructive"
                />
              )}
              <ThemedButton
                icon={
                  <MaterialIcons
                    name="check"
                    size={IconSizes.MEDIUM}
                    color={IconColors.ON_PRIMARY}
                  />
                }
                onPress={handleDone}
                variant="success"
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
              value={section.rest_exercise.toString()}
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
              value={section.rest_group.toString()}
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
          {localExercises.map((exercise, index) => (
            <View key={exercise.id} style={styles.exerciseWrapper}>
              <ExerciseCard
                exercise={exercise}
                exerciseId={exercise.id}
                index={index}
                handleMovePrev={handleMovePrevExercise}
                handleMoveNext={handleMoveNextExercise}
                isDisabledPrev={index === 0}
                isDisabledNext={index === localExercises.length - 1}
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
            <ThemedButton
              text="New Exercise"
              icon={
                <MaterialIcons
                  name="add"
                  size={IconSizes.SMALL}
                  color={IconColors.ON_PRIMARY}
                />
              }
              onPress={handleAddExercise}
            />
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
