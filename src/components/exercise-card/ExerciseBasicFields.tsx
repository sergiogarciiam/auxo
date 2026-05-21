import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { View } from "react-native";
import { UIExercise } from "../../types/ui";
import { NumberInput } from "../number-input";

interface ExerciseBasicFieldsProps {
  exercise: UIExercise;
  exerciseType: string;
  configType: string;
  contentInsets: { top: number; bottom: number; left: number; right: number };
  onExerciseNameChange: (text: string) => void;
  onExerciseTypeChange: (option: any) => void;
  onSetsChange: (value: number) => void;
  onConfigTypeChange: (option: any) => void;
}

const EXERCISE_OPTIONS = [
  { label: "By reps", value: "reps" },
  { label: "By time", value: "time" },
];

const CONFIG_OPTIONS = [
  { label: "Simple", value: "simple" },
  { label: "Complex", value: "complex" },
];

export function ExerciseBasicFields({
  exercise,
  exerciseType,
  configType,
  contentInsets,
  onExerciseNameChange,
  onExerciseTypeChange,
  onSetsChange,
  onConfigTypeChange,
}: ExerciseBasicFieldsProps) {
  const selectedExerciseType = EXERCISE_OPTIONS.find(
    (x) => x.value === exerciseType,
  );
  const selectedConfigType = CONFIG_OPTIONS.find((x) => x.value === configType);

  return (
    <>
      <View>
        <Label>Exercise name</Label>
        <Input value={exercise.name} onChangeText={onExerciseNameChange} />
      </View>

      <View>
        <Label>Exercise type</Label>
        <Select
          value={selectedExerciseType}
          onValueChange={onExerciseTypeChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent insets={contentInsets}>
            <SelectGroup>
              <SelectLabel>Exercise type</SelectLabel>
              {EXERCISE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} label={opt.label} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </View>

      <View>
        <Label>Sets</Label>
        <NumberInput
          value={exercise.sets}
          step={1}
          min={1}
          max={20}
          padWithZeros={false}
          onChange={onSetsChange}
        />
      </View>

      <View>
        <Label>Config type</Label>
        <Select value={selectedConfigType} onValueChange={onConfigTypeChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select config" />
          </SelectTrigger>
          <SelectContent insets={contentInsets}>
            <SelectGroup>
              <SelectLabel>Config type</SelectLabel>
              {CONFIG_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} label={opt.label} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </View>
    </>
  );
}
