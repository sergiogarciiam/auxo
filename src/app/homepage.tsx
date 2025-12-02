import { Button } from "@react-navigation/elements";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Card } from "../components/card";
import { ThemedText } from "../components/themed-text";
import { useSections } from "../hooks/useSections";
import { useWorkouts } from "../hooks/useWorkouts";
import { useNewWorkoutStore } from "../stores/useNewWorkoutStore";

export default function Homepage() {
  const router = useRouter();
  const { workouts } = useWorkouts();
  const { sections } = useSections();
  const { reset, setWorkoutId, setName } = useNewWorkoutStore();

  const onCreateWorkout = () => {
    reset();
    setWorkoutId(null);
    setName("");
    router.push("/workout");
  };

  const onEditWorkout = (id: number) => {
    reset();
    setWorkoutId(id);
    router.push("/workout");
  };

  return (
    <View style={styles.container}>
      <ThemedText type="title">Your Workouts</ThemedText>

      {workouts.length > 0 ? (
        workouts.map((workout) => (
          <Card
            key={workout.id}
            onEdit={() => onEditWorkout(workout.id)}
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
