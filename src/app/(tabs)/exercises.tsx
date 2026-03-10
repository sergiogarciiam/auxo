import { useExercises } from "@/src/hooks/base/useExercises";
import { useExerciseStore } from "@/src/stores/useExerciseStore";
import { MaterialIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Card } from "../../components/card";
import { ConfirmDialog } from "../../components/confirm-dialog";
import { ThemedButton } from "../../components/themed-button";
import { ThemedText } from "../../components/themed-text";
import { IconSizes, Sizes, Spacing } from "../../constants/theme";
import { useTheme } from "../../hooks/useTheme";
import { transformExerciseToUI } from "../../utils/transformers";
import { handleAndShowError } from "../../utils/ui";

export default function Exercises() {
  const router = useRouter();
  const colors = useTheme();
  const { localExercises, loadExercises, reset } = useExerciseStore();
  const { exercises, deleteExercise } = useExercises();

  useEffect(() => {
    loadExercises(
      exercises.map((exercise: any) => transformExerciseToUI(exercise)),
    );
  }, [exercises, loadExercises]);

  const handleCreateExercise = useCallback(() => {
    reset();
    router.push("/exercise-form");
  }, [reset, router]);

  const handleEditExercise = useCallback(
    async (id: number) => {
      try {
        router.push("/exercise-form");
      } catch (error) {
        handleAndShowError(error);
      }
    },
    [router],
  );

  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState<number | null>(null);

  const handleDeleteExercise = useCallback((id: number) => {
    setExerciseToDelete(id);
    setDeleteConfirmVisible(true);
  }, []);

  const doDeleteExercise = useCallback(async () => {
    setDeleteConfirmVisible(false);
    if (exerciseToDelete === null) return;
    try {
      await deleteExercise(Number(exerciseToDelete));
    } catch (error) {
      handleAndShowError(error);
    }
  }, [exerciseToDelete, deleteExercise]);

  const hasExercises = localExercises.filter(Boolean).length > 0;

  return (
    <>
      <Stack.Screen
        options={{
          title: "Exercises",
        }}
      />
      <ScrollView contentContainerStyle={createStyles(colors).container}>
        {hasExercises ? (
          localExercises
            .filter(Boolean)
            .map((exercise: any, index: number) => (
              <Card
                key={exercise.id || `tmp-${index}`}
                onEdit={() => exercise.id && handleEditExercise(exercise.id)}
                onDelete={() =>
                  exercise.id && handleDeleteExercise(exercise.id)
                }
                text={exercise.name}
                index={index}
                isDisabledPrev={index === 0}
                isDisabledNext={index === localExercises.length - 1}
              />
            ))
        ) : (
          <ThemedText>No exercises yet. Create one to get started!</ThemedText>
        )}

        <ThemedButton
          text="New Exercise"
          icon={
            <MaterialIcons
              name="add"
              size={IconSizes.SMALL}
              color={colors.PRIMARY_ICON_COLOR}
            />
          }
          onPress={handleCreateExercise}
        />
      </ScrollView>
      <ConfirmDialog
        visible={deleteConfirmVisible}
        title="Remove exercise?"
        message="Are you sure you want to remove this exercise?"
        onCancel={() => setDeleteConfirmVisible(false)}
        onConfirm={doDeleteExercise}
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
