import { MaterialIcons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Card } from "../components/card";
import { Field } from "../components/field";
import { ThemedButton } from "../components/themed-button";
import { ThemedText } from "../components/themed-text";
import { IconSizes, Sizes, Spacing } from "../constants/theme";
import { useTheme } from "../hooks/useTheme";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Trash } from "lucide-react-native";
import { ConfirmDialog } from "../components/confirm-dialog";
import { LOCAL_STATUS_NEW } from "../constants/constants";
import { useBlocks } from "../hooks/base/useBlocks";
import { useExercises } from "../hooks/base/useExercises";
import { useSaveWorkout } from "../hooks/base/useSaveWorkout";
import { useWorkouts } from "../hooks/base/useWorkouts";
import { useOrderedBlocks } from "../hooks/other/useOrderedBlocks";
import { useWorkoutStore } from "../stores/useWorkoutStore";
import { UIWorkout } from "../types/ui";
import { swapItems } from "../utils/reorder";
import { handleAndShowError, showSuccessMessage } from "../utils/ui";
import { validateWorkout } from "../utils/validation";

export default function WorkoutScreen() {
  const router = useRouter();
  const colors = useTheme();
  const params = useLocalSearchParams();

  const { deleteWorkout, getWorkoutById } = useWorkouts();
  const { deleteBlock } = useBlocks();
  const { deleteExercise } = useExercises();
  const { saveWorkout } = useSaveWorkout();
  const {
    workout,
    block,
    startNewWorkout,
    setName,
    updateBlock,
    removeBlock,
    reset,
    loadWorkout,
  } = useWorkoutStore();

  const initialWorkoutRef = useRef<any | null>(null);
  const contentStyle = createStyles(colors);
  const blocks = useOrderedBlocks(workout);

  useEffect(() => {
    if (!workout) {
      startNewWorkout();
    }
  }, [params.id, startNewWorkout, workout]);

  // capture initial snapshot to detect dirty state
  useEffect(() => {
    if (workout && !block?.id.toString().startsWith("temp-"))
      initialWorkoutRef.current = JSON.parse(JSON.stringify(workout));
  }, [workout, block?.id]);

  const handleDone = useCallback(async () => {
    Keyboard.dismiss();

    try {
      const validationError = validateWorkout(workout as UIWorkout);
      if (validationError) {
        throw new Error(validationError);
      }
      await saveWorkout(workout!);
      showSuccessMessage("Workout saved");
      reset();
      router.replace("/");
    } catch (error) {
      handleAndShowError(error);
    }
  }, [saveWorkout, workout, reset, router]);

  const handleDiscard = useCallback(() => {
    Keyboard.dismiss();
    // show confirm dialog (replaces Alert)
    setDiscardConfirmVisible(true);
  }, [workout, reset, router, getWorkoutById, loadWorkout]);

  const [discardConfirmVisible, setDiscardConfirmVisible] = useState(false);
  const [deleteWorkoutConfirmVisible, setDeleteWorkoutConfirmVisible] =
    useState(false);
  const [deleteExerciseConfirmVisible, setDeleteExerciseConfirmVisible] =
    useState(false);
  const [blockToDeleteId, setBlockToDeleteId] = useState<string | null>(null);

  const doDiscard = useCallback(async () => {
    setDiscardConfirmVisible(false);
    try {
      if (!workout) return router.replace("/");

      if (
        workout.id?.toString().startsWith("temp-") ||
        workout.localStatus === LOCAL_STATUS_NEW
      ) {
        reset();
        return router.replace("/");
      }

      const id = Number(workout.id);
      const original = await getWorkoutById(id);
      if (original) {
        loadWorkout(original as any);
      }
      router.replace("/");
    } catch (error) {
      handleAndShowError(error);
    }
  }, [workout, reset, router, getWorkoutById, loadWorkout]);

  const handleEditBlock = useCallback(
    (blockId: string) => {
      router.push(`/block?blockId=${blockId}`);
    },
    [router],
  );

  const handleDeleteWorkout = useCallback(() => {
    Keyboard.dismiss();
    setDeleteWorkoutConfirmVisible(true);
  }, []);

  const doDeleteWorkout = useCallback(async () => {
    setDeleteWorkoutConfirmVisible(false);
    try {
      await Promise.all(
        workout?.blocks
          ?.map((s) => s.id)!
          .map(async (blockId) => {
            await deleteBlock(Number(blockId));
          }) || [],
      );

      await Promise.all(
        workout?.blocks
          ?.flatMap((s) => (s.exercises || []).map((e) => e.id))
          .map(async (exerciseId) => {
            await deleteExercise(Number(exerciseId));
          }) || [],
      );

      await deleteWorkout(Number(workout!.id));
      showSuccessMessage("Workout deleted");
      reset();
      router.replace("/");
    } catch (error) {
      handleAndShowError(error);
    }
  }, [workout, deleteWorkout, deleteBlock, deleteExercise, reset, router]);

  const handleAddBlock = useCallback(() => {
    router.push("/block");
  }, [router]);

  const handleDeleteBlock = useCallback((blockId: string) => {
    setBlockToDeleteId(blockId);
    setDeleteExerciseConfirmVisible(true);
  }, []);

  const doDeleteBlock = useCallback(async () => {
    setDeleteExerciseConfirmVisible(false);
    try {
      if (blockToDeleteId) {
        removeBlock(blockToDeleteId);
      }
    } catch (error) {
      handleAndShowError(error);
    }
  }, [blockToDeleteId, removeBlock]);

  const moveBlock = (from: number, to: number) => {
    const reordered = swapItems(blocks, from, to);

    reordered.forEach((block, index) => {
      updateBlock(block.id.toString(), { position: index });
    });
  };

  if (!workout) return null;

  const isCreating = workout.id?.toString().startsWith("temp-") || false;

  return (
    <>
      <Stack.Screen
        options={{
          title: "Workout",
          headerRight: () => (
            <Button
              variant="destructive"
              size="icon"
              onPress={() => handleDeleteWorkout()}
            >
              <Icon as={Trash}></Icon>
            </Button>
          ),
        }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={contentStyle.container}>
              <View style={contentStyle.card}>
                <Field label="Workout name">
                  <TextInput
                    style={contentStyle.input}
                    value={workout.name}
                    onChangeText={setName}
                    accessibilityLabel="Workout name input"
                  />
                </Field>
              </View>

              <ThemedText type="subtitle">Blocks</ThemedText>

              {blocks.length > 0 ? (
                blocks.map((block, index) => (
                  <View key={block.id} style={{ marginBottom: 12 }}>
                    <Card
                      text={block.name}
                      onEdit={() => handleEditBlock(block.id.toString())}
                      onDelete={() => handleDeleteBlock(block.id.toString())}
                      index={index}
                      handleMovePrev={() => moveBlock(index, index - 1)}
                      handleMoveNext={() => moveBlock(index, index + 1)}
                      isDisabledPrev={index === 0}
                      isDisabledNext={index === blocks.length - 1}
                    />
                  </View>
                ))
              ) : (
                <ThemedText>No blocks yet</ThemedText>
              )}

              <ThemedButton
                text="New Block"
                icon={
                  <MaterialIcons
                    name="add"
                    size={IconSizes.SMALL}
                    color={colors.PRIMARY_ICON_COLOR}
                  />
                }
                onPress={handleAddBlock}
              />
            </ScrollView>
            <ConfirmDialog
              visible={discardConfirmVisible}
              title="Discard changes?"
              message="Are you sure you want to discard changes to this workout?"
              onCancel={() => setDiscardConfirmVisible(false)}
              onConfirm={doDiscard}
              cancelText="Cancel"
              confirmText="Discard"
              destructive
            />
            <ConfirmDialog
              visible={deleteWorkoutConfirmVisible}
              title="Remove workout?"
              message="Are you sure you want to remove this workout?"
              onCancel={() => setDeleteWorkoutConfirmVisible(false)}
              onConfirm={doDeleteWorkout}
              cancelText="Cancel"
              confirmText="Delete"
              destructive
            />
            <ConfirmDialog
              visible={deleteExerciseConfirmVisible}
              title="Remove block?"
              message="Are you sure you want to remove this block?"
              onCancel={() => setDeleteExerciseConfirmVisible(false)}
              onConfirm={doDeleteBlock}
              cancelText="Cancel"
              confirmText="Delete"
              destructive
            />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      padding: Sizes.PADDING_LARGE,
      gap: Spacing.DOUBLE_EXTRA_LARGE,
      backgroundColor: colors.BACKGROUND_SECONDARY,
      flexGrow: 1,
    },
    card: {
      padding: Sizes.PADDING_LARGE,
      backgroundColor: colors.BACKGROUND,
      borderRadius: Sizes.BORDER_RADIUS_LARGE,
      borderWidth: Sizes.BORDER_WIDTH,
      borderColor: colors.BORDER,
      gap: Spacing.LARGE,
    },
    text: {
      color: colors.TEXT_PRIMARY,
    },
    input: {
      borderWidth: Sizes.BORDER_WIDTH,
      borderColor: colors.BORDER,
      padding: Sizes.PADDING,
      borderRadius: Sizes.BORDER_RADIUS,
      backgroundColor: colors.LIGHT_BACKGROUND,
      color: colors.TEXT_PRIMARY,
    },
    headerButtonRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: Spacing.LARGE,
    },
  });
