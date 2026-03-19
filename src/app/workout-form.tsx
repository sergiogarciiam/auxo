import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
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
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={createStyles(colors).container}>
            {/* INPUT */}
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

            {/* BLOCKS */}
            <Text variant="h3">Blocks</Text>

            <DraggableFlatList
              contentContainerStyle={createStyles(colors).list}
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
              ListEmptyComponent={<Text>No blocks yet</Text>}
            />

            {/* ACTIONS */}
            <View style={styles.actions}>
              <Button
                style={styles.fullButton}
                variant="outline"
                onPress={handleAddBlock}
              >
                <Icon as={Plus} size={20} />
                <Text>New block</Text>
              </Button>

              <Button style={styles.fullButton} onPress={handleDone}>
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

const styles = StyleSheet.create({
  actions: {
    position: "absolute",
    bottom: 24, // distancia desde el borde inferior
    right: 24, // distancia desde el borde derecho
    borderRadius: 28, // círculo perfecto
    justifyContent: "center",
    alignItems: "center",
    elevation: 5, // sombra en Android
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4, // sombra en iOS
    gap: 10,
  },
  fullButton: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 8,
    paddingHorizontal: 16,
  },
});

const createStyles = (colors: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      padding: Sizes.PADDING_LARGE,
      gap: Spacing.DOUBLE_EXTRA_LARGE,
      backgroundColor: colors.BACKGROUND_SECONDARY,
      flexGrow: 1,
      position: "relative",
    },
    list: {
      gap: Spacing.LARGE,
      flexGrow: 1,
    },
  });
