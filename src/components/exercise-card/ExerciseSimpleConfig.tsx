import { Label } from "@/components/ui/label";
import { View } from "react-native";
import { UIExercise } from "../../types/ui";
import { NumberInput } from "../number-input";
import { TimeInput } from "../time-input";

interface ExerciseSimpleConfigProps {
  exercise: UIExercise;
  exerciseType: string;
  weightUnit: string;
  onFieldChange: (field: keyof UIExercise, value: any) => void;
}

export function ExerciseSimpleConfig({
  exercise,
  exerciseType,
  weightUnit,
  onFieldChange,
}: ExerciseSimpleConfigProps) {
  return (
    <View>
      {exerciseType === "reps" ? (
        <>
          <View className="flex-row gap-4">
            <View className="flex-1">
              <Label>Min Reps</Label>
              <NumberInput
                value={exercise.min_reps ?? 0}
                step={1}
                min={0}
                max={1000}
                onChange={(v) => onFieldChange("min_reps", v)}
              />
            </View>
            <View className="flex-1">
              <Label>Max Reps</Label>
              <NumberInput
                value={exercise.max_reps ?? 0}
                step={1}
                min={0}
                max={1000}
                onChange={(v) => onFieldChange("max_reps", v)}
              />
            </View>
          </View>
          <View>
            <Label>Last Reps</Label>
            <NumberInput
              value={exercise.last_reps ?? 0}
              step={1}
              min={0}
              max={1000}
              onChange={(v) => onFieldChange("last_reps", v)}
            />
          </View>
        </>
      ) : (
        <View>
          <Label>Exercise time</Label>
          <TimeInput
            value={exercise.exercise_time}
            onChange={(v) => onFieldChange("exercise_time", v)}
          />
        </View>
      )}

      <View>
        <Label>{`Weight (${weightUnit})`}</Label>
        <NumberInput
          value={exercise.weight}
          step={2.5}
          min={0}
          max={1000}
          onChange={(v) => onFieldChange("weight", v)}
        />
      </View>

      <View>
        <Label>Rest time</Label>
        <TimeInput
          value={exercise.rest_time ?? 0}
          onChange={(v) => onFieldChange("rest_time", v)}
        />
      </View>
    </View>
  );
}
