import { MaterialIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Card } from "../components/card";
import { ConfirmDialog } from "../components/confirm-dialog";
import { ThemedButton } from "../components/themed-button";
import { ThemedText } from "../components/themed-text";
import { IconSizes, Sizes, Spacing } from "../constants/theme";
import { useBlocks } from "../hooks/base/useBlocks";
import { useExercises } from "../hooks/base/useExercises";
import { useWorkouts } from "../hooks/base/useWorkouts";
import { useLoadWorkout } from "../hooks/other/useLoadWorkout";
import { useTheme } from "../hooks/useTheme";
import { useStartWorkoutStore } from "../stores/useStartWorkoutStore";
import { useWorkoutStore } from "../stores/useWorkoutStore";
import { UIWorkout } from "../types/ui";
import { buildExecutionPlan } from "../utils/planner";
import { swapItems } from "../utils/reorder";
import { handleAndShowError } from "../utils/ui";

export default function Homepage() {
  const router = useRouter();
  const colors = useTheme();

  const { localWorkouts, loadWorkouts, loadWorkout, reset } = useWorkoutStore();
  const { startWorkout } = useStartWorkoutStore();

  const loadWorkoutWithData = useLoadWorkout();
  const { getAllBlocksByWorkoutId, updateWorkout, deleteWorkout } =
    useWorkouts();
  const { getAllExercisesByBlockId, deleteBlock } = useBlocks();
  const { deleteExercise } = useExercises();

  const [uiWorkouts, setUIWorkouts] = useState<UIWorkout[]>([]);

  useEffect(() => {
    setUIWorkouts(localWorkouts || []);
  }, [localWorkouts]);

  const handleMovePrevWorkout = useCallback(
    async (index: number) => {
      if (!localWorkouts || index === 0) return;

      const reordered: UIWorkout[] = swapItems(localWorkouts, index, index - 1);
      loadWorkouts(reordered); // actualiza UI local

      // Persistimos inmediatamente los dos workouts intercambiados
      const movedWorkout: UIWorkout = reordered[index - 1];
      const swappedWorkout: UIWorkout = reordered[index];

      try {
        if (typeof movedWorkout.id === "number") {
          await updateWorkout({
            id: movedWorkout.id,
            name: movedWorkout.name,
            position: index - 1,
          });
        }
        if (typeof swappedWorkout.id === "number") {
          await updateWorkout({
            id: swappedWorkout.id,
            name: swappedWorkout.name,
            position: index,
          });
        }
      } catch (error) {
        handleAndShowError(error);
        loadWorkouts(localWorkouts); // revertir cambios en caso de error
      }
    },
    [localWorkouts, loadWorkouts, updateWorkout],
  );

  const handleMoveNextWorkout = async (index: number) => {
    if (index >= uiWorkouts.length - 1) return;

    const reordered = swapItems(uiWorkouts, index, index + 1);
    setUIWorkouts(reordered); // actualiza UI de inmediato

    const movedWorkout = reordered[index + 1];
    const swappedWorkout = reordered[index];

    try {
      if (typeof movedWorkout.id === "number") {
        await updateWorkout({
          id: movedWorkout.id,
          name: movedWorkout.name,
          position: index + 1,
        });
      }
      if (typeof swappedWorkout.id === "number") {
        await updateWorkout({
          id: swappedWorkout.id,
          name: swappedWorkout.name,
          position: index,
        });
      }
      loadWorkouts(reordered); // persiste cambios en el store
    } catch (error) {
      handleAndShowError(error);
      setUIWorkouts(uiWorkouts); // revertir UI en caso de error
    }
  };

  const handleCreateWorkout = useCallback(() => {
    reset();
    router.push("/workout");
  }, [reset, router]);

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
      const blocksToDelete = await getAllBlocksByWorkoutId(workoutToDelete);

      const exercisesToDelete = (
        await Promise.all(
          (blocksToDelete || []).map(async (s: any) => {
            return await getAllExercisesByBlockId(Number(s.id));
          }),
        )
      ).flat();

      await Promise.all(
        (blocksToDelete || []).map((s: any) => deleteBlock(Number(s.id))),
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
    getAllBlocksByWorkoutId,
    getAllExercisesByBlockId,
    deleteBlock,
    deleteExercise,
    deleteWorkout,
  ]);

  const hasWorkouts = localWorkouts.filter(Boolean).length > 0;

  return (
    <>
      <Stack.Screen
        options={{
          title: "Auxo",
          headerRight: () => (
            <ThemedButton
              onPress={() => router.push("/settings")}
              icon={
                <MaterialIcons
                  name="settings"
                  size={IconSizes.MEDIUM}
                  color={colors.PRIMARY_ICON_COLOR}
                />
              }
            />
          ),
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
              color={colors.PRIMARY_ICON_COLOR}
            />
          }
          onPress={handleCreateWorkout}
        />
      </ScrollView>
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
