import { Button } from "@react-navigation/elements";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Card } from "../components/card";
import { ThemedText } from "../components/themed-text";
import { useSections } from "../hooks/useSections";
import { useWorkouts } from "../hooks/useWorkouts";
import { useWorkoutStore } from "../stores/useWorkoutStore";

export default function Homepage() {
  const router = useRouter();
  const { workouts, getWorkoutById, getAllSections } = useWorkouts();
  const { sections } = useSections();
  const { loadWorkout, reset } = useWorkoutStore();

  const onCreateWorkout = () => {
    reset();
    router.push("/workout");
  };

  const onEditWorkout = async (id: number) => {
    reset();
    const workoutFromDb = await getWorkoutById({
      id,
    });
    const sectionsFromDb = await getAllSections({ id });
    const workoutState = {
      ...workoutFromDb,
      sections: sectionsFromDb,
      localStatus: "updated",
    };
    loadWorkout(workoutState);
    router.push(`/workout`);
  };

  return (
    <View style={styles.container}>
      <ThemedText type="title">Your Workouts</ThemedText>

      {workouts.filter(Boolean).length > 0 ? (
        workouts
          .filter(Boolean)
          .map((workout, index) => (
            <Card
              key={workout.id || `tmp-${index}`}
              onEdit={() => workout.id && onEditWorkout(workout.id)}
              text={workout.name}
            />
          ))
      ) : (
        <ThemedText>No workouts yet</ThemedText>
      )}

      <ThemedText type="subtitle">Sections</ThemedText>
      {sections.length > 0 &&
        sections.map((section) => (
          <Card key={section.id} text={section.name} />
        ))}

      <Button onPressIn={onCreateWorkout} style={styles.button}>
        Create Workout
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 12,
  },
  button: {
    alignSelf: "flex-end",
  },
});
