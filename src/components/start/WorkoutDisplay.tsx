import { Text } from "@/components/ui/text";
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
  return (
    <>
      <Text className="text-2xl font-bold text-center">
        {!isIdleFlexibleSelection && step.name}
      </Text>

      <View className="h-[140px] items-center justify-center">
        <Text className="text-5xl font-bold text-center">
          {remaining !== null
            ? formatTime(remaining)
            : step.time_seconds
              ? formatTime(step.time_seconds)
              : step.min_reps && step.max_reps
                ? `${step.min_reps} - ${step.max_reps} reps`
                : isIdleFlexibleSelection
                  ? ""
                  : ""}
        </Text>
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
