import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, TextInput, View } from "react-native";
import {
  Colors,
  IconColors,
  IconSizes,
  Sizes,
  Spacing,
  Typography,
} from "../constants/theme";
import { UIExercise } from "../types/ui";
import { Field } from "./field";
import { ThemedButton } from "./themed-button";
import { TimeInput } from "./time-input";

interface ExerciseCardProps {
  exercise: UIExercise;
  exerciseId: number | string;
  setExercise: (index: number | string, exercise: Partial<UIExercise>) => void;
  onRemoveExercise: () => void;
  index?: number;
  handleMovePrev?: (index: number) => void;
  handleMoveNext?: (index: number) => void;
  isDisabledPrev?: boolean;
  isDisabledNext?: boolean;
}

/**
 * Card component for editing individual exercise details
 */
export function ExerciseCard({
  exercise,
  exerciseId,
  setExercise,
  onRemoveExercise,
  index,
  handleMovePrev,
  handleMoveNext,
  isDisabledPrev,
  isDisabledNext,
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

      <Field label="Time">
        <TimeInput
          value={exercise.time_seconds}
          onChange={(seconds) =>
            handleNumericChange("time_seconds", seconds.toString())
          }
        />
      </Field>

      <Field label="Weight">
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
        icon={
          <MaterialIcons
            name="delete"
            size={IconSizes.SMALL}
            color={IconColors.ON_PRIMARY}
          />
        }
        onPress={onRemoveExercise}
        variant="destructive"
      />

      <View style={styles.arrowsRow}>
        <ThemedButton
          icon={
            <MaterialIcons
              name="chevron-left"
              size={IconSizes.MEDIUM}
              color={IconColors.ON_PRIMARY}
            />
          }
          variant="icon"
          disabled={!handleMovePrev || isDisabledPrev}
          onPress={() => {
            if (!handleMovePrev || index === undefined) return;
            handleMovePrev(index);
          }}
        />

        <ThemedButton
          icon={
            <MaterialIcons
              name="chevron-right"
              size={IconSizes.MEDIUM}
              color={IconColors.ON_PRIMARY}
            />
          }
          variant="icon"
          disabled={!handleMoveNext || isDisabledNext}
          onPress={() => {
            if (!handleMoveNext || index === undefined) return;
            handleMoveNext(index);
          }}
        />
      </View>
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
  arrowsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.MEDIUM,
  },
});
