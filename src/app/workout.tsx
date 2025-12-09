import { Button } from "@react-navigation/elements";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect } from "react";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";
import { Card } from "../components/card";
import { ThemedText } from "../components/themed-text";
import { Colors, Sizes, Spacing } from "../constants/theme";
import { useSaveWorkout } from "../hooks/useSaveWorkout";
import { useWorkouts } from "../hooks/useWorkouts";
import { useWorkoutStore } from "../stores/useWorkoutStore";
import { handleAndShowError } from "../utils/ui";

export default function WorkoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const { deleteWorkout } = useWorkouts();
  const { saveWorkout } = useSaveWorkout();
  const { workout, startNewWorkout, setName, reset } = useWorkoutStore();

  // Initialize workout on mount
  useEffect(() => {
    if (!workout) {
      startNewWorkout();
    }
  }, [params.id, startNewWorkout, workout]);

  const handleSave = useCallback(async () => {
    if (!workout) return;
    try {
      await saveWorkout(workout);
      reset();
      router.replace("/homepage");
    } catch (error) {
      handleAndShowError(error);
    }
  }, [workout, saveWorkout, reset, router]);

  const handleDelete = useCallback(async () => {
    try {
      await deleteWorkout(Number(workout!.id));
      reset();
      router.replace("/homepage");
    } catch (error) {
      handleAndShowError(error);
    }
  }, [workout, deleteWorkout, reset, router]);

  const handleCancel = useCallback(() => {
    router.push("/homepage");
  }, [router]);

  const handleAddSection = useCallback(() => {
    router.push("/section");
  }, [router]);

  if (!workout) return null;

  const visibleSections = workout.sections.filter(
    (section) =>
      section.localStatus !== "deleted" &&
      !(
        section.localStatus === "new" &&
        (!section.name || section.name.trim() === "")
      ),
  );

  const isExistingWorkout = workout.localStatus === "updated";

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedText type="title">Workout</ThemedText>

      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Workout name"
          value={workout.name}
          onChangeText={setName}
          accessibilityLabel="Workout name input"
        />

        <ThemedText type="subtitle">Sections</ThemedText>
        {visibleSections.length > 0 ? (
          visibleSections.map((section) => (
            <Card key={section.id} text={section.name} />
          ))
        ) : (
          <ThemedText>No sections yet</ThemedText>
        )}

        <Button onPress={handleAddSection}>New Section</Button>
      </View>

      <View style={styles.row}>
        {isExistingWorkout && <Button onPress={handleDelete}>Delete</Button>}
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
  row: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: Spacing.LARGE,
  },
});
