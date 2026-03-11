import { MaterialIcons } from "@expo/vector-icons";
import { Stack, useNavigation, useRouter } from "expo-router";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { Keyboard, ScrollView, StyleSheet } from "react-native";
import { Card } from "../components/card";
import { ConfirmDialog } from "../components/confirm-dialog";
import { ReorderHeader } from "../components/reorder-header";
import { ThemedButton } from "../components/themed-button";
import { ThemedText } from "../components/themed-text";
import { IconSizes, Sizes, Spacing } from "../constants/theme";
import { useExercises } from "../hooks/base/useExercises";
import { useSections } from "../hooks/base/useSections";
import { useWorkouts } from "../hooks/base/useWorkouts";
import { useLoadWorkout } from "../hooks/other/useLoadWorkout";
import { useTheme } from "../hooks/useTheme";
import { useStartWorkoutStore } from "../stores/useStartWorkoutStore";
import { useWorkoutStore } from "../stores/useWorkoutStore";
import { buildExecutionPlan } from "../utils/planner";
import { swapItems } from "../utils/reorder";
import { transformWorkoutsToUI } from "../utils/transformers";
import { handleAndShowError, showSuccessMessage } from "../utils/ui";

export default function Homepage() {
  const router = useRouter();
  const navigation = useNavigation();
  const colors = useTheme();

  const { localWorkouts, loadWorkouts, loadWorkout, reset } = useWorkoutStore();
  const { startWorkout } = useStartWorkoutStore();

  const loadWorkoutWithData = useLoadWorkout();
  const { workouts, getAllSectionsByWorkoutId, updateWorkout, deleteWorkout } =
    useWorkouts();
  const { getAllExercisesBySectionId, deleteSection } = useSections();
  const { deleteExercise } = useExercises();

  const [isReordering, setIsReordering] = useState(false);
  const [discardConfirmVisible, setDiscardConfirmVisible] = useState(false);

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
    setDiscardConfirmVisible(true);
  }, []);

  const doDiscardReorder = useCallback(() => {
    setDiscardConfirmVisible(false);
    loadWorkouts(transformWorkoutsToUI(workouts));
    setIsReordering(false);
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

  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [workoutToDelete, setWorkoutToDelete] = useState<number | null>(null);

  const handleDeleteWorkout = useCallback((id: number) => {
    setWorkoutToDelete(id);
    setDeleteConfirmVisible(true);
  }, []);

  const doDeleteWorkout = useCallback(async () => {
    setDeleteConfirmVisible(false);
    if (workoutToDelete === null) return;
    try {
      const sectionsToDelete = await getAllSectionsByWorkoutId(workoutToDelete);

      const exercisesToDelete = (
        await Promise.all(
          (sectionsToDelete || []).map(async (s: any) => {
            return await getAllExercisesBySectionId(Number(s.id));
          }),
        )
      ).flat();

      await Promise.all(
        (sectionsToDelete || []).map((s: any) => deleteSection(Number(s.id))),
      );

      await Promise.all(
        (exercisesToDelete || [])
          .map((e: any) => e.id)
          .map(async (exerciseId: number) =>
            deleteExercise(Number(exerciseId)),
          ),
      );

      await deleteWorkout(Number(workoutToDelete));
    } catch (error) {
      handleAndShowError(error);
    }
  }, [
    workoutToDelete,
    getAllSectionsByWorkoutId,
    getAllExercisesBySectionId,
    deleteSection,
    deleteExercise,
    deleteWorkout,
  ]);

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
      <ScrollView contentContainerStyle={createStyles(colors).container}>
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
          disabled={isReordering}
          icon={
            <MaterialIcons
              name="add"
              size={IconSizes.SMALL}
              color={colors.PRIMARY_ICON_COLOR}
            />
          }
          onPress={handleCreateWorkout}
        />
      </ScrollView>
      <ConfirmDialog
        visible={discardConfirmVisible}
        title="Discard changes?"
        message="Are you sure you want to discard reordering?"
        onCancel={() => setDiscardConfirmVisible(false)}
        onConfirm={doDiscardReorder}
        cancelText="Cancel"
        confirmText="Discard"
        destructive
      />
      <ConfirmDialog
        visible={deleteConfirmVisible}
        title="Remove workout?"
        message="Are you sure you want to remove this workout?"
        onCancel={() => setDeleteConfirmVisible(false)}
        onConfirm={doDeleteWorkout}
        cancelText="Cancel"
        confirmText="Delete"
        destructive
      />
    </>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      padding: Sizes.PADDING_LARGE,
      gap: Spacing.LARGE,
      backgroundColor: colors.BACKGROUND_SECONDARY,
      flexGrow: 1,
    },
  });
