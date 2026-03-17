import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { Stack, useRouter } from "expo-router";
import { Plus, Settings } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
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

  const { localWorkouts, loadWorkouts, loadWorkout, reset } = useWorkoutStore();
  const { startWorkout } = useStartWorkoutStore();

  const loadWorkoutWithData = useLoadWorkout();
  const { workouts, updateWorkout } = useWorkouts();

  const [uiWorkouts, setUIWorkouts] = useState<UIWorkout[]>([]);

  useEffect(() => {
    loadWorkouts(transformWorkoutsToUI(workouts));
  }, [workouts, loadWorkouts]);

  useEffect(() => {
    setUIWorkouts(localWorkouts || []);
  }, [localWorkouts]);

  const handleCreateWorkout = useCallback(() => {
    reset();
    router.push("/workout");
  }, [reset, router]);

  const handleEditWorkout = useCallback(
    async (id: number) => {
      try {
        reset();
        const workout = await loadWorkoutWithData(id);
        loadWorkout(workout);
        router.push("/workout");
      } catch (error) {
        handleAndShowError(error);
      }
    },
    [loadWorkoutWithData, loadWorkout, reset, router],
  );

  const handleDragEnd = useCallback(
    async ({ data }: { data: UIWorkout[] }) => {
      setUIWorkouts(data); // UI inmediata
      loadWorkouts(data); // store local

      try {
        // Persistimos la nueva posición en la BD
        await Promise.all(
          data.map((w, index) =>
            updateWorkout({
              id: Number(w.id),
              name: w.name,
              position: index, // nuevo orden
            }),
          ),
        );
      } catch (error) {
        handleAndShowError(error);
        // revertimos si falla
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
      <View style={createStyles(colors).container}>
        <DraggableFlatList
          contentContainerStyle={createStyles(colors).list}
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
          ListEmptyComponent={<Text>No workouts available</Text>}
        />
        <Button
          size="icon"
          variant="default"
          onPress={handleCreateWorkout}
          style={styles.fab}
        >
          <Icon as={Plus} size={32} />
        </Button>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 24, // distancia desde el borde inferior
    right: 24, // distancia desde el borde derecho
    width: 56,
    height: 56,
    borderRadius: 28, // círculo perfecto
    justifyContent: "center",
    alignItems: "center",
    elevation: 5, // sombra en Android
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4, // sombra en iOS
  },
});

const createStyles = (colors: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      position: "relative",
      flex: 1,
      backgroundColor: colors.BACKGROUND_SECONDARY,
    },
    list: {
      padding: Sizes.PADDING_LARGE,
      gap: Spacing.LARGE,
      backgroundColor: colors.BACKGROUND_SECONDARY,
      flexGrow: 1,
      paddingBottom: 100,
    },
  });
