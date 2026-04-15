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
import { useCallback, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { CustomAlertDialog } from "../components/alert-dialog";
import { ExercisesBlock } from "../components/exercises-block";
import { TimeInput } from "../components/time-input";
import {
  BLOCK_TYPE_LABELS,
  BLOCK_TYPES,
  CIRCUIT_TYPE,
  SUPERSET_TYPE,
} from "../constants/constants";
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

  const [open, setOpen] = useState(false);
  const [isExerciseAlert, setExerciseAlert] = useState(false);
  const [exerciseToDeleteId, setExerciseToDeleteId] = useState<
    string | number | null
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
    reordered.forEach((e, idx) =>
      updateExercise(blockId!, e.id, { position: idx }),
    );
  };

  const handleMoveNextExercise = (index: number) => {
    const reordered = swapItems(localExercises, index, index + 1);
    reordered.forEach((e, idx) =>
      updateExercise(blockId!, e.id, { position: idx }),
    );
  };

  const handleDeleteExercise = useCallback((exerciseId: string) => {
    setExerciseToDeleteId(exerciseId);
    setExerciseAlert(true);
  }, []);

  const doDeleteExercise = useCallback(() => {
    setExerciseAlert(false);
    if (exerciseToDeleteId !== null && blockId) {
      removeExercise(blockId, String(exerciseToDeleteId));
    }
  }, [exerciseToDeleteId, blockId, removeExercise]);

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
    setOpen(true);
  }, []);

  const doDeleteBlock = useCallback(async () => {
    setOpen(false);
    try {
      removeBlock(blockId as string);
      router.back();
      showSuccessMessage("Block deleted");
    } catch (error) {
      handleAndShowError(error);
    }
  }, [blockId, removeBlock, router]);

  const handleDone = useCallback(() => {
    Keyboard.dismiss();
    try {
      const currentBlock = useWorkoutStore.getState().block;
      const validationError = validateBlock(currentBlock as UIBlock);
      if (validationError) throw new Error(validationError);
      router.back();
      showSuccessMessage("Block saved");
    } catch (error) {
      handleAndShowError(error);
    }
  }, [router]);

  if (!block) return null;

  const BLOCK_TYPE_OPTIONS = BLOCK_TYPES.map((type) => ({
    label: BLOCK_TYPE_LABELS[type],
    value: type,
  }));

  const selectedBlockType = BLOCK_TYPE_OPTIONS.find(
    (opt) => opt.value === block.type,
  );

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
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            className="flex-grow gap-8 p-6"
            style={{ backgroundColor: colors.BACKGROUND_SECONDARY }}
          >
            <Card className="mb-6">
              <CardContent className="gap-2">
                {/* NAME */}
                <View>
                  <Label>Block name</Label>
                  <Input
                    value={block.name}
                    onChangeText={(text) => handleUpdateBlock({ name: text })}
                  />
                </View>

                {/* BLOCK TYPE */}
                <View>
                  <Label>Block type</Label>

                  <Select
                    value={selectedBlockType}
                    onValueChange={(option) =>
                      handleUpdateBlock({ type: option?.value ?? option })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>

                    <SelectContent className="w-full">
                      <SelectGroup>
                        <SelectLabel>Block Types</SelectLabel>

                        {BLOCK_TYPE_OPTIONS.map((opt) => (
                          <SelectItem
                            key={opt.value}
                            value={opt.value}
                            label={opt.label}
                          >
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </View>

                {/* TIMES */}
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
                      handleUpdateBlock({ rest_exercise: seconds })
                    }
                  />
                </View>

                {isCircuitOrSuperset && (
                  <View>
                    <Label>Rest between {block.type}</Label>
                    <TimeInput
                      value={block.rest_group}
                      onChange={(seconds) =>
                        handleUpdateBlock({ rest_group: seconds })
                      }
                    />
                  </View>
                )}
              </CardContent>
            </Card>

            {/* EXERCISES */}
            <Text variant="h3">Exercises</Text>

            <View className="relative flex flex-grow gap-2 mb-8">
              <ExercisesBlock
                exercises={localExercises}
                blockId={blockId!}
                updateExercise={updateExercise}
                handleDeleteExercise={handleDeleteExercise}
                onMovePrev={handleMovePrevExercise}
                onMoveNext={handleMoveNextExercise}
              />

              <Button
                variant="outline"
                onPress={handleAddExercise}
                className="flex-row items-center gap-2"
              >
                <Icon as={Plus} size={20} />
                <Text>New exercise</Text>
              </Button>

              <Button
                onPress={handleDone}
                className="flex-row items-center gap-2"
              >
                <Icon as={Save} size={20} />
                <Text>Save block</Text>
              </Button>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>

        {/* ALERTS */}
        <CustomAlertDialog
          open={open}
          message="Are you sure you want to remove this block?"
          cancel={() => setOpen(false)}
          confirm={doDeleteBlock}
        />

        <CustomAlertDialog
          open={isExerciseAlert}
          message="Are you sure you want to remove this exercise?"
          cancel={() => setExerciseAlert(false)}
          confirm={doDeleteExercise}
        />
      </KeyboardAvoidingView>
    </>
  );
}
