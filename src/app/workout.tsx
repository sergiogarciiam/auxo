import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { Alert, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { Card } from "../components/card";
import { Field } from "../components/field";
import { ThemedButton } from "../components/themed-button";
import { ThemedText } from "../components/themed-text";
import { Colors, Sizes, Spacing } from "../constants/theme";
import { useSaveWorkout } from "../hooks/useSaveWorkout";
import { useWorkouts } from "../hooks/useWorkouts";
import { useWorkoutStore } from "../stores/useWorkoutStore";
import { handleAndShowError } from "../utils/ui";

export default function WorkoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const { deleteWorkout, getWorkoutById } = useWorkouts();
  const { saveWorkout } = useSaveWorkout();
  const {
    workout,
    startNewWorkout,
    setName,
    removeSection,
    reset,
    loadWorkout,
  } = useWorkoutStore();

  const initialWorkoutRef = useRef<any | null>(null);

  // Initialize workout on mount
  useEffect(() => {
    if (!workout) {
      startNewWorkout();
    }
  }, [params.id, startNewWorkout, workout]);

  // capture initial snapshot to detect dirty state
  useEffect(() => {
    if (workout)
      initialWorkoutRef.current = JSON.parse(JSON.stringify(workout));
  }, [workout?.id]);

  const isDirty = (() => {
    if (!workout) return false;
    const initial = initialWorkoutRef.current;
    if (!initial) return true;
    return JSON.stringify(initial) !== JSON.stringify(workout);
  })();

  const handleDone = useCallback(async () => {
    try {
      if (isDirty) {
        await saveWorkout(workout!);
        reset();
      }
      router.replace("/homepage");
    } catch (error) {
      handleAndShowError(error);
    }
  }, [isDirty, saveWorkout, workout, reset, router]);

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
              if (!workout) return router.replace("/homepage");

              // if this is a temporary workout, just reset
              if (
                workout.id?.toString().startsWith("temp-") ||
                workout.localStatus === "new"
              ) {
                reset();
                return router.replace("/homepage");
              }

              // otherwise try to re-fetch the saved workout and load it into the store
              const id = Number(workout.id);
              const original = await getWorkoutById(id);
              if (original) {
                loadWorkout(original as any);
              }
              router.replace("/homepage");
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

  const handleDelete = useCallback(async () => {
    try {
      await deleteWorkout(Number(workout!.id));
      reset();
      router.replace("/homepage");
    } catch (error) {
      handleAndShowError(error);
    }
  }, [workout, deleteWorkout, reset, router]);

  const handleAddSection = useCallback(() => {
    router.push("/section");
  }, [router]);

  const handleDeleteSection = useCallback(
    (sectionId: string) => {
      removeSection(sectionId);
    },
    [removeSection],
  );

  if (!workout) return null;

  const visibleSections = workout.sections.filter(
    (section) =>
      section.localStatus !== "deleted" &&
      !(
        section.localStatus === "new" &&
        (!section.name || section.name.trim() === "")
      ),
  );

  const isCreating = workout.id?.toString().startsWith("temp-") || false;

  return (
    <>
      <Stack.Screen
        options={{
          title: "Workout",
          headerRight: () => (
            <View style={styles.headerButtonRow}>
              <ThemedButton
                text="Delete"
                onPress={handleDelete}
                disabled={isCreating}
                variant="destructive"
              />

              <ThemedButton
                text="Discard"
                onPress={handleDiscard}
                disabled={!isDirty}
                variant="destructive"
              />

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
          <Field label="Workout name" required>
            <TextInput
              style={styles.input}
              value={workout.name}
              onChangeText={setName}
              accessibilityLabel="Workout name input"
            />
          </Field>

          <ThemedText type="subtitle">Sections</ThemedText>
          {visibleSections.length > 0 ? (
            visibleSections.map((section) => (
              <Card
                key={section.id}
                text={section.name}
                onEdit={() => handleEditSection(section.id.toString())}
                onDelete={() => handleDeleteSection(section.id.toString())}
              />
            ))
          ) : (
            <ThemedText>No sections yet</ThemedText>
          )}

          <ThemedButton text="New Section" onPress={handleAddSection} />
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
