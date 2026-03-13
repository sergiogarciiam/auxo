import { MaterialIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
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
import { ConfirmDialog } from "../components/confirm-dialog";
import { ExerciseCard } from "../components/exercise-card";
import { Field } from "../components/field";
import { Header } from "../components/header";
import InfoDialog from "../components/info-dialog";
import { ThemedButton } from "../components/themed-button";
import { ThemedText } from "../components/themed-text";
import { TimeInput } from "../components/time-input";
import {
  BLOCK_TYPE_LABELS,
  BLOCK_TYPES,
  CIRCUIT_TYPE,
  LOCAL_STATUS_NEW,
  SUPERSET_TYPE,
} from "../constants/constants";
import { IconSizes, Sizes, Spacing, Typography } from "../constants/theme";
import { useBlockLifecycle } from "../hooks/other/useBlockLifecycle";
import { useOrderedExercises } from "../hooks/other/useOrdererExercises";
import { useTheme } from "../hooks/useTheme";
import { useWorkoutStore } from "../stores/useWorkoutStore";
import { UIBlock } from "../types/ui";
import { swapItems } from "../utils/reorder";
import { handleAndShowError, showSuccessMessage } from "../utils/ui";
import { validateBlock } from "../utils/validation";

export default function BlockScreen() {
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
      router.replace("/workout");
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
      router.replace("/workout");
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
      router.replace("/workout");
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
            <Header
              handleDiscard={handleDiscard}
              handleDelete={handleDeleteBlock}
              handleDone={handleDone}
              isCreating={isCreating}
            />
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
            <View style={createStyles(colors).card}>
              <Field label="Block name">
                <TextInput
                  style={createStyles(colors).input}
                  value={block.name}
                  onChangeText={(text) => handleUpdateBlock({ name: text })}
                  accessibilityLabel="Block name input"
                />
              </Field>

              <Field
                label="Block type"
                onHelpPress={() => setInfoDialogType("type")}
              >
                <View style={createStyles(colors).pickerContainer}>
                  <Picker
                    selectedValue={block.type}
                    onValueChange={(value) =>
                      handleUpdateBlock({ type: value })
                    }
                    accessibilityLabel="Block type picker"
                    itemStyle={createStyles(colors).pickerItem}
                  >
                    <Picker.Item
                      label="Select Type"
                      value=""
                      style={createStyles(colors).pickerItem}
                    />
                    {BLOCK_TYPES.map((type) => (
                      <Picker.Item
                        key={type}
                        label={BLOCK_TYPE_LABELS[type]}
                        value={type}
                        style={createStyles(colors).pickerItem}
                      />
                    ))}
                  </Picker>
                </View>
              </Field>

              <Field
                label="Prepare time"
                onHelpPress={() => setInfoDialogType("prepare_time")}
              >
                <TimeInput
                  value={block.prepare_time}
                  onChange={(seconds) =>
                    handleUpdateBlock({ prepare_time: seconds })
                  }
                />
              </Field>

              <Field
                label="Rest between exercises"
                onHelpPress={() => setInfoDialogType("rest_exercise")}
              >
                <TimeInput
                  value={block.rest_exercise}
                  onChange={(seconds) =>
                    handleUpdateBlock({
                      rest_exercise: seconds,
                    })
                  }
                />
              </Field>

              {(block.type === CIRCUIT_TYPE ||
                block.type === SUPERSET_TYPE) && (
                <Field
                  label={`Rest between ${block.type || "group"}`}
                  onHelpPress={() => setInfoDialogType("rest_group")}
                >
                  <TimeInput
                    disabled={!isCircuitOrSuperset}
                    value={block.rest_group}
                    onChange={(seconds) =>
                      handleUpdateBlock({
                        rest_group: seconds,
                      })
                    }
                  />
                </Field>
              )}
            </View>

            <ThemedText type="subtitle">Exercises</ThemedText>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={createStyles(colors).exercisesScroll}
            >
              {localExercises.map((exercise, index) => (
                <View
                  key={exercise.id}
                  style={createStyles(colors).exerciseWrapper}
                >
                  <ExerciseCard
                    exercise={exercise}
                    exerciseId={exercise.id}
                    index={index}
                    handleMovePrev={handleMovePrevExercise}
                    handleMoveNext={handleMoveNextExercise}
                    isDisabledPrev={index === 0}
                    isDisabledNext={index === localExercises.length - 1}
                    setExercise={(exerciseId, ex) => {
                      updateExercise(blockId as string, exerciseId, ex);
                    }}
                    onRemoveExercise={() => {
                      setExerciseToDeleteId(exercise.id);
                      setExerciseToDeleteName(exercise.name);
                      setDeleteExerciseConfirmVisible(true);
                    }}
                  />
                </View>
              ))}

              <View style={createStyles(colors).newExerciseButtonContainer}>
                <ThemedButton
                  text="New Exercise"
                  icon={
                    <MaterialIcons
                      name="add"
                      size={IconSizes.SMALL}
                      color={colors.PRIMARY_ICON_COLOR}
                    />
                  }
                  onPress={handleAddExercise}
                />
              </View>
            </ScrollView>
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
        <InfoDialog
          title="Block type"
          message="The block type determines how rest times are applied."
          visible={infoDialogType === "type"} // You can add a state to control the visibility of this dialog and a button to trigger it if you want.
          onCancel={() => setInfoDialogType(null)}
        />
        <InfoDialog
          title="Prepare time"
          message="This is the time you have to get ready before starting the exercises in this block. It only applies before the first exercise and is ideal for setting up equipment or getting into position."
          visible={infoDialogType === "prepare_time"} // You can add a state to control the visibility of this dialog and a button to trigger it if you want.
          onCancel={() => setInfoDialogType(null)}
        />
        <InfoDialog
          title="Rest between exercises"
          message="This is the time you have to rest between each exercise in this block. It only applies between exercises and is ideal for recovering from one exercise to the next."
          visible={infoDialogType === "rest_exercise"} // You can add a state to control the visibility of this dialog and a button to trigger it if you want.
          onCancel={() => setInfoDialogType(null)}
        />
        <InfoDialog
          title="Rest between groups"
          message="This is the time you have to rest between each group of exercises in this block. It only applies between groups and is ideal for recovering from one group to the next."
          visible={infoDialogType === "rest_group"} // You can add a state to control the visibility of this dialog and a button to trigger it if you want.
          onCancel={() => setInfoDialogType(null)}
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
    inputDisabled: {
      backgroundColor: colors.DISABLED_BACKGROUND,
      borderColor: colors.BORDER,
      color: colors.DISABLED_TEXT,
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
    exercisesScroll: {
      paddingVertical: Spacing.MEDIUM,
    },
    exerciseWrapper: {
      marginRight: Spacing.LARGE,
      width: 320,
    },
    exerciseAddButton: {
      justifyContent: "center",
      alignItems: "center",
      alignSelf: "center",
    },
    newExerciseButtonContainer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: Spacing.LARGE,
    },
  });
