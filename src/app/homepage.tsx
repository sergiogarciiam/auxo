import { Button } from "@react-navigation/elements";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Card } from "../components/card";
import { ThemedText } from "../components/themed-text";
import { Sizes, Spacing } from "../constants/theme";
import { useSections } from "../hooks/useSections";
import { useWorkouts } from "../hooks/useWorkouts";
import { useWorkoutStore } from "../stores/useWorkoutStore";
import { transformSectionToUI } from "../utils/transformers";
import { handleAndShowError } from "../utils/ui";

export default function Homepage() {
  const router = useRouter();
  const { workouts, getWorkoutById, getAllSections } = useWorkouts();
  const { getAllExercisesBySectionId } = useSections();
  const { loadWorkout, reset } = useWorkoutStore();

  /**
   * Creates a new blank workout
   */
  const handleCreateWorkout = useCallback(() => {
    reset();
    router.push("/workout");
  }, [reset, router]);

  /**
   * Loads an existing workout for editing
   */
  const handleEditWorkout = useCallback(
    async (id: number) => {
      try {
        reset();
        const workoutFromDb = await getWorkoutById(id);
        const sectionsFromDb = await getAllSections(id);

        // Transform sections with exercises
        const sectionsWithExercises = await Promise.all(
          sectionsFromDb.map(async (section) => {
            const exercises = await getAllExercisesBySectionId(section.id);
            return transformSectionToUI(section, exercises);
          }),
        );

        const workoutState = {
          ...workoutFromDb,
          sections: sectionsWithExercises,
          localStatus: "updated" as const,
        };

        loadWorkout(workoutState);
        router.push("/workout");
      } catch (error) {
        handleAndShowError(error);
      }
    },
    [
      reset,
      getWorkoutById,
      getAllSections,
      getAllExercisesBySectionId,
      loadWorkout,
      router,
    ],
  );

  const hasWorkouts = workouts.filter(Boolean).length > 0;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedText type="title">Your Workouts</ThemedText>

      {hasWorkouts ? (
        workouts
          .filter(Boolean)
          .map((workout, index) => (
            <Card
              key={workout.id || `tmp-${index}`}
              onEdit={() => workout.id && handleEditWorkout(workout.id)}
              text={`${workout.name} ${workout.id}`}
            />
          ))
      ) : (
        <ThemedText>No workouts yet. Create one to get started!</ThemedText>
      )}

      <Button onPress={handleCreateWorkout}>Create Workout</Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Sizes.PADDING_LARGE,
    gap: Spacing.LARGE,
  },
});
