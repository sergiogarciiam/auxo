import { MaterialIcons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { Card } from "../components/card";
import { Field } from "../components/field";
import { ThemedButton } from "../components/themed-button";
import { ThemedText } from "../components/themed-text";
import {
  Colors,
  IconColors,
  IconSizes,
  Sizes,
  Spacing,
} from "../constants/theme";

import { useSaveWorkout } from "../hooks/useSaveWorkout";
import { useWorkouts } from "../hooks/useWorkouts";
import { useWorkoutStore } from "../stores/useWorkoutStore";
import { UISection, UIWorkout } from "../types/ui";
import { handleAndShowError } from "../utils/ui";
import { validateWorkout } from "../utils/validation";

export default function WorkoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const { deleteWorkout, getWorkoutById } = useWorkouts();
  const { saveWorkout } = useSaveWorkout();
  const {
    workout,
    section,
    startNewWorkout,
    setName,
    updateSection,
    removeSection,
    reset,
    loadWorkout,
  } = useWorkoutStore();

  const initialWorkoutRef = useRef<any | null>(null);

  const [localSections, setLocalSections] = useState<UISection[]>([]);

  useEffect(() => {
    if (workout) {
      const filtered = workout.sections
        .filter(
          (s) =>
            s.localStatus !== "deleted" &&
            !(s.localStatus === "new" && (!s.name || s.name.trim() === "")),
        )
        .sort((a, b) => a.position - b.position);
      setLocalSections(filtered);
    }
  }, [workout]);

  // Initialize workout on mount
  useEffect(() => {
    if (!workout) {
      startNewWorkout();
    }
  }, [params.id, startNewWorkout, workout]);

  // capture initial snapshot to detect dirty state
  useEffect(() => {
    if (workout && !section?.id.toString().startsWith("temp-"))
      initialWorkoutRef.current = JSON.parse(JSON.stringify(workout));
  }, [workout?.id]);

  const handleDone = useCallback(async () => {
    try {
      const validationError = validateWorkout(workout as UIWorkout);
      if (validationError) {
        throw new Error(validationError);
      }
      await saveWorkout(workout!);
      reset();
      router.replace("/");
    } catch (error) {
      handleAndShowError(error);
    }
  }, [saveWorkout, workout, reset, router]);

  const handleDiscard = useCallback(() => {
    Alert.alert(
      "Discard changes?",
      "Are you sure you want to discard changes to this workout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Discard",
          style: "destructive",
          onPress: async () => {
            try {
              if (!workout) return router.replace("/");

              // if this is a temporary workout, just reset
              if (
                workout.id?.toString().startsWith("temp-") ||
                workout.localStatus === "new"
              ) {
                reset();
                return router.replace("/");
              }

              // otherwise try to re-fetch the saved workout and load it into the store
              const id = Number(workout.id);
              const original = await getWorkoutById(id);
              if (original) {
                loadWorkout(original as any);
              }
              router.replace("/");
            } catch (error) {
              handleAndShowError(error);
            }
          },
        },
      ],
    );
  }, [workout, reset, router, getWorkoutById, loadWorkout]);

  const handleEditSection = useCallback(
    (sectionId: string) => {
      router.push(`/section?sectionId=${sectionId}`);
    },
    [router],
  );

  const handleDeleteWorkout = useCallback(async () => {
    Alert.alert(
      "Remove section?",
      "Are you sure you want to remove this workout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // TODO: remove exercises and sectionss
              await deleteWorkout(Number(workout!.id));
              reset();
              router.replace("/");
            } catch (error) {
              handleAndShowError(error);
            }
          },
        },
      ],
    );
  }, [workout, deleteWorkout, reset, router]);

  const handleAddSection = useCallback(() => {
    router.push("/section");
  }, [router]);

  const handleDeleteSection = useCallback(
    (sectionId: string) => {
      Alert.alert(
        "Remove section?",
        "Are you sure you want to remove this section?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                removeSection(sectionId);
              } catch (error) {
                handleAndShowError(error);
              }
            },
          },
        ],
      );
    },
    [removeSection],
  );

  const handleMovePrevSection = useCallback(
    (index: number) => {
      const newSections = [...localSections];
      [newSections[index - 1], newSections[index]] = [
        newSections[index],
        newSections[index - 1],
      ];

      const updatedSections = newSections.map((s, idx) => ({
        ...s,
        position: idx,
      }));

      setLocalSections(updatedSections);

      updatedSections.forEach((s) => {
        updateSection(s.id.toString(), {
          position: s.position,
        });
      });
    },
    [localSections, updateSection],
  );

  const handleMoveNextSection = useCallback(
    (index: number) => {
      const newSections = [...localSections];
      [newSections[index], newSections[index + 1]] = [
        newSections[index + 1],
        newSections[index],
      ];

      const updatedSections = newSections.map((s, idx) => ({
        ...s,
        position: idx,
      }));

      setLocalSections(updatedSections);

      updatedSections.forEach((s) => {
        updateSection(s.id.toString(), {
          position: s.position,
        });
      });
    },
    [localSections, updateSection],
  );

  if (!workout) return null;

  const isCreating = workout.id?.toString().startsWith("temp-") || false;

  return (
    <>
      <Stack.Screen
        options={{
          title: "Workout",
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
              <ThemedButton
                icon={
                  <MaterialIcons
                    name="delete"
                    size={IconSizes.MEDIUM}
                    color={IconColors.ON_PRIMARY}
                  />
                }
                onPress={handleDeleteWorkout}
                disabled={isCreating}
                variant="destructive"
              />

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
          <Field label="Workout name" required>
            <TextInput
              style={styles.input}
              value={workout.name}
              onChangeText={setName}
              accessibilityLabel="Workout name input"
            />
          </Field>

          <ThemedText type="subtitle">Sections</ThemedText>

          {localSections.length > 0 ? (
            localSections.map((section, index) => (
              <View key={section.id} style={{ marginBottom: 12 }}>
                <Card
                  text={section.name}
                  onEdit={() => handleEditSection(section.id.toString())}
                  onDelete={() => handleDeleteSection(section.id.toString())}
                  index={index}
                  handleMovePrev={handleMovePrevSection}
                  handleMoveNext={handleMoveNextSection}
                  isDisabledPrev={index === 0}
                  isDisabledNext={index === localSections.length - 1}
                />
              </View>
            ))
          ) : (
            <ThemedText>No sections yet</ThemedText>
          )}

          <ThemedButton
            text="New Section"
            icon={
              <MaterialIcons
                name="add"
                size={IconSizes.SMALL}
                color={IconColors.ON_PRIMARY}
              />
            }
            onPress={handleAddSection}
          />
        </View>
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
    backgroundColor: "white",
    borderRadius: Sizes.BORDER_RADIUS_LARGE,
    gap: Spacing.DOUBLE_EXTRA_LARGE,
  },
  input: {
    borderWidth: Sizes.BORDER_WIDTH,
    borderColor: Colors.BORDER,
    padding: Sizes.PADDING,
    borderRadius: Sizes.BORDER_RADIUS,
    backgroundColor: Colors.LIGHT_BACKGROUND,
  },
  headerButtonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: Spacing.LARGE,
  },
});
