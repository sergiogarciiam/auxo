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
import {
  Stack,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from "expo-router";
import { Info, Plus, Save, Trash } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
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
import { InfoDialog } from "../components/info-dialog";
import { TimeInput } from "../components/time-input";
import {
  BLOCK_TYPE_LABELS,
  BLOCK_TYPES,
  CIRCUIT_TYPE,
  SUPERSET_TYPE,
} from "../constants/constants";
import { useBlockLifecycle } from "../hooks/other/useBlockLifecycle";
import { useOrderedExercises } from "../hooks/other/useOrdererExercises";
import { useTheme } from "../hooks/other/useTheme";
import { useWorkoutStore } from "../stores/useWorkoutStore";
import { UIBlock } from "../types/ui";
import { swapItems } from "../utils/reorder";
import { handleAndShowError, showSuccessMessage } from "../utils/ui";
import { validateBlock } from "../utils/validation";

export default function BlockForm() {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const colors = useTheme();

  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [isExerciseAlert, setExerciseAlert] = useState(false);
  const [exerciseToDeleteId, setExerciseToDeleteId] = useState<
    string | number | null
  >(null);
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false);

  const isLeavingRef = useRef(false);
  const initialBlockRef = useRef<string | null>(null);

  const {
    updateBlock,
    removeBlock,
    revertBlock,
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
    (data: Partial<UIBlock>) => {
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

  const handleDiscardBlock = useCallback(() => {
    isLeavingRef.current = true;
    setIsDiscardDialogOpen(false);

    if (!blockId) {
      router.back();
      return;
    }

    const hasOriginalData =
      initialBlockRef.current !== null
        ? (() => {
            const original = JSON.parse(initialBlockRef.current) as UIBlock;
            return (
              original.name !== "" ||
              original.type !== "" ||
              original.exercises.length > 0
            );
          })()
        : false;

    if (hasOriginalData) {
      const originalBlock = JSON.parse(initialBlockRef.current!) as UIBlock;
      revertBlock(blockId, originalBlock);
    } else {
      removeBlock(blockId);
    }

    router.back();
  }, [blockId, removeBlock, revertBlock, router]);

  const handleDone = useCallback(() => {
    Keyboard.dismiss();
    try {
      const currentBlock = useWorkoutStore.getState().block;
      const validationError = validateBlock(currentBlock as UIBlock);
      if (validationError) throw new Error(validationError);
      router.back();
    } catch (error) {
      handleAndShowError(error);
    }
  }, [router]);

  useEffect(() => {
    if (block) {
      initialBlockRef.current = JSON.stringify(block);
    }
  }, [block?.id]);

  useEffect(() => {
    const unsub = navigation.addListener("beforeRemove", (e: any) => {
      if (isLeavingRef.current) return;

      const currentBlock = useWorkoutStore.getState().block;
      if (!currentBlock) return;

      const validationError = validateBlock(currentBlock);
      if (!validationError) return;

      // Temp/new unmodified blocks: auto-remove silently
      if (
        currentBlock.id?.toString().startsWith("temp-") ||
        currentBlock.localStatus === "new"
      ) {
        const isUnmodified =
          initialBlockRef.current !== null &&
          JSON.stringify(currentBlock) === initialBlockRef.current;
        if (isUnmodified) {
          isLeavingRef.current = true;
          removeBlock(blockId as string);
          return;
        }
      }

      // No original state captured or unmodified: allow navigation
      if (!initialBlockRef.current) return;
      if (JSON.stringify(currentBlock) === initialBlockRef.current) return;

      e.preventDefault();
      setIsDiscardDialogOpen(true);
    });

    return unsub;
  }, [navigation, blockId, removeBlock]);

  const handleCancelLeave = useCallback(() => {
    setIsDiscardDialogOpen(false);
  }, []);

  const handleSaveAndLeave = useCallback(() => {
    Keyboard.dismiss();
    const currentBlock = useWorkoutStore.getState().block;
    const validationError = validateBlock(currentBlock as UIBlock);
    if (validationError) {
      handleAndShowError(validationError);
      return;
    }
    isLeavingRef.current = true;
    setIsDiscardDialogOpen(false);
    router.back();
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
            style={{
              backgroundColor: colors.BACKGROUND_SECONDARY,
            }}
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
                  <View className="flex-row">
                    <Label>Block type</Label>
                    <Button
                      onPress={() => setIsInfoOpen(true)}
                      size={"sm"}
                      variant={"ghost"}
                    >
                      <Icon as={Info} />
                    </Button>
                  </View>
                  <Select
                    value={selectedBlockType}
                    onValueChange={(option: any) => {
                      if (option?.value) {
                        handleUpdateBlock({ type: option.value });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>

                    <SelectContent>
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
      </KeyboardAvoidingView>
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
      <InfoDialog
        open={isInfoOpen}
        onOpenChange={(open) => setIsInfoOpen(false)}
      />

      <CustomAlertDialog
        open={isDiscardDialogOpen}
        message="Save changes before leaving?"
        confirm={handleSaveAndLeave}
        cancel={handleDiscardBlock}
        confirmText="Save"
        cancelText="Discard"
        onClose={() => setIsDiscardDialogOpen(false)}
      />
    </>
  );
}
