import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Plus, Save, Trash } from "lucide-react-native";
import { useCallback, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { ConfirmDialog } from "../components/confirm-dialog";
import { ExercisesBlock } from "../components/exercises-block";
import { ThemedText } from "../components/themed-text";
import { TimeInput } from "../components/time-input";
import {
  BLOCK_TYPE_LABELS,
  BLOCK_TYPES,
  CIRCUIT_TYPE,
  LOCAL_STATUS_NEW,
  SUPERSET_TYPE,
} from "../constants/constants";
import { Sizes, Spacing, Typography } from "../constants/theme";
import { useBlockLifecycle } from "../hooks/other/useBlockLifecycle";
import { useOrderedExercises } from "../hooks/other/useOrdererExercises";
import { useTheme } from "../hooks/useTheme";
import { useWorkoutStore } from "../stores/useWorkoutStore";
import { UIBlock } from "../types/ui";
import { swapItems } from "../utils/reorder";
import { handleAndShowError, showSuccessMessage } from "../utils/ui";
import { validateBlock } from "../utils/validation";

export default function BlockForm() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colors = useTheme();
  const initialBlockRef = useRef<UIBlock | null>(null);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [discardConfirmVisible, setDiscardConfirmVisible] = useState(false);
  const [deleteExerciseConfirmVisible, setDeleteExerciseConfirmVisible] =
    useState(false);
  const [exerciseToDeleteId, setExerciseToDeleteId] = useState<
    string | number | null
  >(null);
  const [exerciseToDeleteName, setExerciseToDeleteName] = useState<string>("");
  const [infoDialogType, setInfoDialogType] = useState<
    "type" | "prepare_time" | "rest_exercise" | "rest_group" | null
  >(null);

  const {
    updateBlock,
    removeBlock,
    addExercise,
    updateExercise,
    removeExercise,
  } = useWorkoutStore();

  const { block, blockId } = useBlockLifecycle(
    params.blockId as string | undefined,
  );
  const localExercises = useOrderedExercises(block);

  const handleAddExercise = useCallback(() => {
    try {
      addExercise(blockId as string);
    } catch (error) {
      handleAndShowError(error);
    }
  }, [blockId, addExercise]);

  const handleMovePrevExercise = (index: number) => {
    const reordered = swapItems(localExercises, index, index - 1);

    reordered.forEach((e, idx) => {
      updateExercise(blockId!, e.id, { position: idx });
    });
  };

  const handleMoveNextExercise = (index: number) => {
    const reordered = swapItems(localExercises, index, index + 1);

    reordered.forEach((e, idx) => {
      updateExercise(blockId!, e.id, { position: idx });
    });
  };

  const handleUpdateBlock = useCallback(
    (data: any) => {
      try {
        if (!blockId) return;
        updateBlock(blockId.toString(), data);
      } catch (error) {
        handleAndShowError(error);
      }
    },
    [blockId, updateBlock],
  );

  const handleDeleteBlock = useCallback(() => {
    Keyboard.dismiss();
    setDeleteConfirmVisible(true);
  }, []);

  const doDeleteBlock = useCallback(async () => {
    setDeleteConfirmVisible(false);
    try {
      removeBlock(blockId as string);
      router.replace("/workout-form");
      showSuccessMessage("Block deleted");
    } catch (error) {
      handleAndShowError(error);
    }
  }, [blockId, removeBlock, router]);

  const isCreating = block?.id?.toString().startsWith("temp-") || false;

  const handleDone = useCallback(() => {
    Keyboard.dismiss();

    try {
      const currentBlock = useWorkoutStore.getState().block;
      const validationError = validateBlock(currentBlock as UIBlock);
      if (validationError) {
        throw new Error(validationError);
      }
      router.replace("/workout-form");
      showSuccessMessage("Block saved");
    } catch (error) {
      handleAndShowError(error);
    }
  }, [router]);

  const handleDiscard = useCallback(() => {
    Keyboard.dismiss();
    setDiscardConfirmVisible(true);
  }, []);

  const doDiscard = useCallback(() => {
    setDiscardConfirmVisible(false);
    try {
      if (block?.localStatus === LOCAL_STATUS_NEW) {
        removeBlock(blockId as string);
      } else if (initialBlockRef.current) {
        if (!blockId) return;
        updateBlock(blockId.toString(), initialBlockRef.current);
      }
      router.replace("/workout-form");
    } catch (error) {
      handleAndShowError(error);
    }
  }, [block, blockId, removeBlock, updateBlock, router]);

  const doDeleteExercise = useCallback(() => {
    setDeleteExerciseConfirmVisible(false);
    if (exerciseToDeleteId !== null && blockId) {
      removeExercise(blockId, String(exerciseToDeleteId));
    }
  }, [exerciseToDeleteId, blockId, removeExercise]);

  if (!block) return null;

  const isCircuitOrSuperset =
    block.type === CIRCUIT_TYPE || block.type === SUPERSET_TYPE;

  return (
    <>
      <Stack.Screen
        options={{
          title: "Block",
          headerRight: () => (
            <Button
              variant="destructive"
              size="icon"
              onPress={handleDeleteBlock}
            >
              <Icon as={Trash} />
            </Button>
          ),
        }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <TouchableWithoutFeedback
          onPress={Keyboard.dismiss}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={createStyles(colors).container}>
            <Card>
              <CardContent className="gap-2">
                <View>
                  <Label>Block name</Label>
                  <Input
                    value={block.name}
                    onChangeText={(text) => handleUpdateBlock({ name: text })}
                  />
                </View>

                <View>
                  <Label>Block type</Label>
                  <Select
                    value={
                      block.type
                        ? {
                            value: block.type,
                            label: BLOCK_TYPE_LABELS[block.type],
                          }
                        : undefined
                    }
                    onValueChange={(value) =>
                      handleUpdateBlock({ type: value })
                    }
                  >
                    <SelectTrigger className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md">
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>

                    <SelectContent className="w-full mt-1 bg-white border border-gray-300 rounded-md">
                      <SelectGroup>
                        <SelectLabel>Block Types</SelectLabel>
                        <SelectItem label="Select Type" value="">
                          Select Type
                        </SelectItem>
                        {BLOCK_TYPES.map((type) => (
                          <SelectItem label={type} key={type} value={type}>
                            {BLOCK_TYPE_LABELS[type]}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </View>

                <View>
                  <Label>Prepare time</Label>
                  <TimeInput
                    value={block.prepare_time}
                    onChange={(seconds) =>
                      handleUpdateBlock({ prepare_time: seconds })
                    }
                  />
                </View>

                <View>
                  <Label>Rest between exercises</Label>
                  <TimeInput
                    value={block.rest_exercise}
                    onChange={(seconds) =>
                      handleUpdateBlock({
                        rest_exercise: seconds,
                      })
                    }
                  />
                </View>

                {(block.type === CIRCUIT_TYPE ||
                  block.type === SUPERSET_TYPE) && (
                  <View>
                    <Label>Rest between {block.type || "group"}</Label>

                    <TimeInput
                      disabled={!isCircuitOrSuperset}
                      value={block.rest_group}
                      onChange={(seconds) =>
                        handleUpdateBlock({
                          rest_group: seconds,
                        })
                      }
                    />
                  </View>
                )}
              </CardContent>
            </Card>

            <ThemedText type="subtitle">Exercises</ThemedText>

            <View className="relative flex flex-grow mb-8">
              <ExercisesBlock
                exercises={localExercises}
                blockId={blockId!}
                updateExercise={updateExercise}
                removeExercise={removeExercise}
                onMovePrev={handleMovePrevExercise}
                onMoveNext={handleMoveNextExercise}
              />
              <View className="gap-2">
                <Button variant="outline" onPress={handleAddExercise}>
                  <Icon as={Plus} size={20} />
                  <Text>New exercise</Text>
                </Button>

                <Button onPress={handleDone}>
                  <Icon as={Save} size={20} />
                  <Text>Save block</Text>
                </Button>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
        <ConfirmDialog
          visible={deleteConfirmVisible}
          title="Remove block?"
          message="Are you sure you want to remove this block?"
          onCancel={() => setDeleteConfirmVisible(false)}
          onConfirm={doDeleteBlock}
          cancelText="Cancel"
          confirmText="Delete"
          destructive
        />
        <ConfirmDialog
          visible={discardConfirmVisible}
          title="Discard changes?"
          message="Are you sure you want to discard changes to this block?"
          onCancel={() => setDiscardConfirmVisible(false)}
          onConfirm={doDiscard}
          cancelText="Cancel"
          confirmText="Discard"
          destructive
        />
        <ConfirmDialog
          visible={deleteExerciseConfirmVisible}
          title="Remove exercise?"
          message={`Are you sure you want to remove ${exerciseToDeleteName !== "" ? `"${exerciseToDeleteName}"` : "this exercise"}?`}
          onCancel={() => setDeleteExerciseConfirmVisible(false)}
          onConfirm={doDeleteExercise}
          cancelText="Cancel"
          confirmText="Delete"
          destructive
        />
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
      position: "relative",
    },
    card: {
      padding: Sizes.PADDING_LARGE,
      backgroundColor: colors.BACKGROUND,
      borderRadius: Sizes.BORDER_RADIUS_LARGE,
      borderWidth: Sizes.BORDER_WIDTH,
      borderColor: colors.BORDER,
      gap: Spacing.LARGE,
    },
    input: {
      borderWidth: Sizes.BORDER_WIDTH,
      borderColor: colors.BORDER,
      padding: Sizes.PADDING,
      color: colors.TEXT_PRIMARY,
      borderRadius: Sizes.BORDER_RADIUS,
      backgroundColor: colors.LIGHT_BACKGROUND,
      fontSize: Typography.FONT_SIZE_DEFAULT,
    },
    pickerContainer: {
      borderWidth: Sizes.BORDER_WIDTH,
      borderColor: colors.BORDER,
      borderRadius: Sizes.BORDER_RADIUS,
      backgroundColor: colors.LIGHT_BACKGROUND,
      color: colors.TEXT_PRIMARY,
      overflow: "hidden",
    },
    pickerItem: {
      color: colors.TEXT_PRIMARY,
      backgroundColor: colors.PICKER_BACKGROUND,
    },
  });
