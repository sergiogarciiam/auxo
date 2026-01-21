import { MaterialIcons } from "@expo/vector-icons";
import { Stack, useNavigation, useRouter } from "expo-router";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { Alert, Keyboard, ScrollView, StyleSheet, View } from "react-native";
import { Card } from "../components/card";
import { ThemedButton } from "../components/themed-button";
import { ThemedText } from "../components/themed-text";
import { IconColors, IconSizes, Sizes, Spacing } from "../constants/theme";
import { useExercises } from "../hooks/useExercises";
import { useSections } from "../hooks/useSections";
import { useWorkouts } from "../hooks/useWorkouts";
import { useStartWorkoutStore } from "../stores/useStartWorkoutStore";
import { useWorkoutStore } from "../stores/useWorkoutStore";
import { buildExecutionPlan } from "../utils/planner";
import {
  transformSectionToUI,
  transformWorkoutsToUI,
} from "../utils/transformers";
import { handleAndShowError, showSuccessMessage } from "../utils/ui";

export default function Homepage() {
  const router = useRouter();
  const {
    workouts,
    getWorkoutById,
    getAllSections,
    updateWorkout,
    deleteWorkout,
  } = useWorkouts();
  const { getAllExercisesBySectionId, deleteSection } = useSections();
  const { deleteExercise } = useExercises();
  const { localWorkouts, loadWorkouts, loadWorkout, reset } = useWorkoutStore();
  const { startWorkout } = useStartWorkoutStore();

  const [isReordering, setIsReordering] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    if (isReordering) return;
    loadWorkouts(transformWorkoutsToUI(workouts));
  }, [workouts, loadWorkouts, isReordering]);

  const handleMovePrevWorkout = useCallback(
    (index: number) => {
      const newWorkouts = [...localWorkouts];
      [newWorkouts[index - 1], newWorkouts[index]] = [
        newWorkouts[index],
        newWorkouts[index - 1],
      ];

      loadWorkouts(newWorkouts);
      setIsReordering(true);
    },
    [localWorkouts, loadWorkouts],
  );

  const handleMoveNextWorkout = useCallback(
    (index: number) => {
      const newWorkouts = [...localWorkouts];
      [newWorkouts[index], newWorkouts[index + 1]] = [
        newWorkouts[index + 1],
        newWorkouts[index],
      ];

      loadWorkouts(newWorkouts);
      setIsReordering(true);
    },
    [localWorkouts, loadWorkouts],
  );

  /**
   * Creates a new blank workout
   */
  const handleCreateWorkout = useCallback(() => {
    reset();
    router.push("/workout");
  }, [reset, router]);

  const handleDone = useCallback(async () => {
    try {
      for (let i = 0; i < localWorkouts.length; i++) {
        const w = localWorkouts[i];
        if (typeof w.id !== "number") continue;

        await updateWorkout({ id: w.id, name: w.name, position: i });
      }
      showSuccessMessage("Workout order updated");
    } catch (error) {
      handleAndShowError(error);
      return;
    }
    setIsReordering(false);
  }, [localWorkouts, updateWorkout]);

  const handleDiscard = useCallback(() => {
    Keyboard.dismiss();

    Alert.alert(
      "Discard changes?",
      "Are you sure you want to discard reordering?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Discard",
          style: "destructive",
          onPress: () => {
            loadWorkouts(transformWorkoutsToUI(workouts));
            setIsReordering(false);
          },
        },
      ],
    );
  }, [loadWorkouts, workouts]);

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

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        isReordering ? (
          <View style={styles.headerButtonRow}>
            <ThemedButton
              onPress={handleDiscard}
              icon={
                <MaterialIcons
                  name="backspace"
                  size={IconSizes.MEDIUM}
                  color={IconColors.ON_PRIMARY}
                />
              }
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
        ) : null,
    });
  }, [navigation, isReordering, handleDone, handleDiscard]);

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
    padding: Sizes.PADDING_LARGE,
    gap: Spacing.LARGE,
  },
  headerButtonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: Spacing.LARGE,
  },
});
