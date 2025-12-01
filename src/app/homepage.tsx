import { Button } from "@react-navigation/elements";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Card } from "../components/card";
import { ThemedText } from "../components/themed-text";
import { useSections } from "../hooks/useSections";
import { useWorkouts } from "../hooks/useWorkouts";

export default function Homepage() {
  const router = useRouter();
  const { workouts } = useWorkouts();
  const { sections } = useSections();

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
          <Card
            key={workout.id}
            onEdit={() => accessWorkout(workout.id)}
            text={workout.name}
          ></Card>
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
      <ThemedText type="subtitle">Your Sections</ThemedText>
      {sections.length > 0 ? (
        sections.map((section) => (
          <Card key={section.id} text={section.name}></Card>
        ))
      ) : (
        <ThemedText>No sections yet</ThemedText>
      )}
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
