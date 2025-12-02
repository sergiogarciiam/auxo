import { Button } from "@react-navigation/elements";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { ExerciseInterface } from "../types/exercise";

interface ExerciseCardProps {
  exercise: ExerciseInterface;
  index: number;
  setExercise: (index: number, exercise: ExerciseInterface) => void;
  onRemoveExercise: () => void;
}

export function ExerciseCard({
  exercise,
  index,
  setExercise,
  onRemoveExercise,
}: ExerciseCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.field}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter exercise name"
          value={exercise.name}
          onChangeText={(text) =>
            setExercise(index, { ...exercise, name: text })
          }
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Reps</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter number of reps"
          keyboardType="numeric"
          value={exercise.reps?.toString()}
          onChangeText={(text) =>
            setExercise(index, {
              ...exercise,
              reps: text === "" ? 0 : parseInt(text, 10),
            })
          }
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Time (seconds)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter time in seconds"
          keyboardType="numeric"
          value={exercise.time_seconds?.toString()}
          onChangeText={(text) =>
            setExercise(index, {
              ...exercise,
              time_seconds: text === "" ? 0 : parseInt(text, 10),
            })
          }
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Weight (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter weight"
          keyboardType="numeric"
          value={exercise.weight?.toString()}
          onChangeText={(text) =>
            setExercise(index, {
              ...exercise,
              weight: text === "" ? 0 : parseInt(text, 10),
            })
          }
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Sets (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter number of sets"
          keyboardType="numeric"
          value={exercise.sets?.toString()}
          onChangeText={(text) =>
            setExercise(index, {
              ...exercise,
              sets: text === "" ? 0 : parseInt(text, 10),
            })
          }
        />
      </View>

      <Button onPressIn={onRemoveExercise}>Remove</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    gap: 16,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#555",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fafafa",
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
  },

  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fafafa",
    borderRadius: 8,
    overflow: "hidden",
  },
});
