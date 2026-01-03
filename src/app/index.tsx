import { MaterialIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";
import { Card } from "../components/card";
import { ThemedButton } from "../components/themed-button";
import { ThemedText } from "../components/themed-text";
import { IconColors, IconSizes, Sizes, Spacing } from "../constants/theme";
import { useExercises } from "../hooks/useExercises";
import { useSections } from "../hooks/useSections";
import { useWorkouts } from "../hooks/useWorkouts";
import { useStartWorkoutStore } from "../stores/useStartWorkoutStore";
import { useWorkoutStore } from "../stores/useWorkoutStore";
import { UIWorkout } from "../types/ui";
import { buildExecutionPlan } from "../utils/planner";
import { transformSectionToUI } from "../utils/transformers";
import { handleAndShowError } from "../utils/ui";

export default function Homepage() {
  const router = useRouter();
  const { workouts, getWorkoutById, getAllSections, deleteWorkout } =
    useWorkouts();
  const { getAllExercisesBySectionId, deleteSection } = useSections();
  const { deleteExercise } = useExercises();
  const { loadWorkout, reset } = useWorkoutStore();
  const { startWorkout } = useStartWorkoutStore();

  const [localWorkouts, setLocalWorkouts] = useState<UIWorkout[] | any[]>([]);

  // Keep a local copy of workouts for reordering in the UI
  useEffect(() => {
    setLocalWorkouts(workouts || []);
  }, [workouts]);

  const handleMovePrevWorkout = useCallback(
    (index: number) => {
      const newWorkouts = [...localWorkouts];
      [newWorkouts[index - 1], newWorkouts[index]] = [
        newWorkouts[index],
        newWorkouts[index - 1],
      ];

      setLocalWorkouts(newWorkouts);
    },
    [localWorkouts],
  );

  const handleMoveNextWorkout = useCallback(
    (index: number) => {
      const newWorkouts = [...localWorkouts];
      [newWorkouts[index], newWorkouts[index + 1]] = [
        newWorkouts[index + 1],
        newWorkouts[index],
      ];

      setLocalWorkouts(newWorkouts);
    },
    [localWorkouts],
  );

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

  const handleStartWorkout = useCallback(
    async (id: number) => {
      try {
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

        const plan = buildExecutionPlan(workoutState as any);

        startWorkout(workoutState as any, plan);
        router.push("/start");
      } catch (error) {
        handleAndShowError(error);
      }
    },
    [
      getAllExercisesBySectionId,
      getAllSections,
      getWorkoutById,
      router,
      startWorkout,
    ],
  );

  const hasWorkouts = localWorkouts.filter(Boolean).length > 0;

  const handleDeleteWorkout = useCallback(
    (id: number) => {
      Alert.alert(
        "Remove workout?",
        "Are you sure you want to remove this workout?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                const sectionsToDelete = await getAllSections(id);

                const exercisesToDelete = (
                  await Promise.all(
                    (sectionsToDelete || []).map(async (s: any) => {
                      return await getAllExercisesBySectionId(Number(s.id));
                    }),
                  )
                ).flat();

                await Promise.all(
                  (sectionsToDelete || []).map((s: any) =>
                    deleteSection(Number(s.id)),
                  ),
                );

                await Promise.all(
                  (exercisesToDelete || [])
                    .map((e: any) => e.id)
                    .map(async (exerciseId: number) =>
                      deleteExercise(Number(exerciseId)),
                    ),
                );

                await deleteWorkout(Number(id));
              } catch (error) {
                handleAndShowError(error);
              }
            },
          },
        ],
      );
    },
    [
      getAllSections,
      getAllExercisesBySectionId,
      deleteSection,
      deleteExercise,
      deleteWorkout,
    ],
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "Your Workouts",
        }}
      />
      <ScrollView contentContainerStyle={styles.container}>
        {hasWorkouts ? (
          localWorkouts
            .filter(Boolean)
            .map((workout: any, index: number) => (
              <Card
                key={workout.id || `tmp-${index}`}
                onStart={() => handleStartWorkout(workout.id)}
                onEdit={() => workout.id && handleEditWorkout(workout.id)}
                onDelete={() => workout.id && handleDeleteWorkout(workout.id)}
                text={workout.name}
                index={index}
                handleMovePrev={handleMovePrevWorkout}
                handleMoveNext={handleMoveNextWorkout}
                isDisabledPrev={index === 0}
                isDisabledNext={index === localWorkouts.length - 1}
              />
            ))
        ) : (
          <ThemedText>No workouts yet. Create one to get started!</ThemedText>
        )}

        <ThemedButton
          text="New Workout"
          icon={
            <MaterialIcons
              name="add"
              size={IconSizes.SMALL}
              color={IconColors.ON_PRIMARY}
            />
          }
          onPress={handleCreateWorkout}
        />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Sizes.PADDING_LARGE,
    gap: Spacing.LARGE,
  },
});
