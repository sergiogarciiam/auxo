import { Stack, useNavigation, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useTheme } from "../hooks/other/useTheme";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { Plus, Save, Trash } from "lucide-react-native";

import DraggableFlatList from "react-native-draggable-flatlist";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { CustomAlertDialog } from "../components/alert-dialog";
import { BlockCard } from "../components/block-card";

import { Sizes, Spacing } from "@/lib/theme";
import { useBlocks } from "../hooks/base/useBlocks";
import { useExercises } from "../hooks/base/useExercises";
import { useSaveWorkout } from "../hooks/base/useSaveWorkout";
import { useWorkouts } from "../hooks/base/useWorkouts";
import { useOrderedBlocks } from "../hooks/other/useOrderedBlocks";
import { useWorkoutStore } from "../stores/useWorkoutStore";
import { UIBlock, UIWorkout } from "../types/ui";
import { handleAndShowError, showSuccessMessage } from "../utils/ui";
import { validateWorkout } from "../utils/validation";

interface DragEndEvent {
  data: UIBlock[];
}

export default function MainWWorkout() {
  const router = useRouter();
  const colors = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const { deleteWorkout } = useWorkouts();
  const { deleteBlock } = useBlocks();
  const { deleteExercise } = useExercises();
  const { saveWorkout } = useSaveWorkout();

  const { workout, startNewWorkout, setName, updateBlock, reset } =
    useWorkoutStore();

  const initialWorkoutRef = useRef<UIWorkout | null>(null);
  const blocks = useOrderedBlocks(workout);

  const [open, setOpen] = useState(false);
  const [isOPenDiscardDialog, setIsOpenDiscardDialog] = useState(false);

  const isLeavingRef = useRef(false);

  const hasChanges = useCallback(() => {
    if (!initialWorkoutRef.current || !workout) return false;

    return (
      JSON.stringify(initialWorkoutRef.current) !== JSON.stringify(workout)
    );
  }, [workout]);

  useEffect(() => {
    if (!workout) startNewWorkout();
  }, [startNewWorkout, workout]);

  useEffect(() => {
    if (workout && !initialWorkoutRef.current) {
      initialWorkoutRef.current = JSON.parse(JSON.stringify(workout));
    }
  }, [workout]);

  useEffect(() => {
    const unsub = navigation.addListener("beforeRemove", (e: any) => {
      if (isLeavingRef.current) return;

      if (!hasChanges()) return;

      e.preventDefault();
      setIsOpenDiscardDialog(true);
    });

    return unsub;
  }, [navigation, hasChanges]);

  const handleDone = useCallback(async () => {
    Keyboard.dismiss();

    try {
      const validationError = validateWorkout(workout as UIWorkout);
      if (validationError) throw new Error(validationError);

      await saveWorkout(workout!);
      showSuccessMessage("Workout saved");
      isLeavingRef.current = true;
      reset();
      router.back();
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
      isLeavingRef.current = true;
      reset();
      router.back();
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
    ({ data }: DragEndEvent) => {
      data.forEach((block, index) => {
        updateBlock(block.id.toString(), { position: index });
      });
    },
    [updateBlock],
  );

  const handleDiscard = () => {
    isLeavingRef.current = true;
    setIsOpenDiscardDialog(false);
    reset();
    router.back();
  };

  const handleSaveAndExit = async () => {
    setIsOpenDiscardDialog(false);
    await handleDone();
  };

  if (!workout) return null;

  return (
    <>
      <Stack.Screen
        options={{
          title: "Workout",
          headerRight: () =>
            !workout.id.toString().startsWith("temp-") && (
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
          <SafeAreaView
            edges={["bottom", "left", "right"]}
            className="flex-1"
            style={{ backgroundColor: colors.BACKGROUND_SECONDARY }}
          >
            <View className="flex-1">
              <DraggableFlatList
                contentContainerStyle={{
                  paddingHorizontal: Sizes.PADDING_LARGE,
                  paddingBottom: insets.bottom + 125,
                  paddingTop: 16,
                  gap: Spacing.LARGE,
                  flexGrow: 1,
                }}
                data={blocks}
                keyExtractor={(item) => item.id.toString()}
                onDragEnd={handleDragEnd}
                ListHeaderComponent={
                  <View style={{ gap: Spacing.LARGE }}>
                    <Card>
                      <CardContent>
                        <Label>Workout Name</Label>
                        <Input
                          value={workout.name}
                          onChangeText={setName}
                          accessibilityLabel="Workout name input"
                        />
                      </CardContent>
                    </Card>
                    <Text variant="h3">Blocks</Text>
                  </View>
                }
                renderItem={({ item, drag, isActive }) => (
                  <BlockCard
                    block={item as UIBlock}
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
            </View>

            {/* BOTONES FLOTANTES */}
            <View
              className="absolute flex-col gap-2"
              style={{ bottom: insets.bottom + 24, right: 24 }}
            >
              <Button
                variant="secondary"
                className="flex-row items-center justify-center shadow-lg"
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
          </SafeAreaView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <CustomAlertDialog
        open={open}
        message="Are you sure you want to delete this workout?"
        confirm={confirmDeleteWorkout}
        cancel={cancelDeleteWorkout}
      />
      <CustomAlertDialog
        open={isOPenDiscardDialog}
        message="Save changes before leaving?"
        confirm={handleSaveAndExit}
        cancel={handleDiscard}
        confirmText="Save"
        cancelText="Discard"
        onClose={() => setIsOpenDiscardDialog(false)}
      />
    </>
  );
}
