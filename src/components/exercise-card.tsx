import { StyleSheet, TextInput, View } from "react-native";
import { Colors, Sizes, Spacing, Typography } from "../constants/theme";
import { UIExercise } from "../types/ui";
import { Field } from "./field";
import { ThemedButton } from "./themed-button";

interface ExerciseCardProps {
  exercise: UIExercise;
  exerciseId: number | string;
  setExercise: (index: number | string, exercise: Partial<UIExercise>) => void;
  onRemoveExercise: () => void;
}

/**
 * Card component for editing individual exercise details
 */
export function ExerciseCard({
  exercise,
  exerciseId,
  setExercise,
  onRemoveExercise,
}: ExerciseCardProps) {
  const handleInputChange = (field: keyof UIExercise, value: any) => {
    // Send only the changed field to avoid accidental overwrites
    setExercise(exerciseId, { [field]: value });
  };

  const handleNumericChange = (field: keyof UIExercise, value: string) => {
    const numValue = value === "" ? 0 : parseInt(value, 10);
    handleInputChange(field, numValue);
  };

  return (
    <View style={styles.card}>
      <Field label="Name" required>
        <TextInput
          style={styles.input}
          value={exercise.name}
          onChangeText={(text) => handleInputChange("name", text)}
        />
      </Field>

      <Field label="Reps">
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={exercise.reps.toString()}
          onChangeText={(text) => handleNumericChange("reps", text)}
        />
      </Field>

      <Field label="Time (seconds)">
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={exercise.time_seconds.toString()}
          onChangeText={(text) => handleNumericChange("time_seconds", text)}
        />
      </Field>

      <Field label="Weight (optional)">
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={exercise.weight.toString()}
          onChangeText={(text) => handleNumericChange("weight", text)}
        />
      </Field>

      <Field label="Sets" required>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={exercise.sets.toString()}
          onChangeText={(text) => handleNumericChange("sets", text)}
        />
      </Field>

      <ThemedButton
        text="Remove"
        onPress={onRemoveExercise}
        variant="destructive"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Sizes.PADDING_LARGE,
    backgroundColor: Colors.BACKGROUND,
    borderRadius: Sizes.BORDER_RADIUS_LARGE,
    marginBottom: Spacing.DOUBLE_EXTRA_LARGE,
    borderWidth: Sizes.BORDER_WIDTH,
    borderColor: Colors.BORDER,
    shadowColor: "#000",
    shadowOpacity: Sizes.SHADOW_OPACITY,
    shadowRadius: Sizes.SHADOW_RADIUS_LARGE,
    elevation: Sizes.ELEVATION,
    gap: Spacing.DOUBLE_EXTRA_LARGE,
  },
  input: {
    borderWidth: Sizes.BORDER_WIDTH,
    borderColor: Colors.BORDER,
    backgroundColor: Colors.LIGHT_BACKGROUND,
    borderRadius: Sizes.BORDER_RADIUS,
    padding: Sizes.PADDING,
    fontSize: Typography.FONT_SIZE_DEFAULT,
  },
});
