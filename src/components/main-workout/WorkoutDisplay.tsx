import { Text } from "@/components/ui/text";
import {
  EXERCISE_TYPES_REPS,
  EXERCISE_TYPES_TIME,
  REST_STEP_TYPE,
} from "@/src/constants/constants";
import { View } from "react-native";
import { ExecutionStep } from "../../types/ui";
import { formatTime } from "../../utils/formatTime";

interface WorkoutDisplayProps {
  step: ExecutionStep;
  remaining: number | null;
  isLandscape: boolean;
  isIdleFlexibleSelection: boolean;
}

export function WorkoutDisplay({
  step,
  remaining,
  isLandscape,
  isIdleFlexibleSelection,
}: WorkoutDisplayProps) {
  if (isLandscape) {
    return (
      <View className="items-center justify-center flex-1 gap-1">
        <Text className="text-lg font-bold" numberOfLines={1}>
          {!isIdleFlexibleSelection && step.name}
        </Text>

        <View className="h-[100px] items-center justify-center">
          {(step.type === REST_STEP_TYPE ||
            step.exercise_type === EXERCISE_TYPES_TIME) && (
            <Text className="text-4xl font-bold">
              {remaining !== null
                ? formatTime(remaining)
                : step.time_seconds
                  ? formatTime(step.time_seconds)
                  : ""}
            </Text>
          )}
          {step.exercise_type === EXERCISE_TYPES_REPS && (
            <Text className="text-4xl font-bold">
              {step.min_reps && step.max_reps
                ? `${step.min_reps} - ${step.max_reps} reps`
                : isIdleFlexibleSelection
                  ? ""
                  : ""}
            </Text>
          )}
        </View>

        {step.set && (
          <Text className="text-sm font-bold">
            Set {step.set}
            {step.totalSets ? ` / ${step.totalSets}` : ""}
          </Text>
        )}
      </View>
    );
  }

  return (
    <>
      <Text className="text-2xl font-bold text-center">
        {!isIdleFlexibleSelection && step.name}
      </Text>

      <View className="h-[140px] items-center justify-center">
        {(step.type === REST_STEP_TYPE ||
          step.exercise_type === EXERCISE_TYPES_TIME) && (
          <Text className="text-5xl font-bold text-center">
            {remaining !== null
              ? formatTime(remaining)
              : step.time_seconds
                ? formatTime(step.time_seconds)
                : isIdleFlexibleSelection
                  ? ""
                  : ""}
          </Text>
        )}
        {step.exercise_type === EXERCISE_TYPES_REPS && (
          <Text className="text-5xl font-bold text-center">
            {step.min_reps && step.max_reps
              ? `${step.min_reps} - ${step.max_reps} reps`
              : isIdleFlexibleSelection
                ? ""
                : ""}
          </Text>
        )}
      </View>

      {step.set && (
        <Text className="text-lg font-bold text-center">
          Set {step.set}
          {step.totalSets ? ` / ${step.totalSets}` : ""}
        </Text>
      )}
    </>
  );
}
