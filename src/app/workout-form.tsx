import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useTheme } from "../hooks/useTheme";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { Plus, Save, Trash } from "lucide-react-native";

import DraggableFlatList from "react-native-draggable-flatlist";
import { CustomAlertDialog } from "../components/alert-dialog";
import { BlockCard } from "../components/block-card";

import { Sizes, Spacing } from "../constants/theme";
import { useBlocks } from "../hooks/base/useBlocks";
import { useExercises } from "../hooks/base/useExercises";
import { useSaveWorkout } from "../hooks/base/useSaveWorkout";
import { useWorkouts } from "../hooks/base/useWorkouts";
import { useOrderedBlocks } from "../hooks/other/useOrderedBlocks";
import { useWorkoutStore } from "../stores/useWorkoutStore";
import { UIWorkout } from "../types/ui";
import { handleAndShowError, showSuccessMessage } from "../utils/ui";
import { validateWorkout } from "../utils/validation";

export default function WorkoutForm() {
  const router = useRouter();
  const colors = useTheme();
  const params = useLocalSearchParams();

  const { deleteWorkout } = useWorkouts();
  const { deleteBlock } = useBlocks();
  const { deleteExercise } = useExercises();
  const { saveWorkout } = useSaveWorkout();

  const { workout, block, startNewWorkout, setName, updateBlock, reset } =
    useWorkoutStore();

  const initialWorkoutRef = useRef<any | null>(null);
  const blocks = useOrderedBlocks(workout);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!workout) startNewWorkout();
  }, [params.id, startNewWorkout, workout]);

  useEffect(() => {
    if (workout && !block?.id.toString().startsWith("temp-")) {
      initialWorkoutRef.current = JSON.parse(JSON.stringify(workout));
    }
  }, [workout, block?.id]);

  const handleDone = useCallback(async () => {
    Keyboard.dismiss();

    try {
      const validationError = validateWorkout(workout as UIWorkout);
      if (validationError) throw new Error(validationError);

      await saveWorkout(workout!);
      showSuccessMessage("Workout saved");
      reset();
      router.replace("/");
    } catch (error) {
      handleAndShowError(error);
    }
  }, [saveWorkout, workout, reset, router]);

  const handleEditBlock = useCallback(
    (blockId: string) => {
      router.push(`/block-form?blockId=${blockId}`);
    },
    [router],
  );

  const handleDeleteWorkout = useCallback(() => {
    Keyboard.dismiss();
    setOpen(true);
  }, []);

  const confirmDeleteWorkout = useCallback(async () => {
    setOpen(false);

    try {
      await Promise.all(
        workout?.blocks?.map((b) => deleteBlock(Number(b.id))) || [],
      );

      await Promise.all(
        workout?.blocks
          ?.flatMap((b) => b.exercises || [])
          .map((e) => deleteExercise(Number(e.id))) || [],
      );

      await deleteWorkout(Number(workout!.id));
      showSuccessMessage("Workout deleted");
      reset();
      router.replace("/");
    } catch (error) {
      handleAndShowError(error);
    }
  }, [workout, deleteWorkout, deleteBlock, deleteExercise, reset, router]);

  const cancelDeleteWorkout = useCallback(() => {
    setOpen(false);
  }, []);

  const handleAddBlock = useCallback(() => {
    router.push("/block-form");
  }, [router]);

  const handleDragEnd = useCallback(
    ({ data }: any) => {
      data.forEach((block: any, index: number) => {
        updateBlock(block.id.toString(), { position: index });
      });
    },
    [updateBlock],
  );

  if (!workout) return null;

  return (
    <>
      <Stack.Screen
        options={{
          title: "Workout",
          headerRight: () => (
            <Button
              variant="destructive"
              size="icon"
              onPress={handleDeleteWorkout}
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
          <View
            className="flex-1"
            style={{ backgroundColor: colors.BACKGROUND_SECONDARY }}
          >
            {/* INPUT */}
            <Card className="m-4">
              <CardContent>
                <Label>Workout Name</Label>
                <Input
                  value={workout.name}
                  onChangeText={setName}
                  accessibilityLabel="Workout name input"
                />
              </CardContent>
            </Card>

            {/* BLOCKS */}
            <Text variant="h3" className="px-4 mb-2">
              Blocks
            </Text>

            <DraggableFlatList
              contentContainerStyle={{
                paddingHorizontal: Sizes.PADDING_LARGE,
                paddingBottom: 0, // ya no necesitamos espacio extra
                gap: Spacing.LARGE,
              }}
              data={blocks}
              keyExtractor={(item) => item.id.toString()}
              onDragEnd={handleDragEnd}
              renderItem={({ item, drag, isActive }) => (
                <BlockCard
                  block={item}
                  drag={drag}
                  isActive={isActive}
                  handleEditBlock={() => handleEditBlock(item.id.toString())}
                />
              )}
              ListEmptyComponent={
                <Text className="mt-4 text-center text-gray-400">
                  No blocks yet
                </Text>
              }
            />

            {/* BOTONES FLOTANTES */}
            <View className="absolute flex-col gap-2 bottom-6 right-6">
              <Button
                variant="outline"
                className="flex-row items-center justify-center"
                onPress={handleAddBlock}
              >
                <Icon as={Plus} size={20} />
                <Text>New block</Text>
              </Button>

              <Button
                className="flex-row items-center justify-center"
                onPress={handleDone}
              >
                <Icon as={Save} size={20} />
                <Text>Save workout</Text>
              </Button>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <CustomAlertDialog
        open={open}
        message="Are you sure you want to delete this workout?"
        confirm={confirmDeleteWorkout}
        cancel={cancelDeleteWorkout}
      />
    </>
  );
}
