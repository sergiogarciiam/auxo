import { Button } from "@react-navigation/elements";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "../components/themed-text";
import { useWorkouts } from "../hooks/useWorkouts";

export default function Homepage() {
  const router = useRouter();
  const { workouts } = useWorkouts();

  const accessWorkout = (id: number) => {
    router.navigate({
      pathname: "/workout",
      params: { id: id.toString() },
    });
  };

  return (
    <View style={styles.container}>
      <ThemedText type="title">Your Workouts</ThemedText>
      {workouts.length > 0 ? (
        workouts.map((workout) => (
          <ThemedText
            key={workout.id}
            onPress={() => accessWorkout(workout.id)}
          >
            {workout.name}
          </ThemedText>
        ))
      ) : (
        <ThemedText>No workouts yet</ThemedText>
      )}
      <Button
        onPressIn={() => router.navigate("/workout")}
        style={styles.button}
      >
        Create
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  button: {
    alignSelf: "flex-end",
  },
});
