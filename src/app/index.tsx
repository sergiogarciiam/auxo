import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { Plus, Settings } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";
import { WorkoutCard } from "../components/workout-card";
import { Sizes, Spacing } from "../constants/theme";
import { useWorkouts } from "../hooks/base/useWorkouts";
import { useLoadWorkout } from "../hooks/other/useLoadWorkout";
import { useTheme } from "../hooks/useTheme";
import { useStartWorkoutStore } from "../stores/useStartWorkoutStore";
import { useWorkoutStore } from "../stores/useWorkoutStore";
import { UIWorkout } from "../types/ui";
import { buildExecutionPlan } from "../utils/planner";
import { transformWorkoutsToUI } from "../utils/transformers";
import { handleAndShowError } from "../utils/ui";

export default function Homepage() {
  const router = useRouter();
  const colors = useTheme();

  const [uiWorkouts, setUIWorkouts] = useState<UIWorkout[]>([]);

  const { localWorkouts, loadWorkouts, loadWorkout, reset } = useWorkoutStore();
  const { startWorkout } = useStartWorkoutStore();
  const loadWorkoutWithData = useLoadWorkout();
  const { workouts, updateWorkout, fetchWorkouts } = useWorkouts();

  useFocusEffect(
    useCallback(() => {
      fetchWorkouts();
    }, [fetchWorkouts]),
  );

  useEffect(() => {
    loadWorkouts(transformWorkoutsToUI(workouts));
  }, [workouts, loadWorkouts]);

  useEffect(() => {
    setUIWorkouts(localWorkouts || []);
  }, [localWorkouts]);

  const handleCreateWorkout = useCallback(() => {
    reset();
    router.push("/workout-form");
  }, [reset, router]);

  const handleEditWorkout = useCallback(
    async (id: number) => {
      try {
        reset();
        const workout = await loadWorkoutWithData(id);
        loadWorkout(workout);
        router.push("/workout-form");
      } catch (error) {
        handleAndShowError(error);
      }
    },
    [loadWorkoutWithData, loadWorkout, reset, router],
  );

  const handleDragEnd = useCallback(
    async ({ data }: { data: UIWorkout[] }) => {
      setUIWorkouts(data);
      loadWorkouts(data);
      try {
        await Promise.all(
          data.map((w, index) =>
            updateWorkout({ id: Number(w.id), name: w.name, position: index }),
          ),
        );
      } catch (error) {
        handleAndShowError(error);
        setUIWorkouts(localWorkouts);
        loadWorkouts(localWorkouts);
      }
    },
    [loadWorkouts, updateWorkout, localWorkouts],
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

  return (
    <>
      <Stack.Screen
        options={{
          headerBackVisible: false,
          title: "Auxo",
          headerRight: () => (
            <Button
              variant="ghost"
              size="icon"
              onPress={() => router.navigate("/settings")}
            >
              <Icon as={Settings} />
            </Button>
          ),
        }}
      />

      <View
        className="relative flex-1"
        style={{ backgroundColor: colors.BACKGROUND_SECONDARY }}
      >
        <DraggableFlatList
          contentContainerStyle={{
            padding: Sizes.PADDING_LARGE,
            gap: Spacing.LARGE,
            flexGrow: 1,
            paddingBottom: 100,
            backgroundColor: colors.BACKGROUND_SECONDARY,
          }}
          data={uiWorkouts}
          keyExtractor={(item) => item.id.toString()}
          onDragEnd={handleDragEnd}
          renderItem={({ item, drag, isActive }) => (
            <WorkoutCard
              key={item.id}
              workout={item}
              drag={drag}
              isActive={isActive}
              handleEditWorkout={handleEditWorkout}
              handleStartWorkout={handleStartWorkout}
            />
          )}
          ListEmptyComponent={<Text>No workouts yet</Text>}
        />

        <Button
          onPress={handleCreateWorkout}
          variant={"secondary"}
          className="absolute flex-row items-center justify-center shadow-lg bottom-6 right-6"
        >
          <Icon as={Plus} size={20} />
          <Text>New workout</Text>
        </Button>
      </View>
    </>
  );
}
