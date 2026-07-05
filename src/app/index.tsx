import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { Sizes, Spacing } from "@/lib/theme";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { Plus, Settings } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import DraggableFlatList from "react-native-draggable-flatlist";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { WorkoutCard } from "../components/workout-card";
import { useWorkouts } from "../hooks/base/useWorkouts";
import { useLoadWorkout } from "../hooks/other/useLoadWorkout";
import { useTheme } from "../hooks/other/useTheme";
import { useStartWorkoutStore } from "../stores/useStartWorkoutStore";
import { useWorkoutStore } from "../stores/useWorkoutStore";
import { UIWorkout } from "../types/ui";
import { buildExecutionPlan } from "../utils/planner";
import { transformWorkoutsToUI } from "../utils/transformers";
import { handleAndShowError } from "../utils/ui";

export default function Homepage() {
  const router = useRouter();
  const colors = useTheme();
  const insets = useSafeAreaInsets();

  const [uiWorkouts, setUIWorkouts] = useState<UIWorkout[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { localWorkouts, loadWorkouts, loadWorkout, reset } = useWorkoutStore();
  const { startWorkout } = useStartWorkoutStore();
  const loadWorkoutWithData = useLoadWorkout();
  const { workouts, updateWorkout, fetchWorkouts } = useWorkouts();

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      fetchWorkouts().finally(() => setIsLoading(false));
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
    async (id: number | string) => {
      try {
        reset();
        const workout = await loadWorkoutWithData(Number(id));
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
    async (id: number | string) => {
      try {
        const workout = await loadWorkoutWithData(Number(id));
        const plan = buildExecutionPlan(workout);
        startWorkout(workout, plan);
        router.push("/main-workout");
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
          headerTitleAlign: "left",
          title: "Auxo",
          headerTitle: () => (
            <Text
              style={{
                marginLeft: Sizes.PADDING_LARGE,
                fontSize: 18,
                fontWeight: "500",
                color: colors.TEXT_PRIMARY,
              }}
            >
              Auxo
            </Text>
          ),
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

      <SafeAreaView
        edges={["bottom", "left", "right"]}
        className="relative flex-1"
        style={{ backgroundColor: colors.BACKGROUND_SECONDARY }}
      >
        <DraggableFlatList
          contentContainerStyle={{
            padding: Sizes.PADDING_LARGE,
            gap: Spacing.LARGE,
            flexGrow: 1,
            paddingBottom: insets.bottom + 100,
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
          ListEmptyComponent={
            isLoading ? (
              <Text className="mt-4 text-center text-gray-400">Loading...</Text>
            ) : (
              <Text className="mt-4 text-center text-gray-400">
                No workouts yet
              </Text>
            )
          }
        />

        <Button
          onPress={handleCreateWorkout}
          variant={"secondary"}
          className="absolute flex-row items-center justify-center shadow-lg"
          style={{ bottom: insets.bottom + 24, right: 24 }}
        >
          <Icon as={Plus} size={20} />
          <Text>New workout</Text>
        </Button>
      </SafeAreaView>
    </>
  );
}
