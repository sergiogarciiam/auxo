import { MaterialIcons } from "@expo/vector-icons";
import { Stack, useNavigation, useRouter } from "expo-router";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { Alert, Keyboard, ScrollView, StyleSheet } from "react-native";
import { Card } from "../components/card";
import { ReorderHeader } from "../components/reorder-header";
import { ThemedButton } from "../components/themed-button";
import { ThemedText } from "../components/themed-text";
import { Colors, IconSizes, Sizes, Spacing } from "../constants/theme";
import { useExercises } from "../hooks/base/useExercises";
import { useSections } from "../hooks/base/useSections";
import { useWorkouts } from "../hooks/base/useWorkouts";
import { useLoadWorkout } from "../hooks/other/useLoadWorkout";
import { useStartWorkoutStore } from "../stores/useStartWorkoutStore";
import { useWorkoutStore } from "../stores/useWorkoutStore";
import { buildExecutionPlan } from "../utils/planner";
import { swapItems } from "../utils/reorder";
import { transformWorkoutsToUI } from "../utils/transformers";
import { handleAndShowError, showSuccessMessage } from "../utils/ui";

export default function Homepage() {
  const router = useRouter();
  const navigation = useNavigation();

  const { localWorkouts, loadWorkouts, loadWorkout, reset } = useWorkoutStore();
  const { startWorkout } = useStartWorkoutStore();

  const loadWorkoutWithData = useLoadWorkout();
  const { workouts, getAllSectionsByWorkoutId, updateWorkout, deleteWorkout } =
    useWorkouts();
  const { getAllExercisesBySectionId, deleteSection } = useSections();
  const { deleteExercise } = useExercises();

  const [isReordering, setIsReordering] = useState(false);

  useEffect(() => {
    if (isReordering) return;
    loadWorkouts(transformWorkoutsToUI(workouts));
  }, [workouts, loadWorkouts, isReordering]);

  const handleMovePrevWorkout = useCallback(
    (index: number) => {
      loadWorkouts(swapItems(localWorkouts, index, index - 1));
      setIsReordering(true);
    },
    [localWorkouts, loadWorkouts],
  );

  const handleMoveNextWorkout = useCallback(
    (index: number) => {
      loadWorkouts(swapItems(localWorkouts, index, index + 1));
      setIsReordering(true);
    },
    [localWorkouts, loadWorkouts],
  );

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

  const handleEditWorkout = useCallback(
    async (id: number) => {
      try {
        reset();
        const workout = await loadWorkoutWithData(id);
        loadWorkout(workout);
        router.push("/workout");
      } catch (error) {
        handleAndShowError(error);
      }
    },
    [loadWorkoutWithData, loadWorkout, reset, router],
  );

  const handleStartWorkout = useCallback(
    async (id: number) => {
      try {
        const workout = await loadWorkoutWithData(id);
        const plan = buildExecutionPlan(workout);
        startWorkout(workout, plan);
        router.push("/start");
      } catch (error) {
        handleAndShowError(error);
      }
    },
    [loadWorkoutWithData, startWorkout, router],
  );

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
                const sectionsToDelete = await getAllSectionsByWorkoutId(id);

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
      getAllSectionsByWorkoutId,
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
          <ReorderHeader
            handleDiscard={handleDiscard}
            handleDone={handleDone}
          />
        ) : null,
    });
  }, [navigation, isReordering, handleDone, handleDiscard]);

  const hasWorkouts = localWorkouts.filter(Boolean).length > 0;

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
                isDisabled={isReordering}
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
              color={Colors.PRIMARY_ICON_COLOR}
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
    backgroundColor: Colors.BACKGROUND_SECONDARY,
    height: "100%",
  },
});
