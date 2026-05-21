import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { Minus, Plus } from "lucide-react-native";
import { View } from "react-native";

interface RepsWeightAdjustmentProps {
  liveReps: number | null;
  liveWeight: number | null;
  weightUnit: string;
  showReps: boolean;
  showWeight: boolean;
  onRepsChange: (reps: number) => void;
  onWeightChange: (weight: number) => void;
}

export function RepsWeightAdjustment({
  liveReps,
  liveWeight,
  weightUnit,
  showReps,
  showWeight,
  onRepsChange,
  onWeightChange,
}: RepsWeightAdjustmentProps) {
  return (
    <View className="gap-4">
      {showReps && liveReps !== null && (
        <View className="flex-row items-center gap-4">
          <Button
            size="icon"
            variant="outline"
            onPress={() => onRepsChange(Math.max(0, liveReps - 1))}
          >
            <Icon as={Minus} />
          </Button>

          <Text className="text-2xl font-bold text-center w-28">
            {liveReps} reps
          </Text>

          <Button
            size="icon"
            variant="outline"
            onPress={() => onRepsChange(liveReps + 1)}
          >
            <Icon as={Plus} />
          </Button>
        </View>
      )}

      {showWeight && liveWeight !== null && (
        <View className="flex-row items-center gap-4">
          <Button
            size="icon"
            variant="outline"
            onPress={() =>
              onWeightChange(Math.max(0, Number((liveWeight - 2.5).toFixed(1))))
            }
          >
            <Icon as={Minus} />
          </Button>

          <Text className="text-2xl font-bold text-center w-28">
            {liveWeight} {weightUnit}
          </Text>

          <Button
            size="icon"
            variant="outline"
            onPress={() =>
              onWeightChange(Number((liveWeight + 2.5).toFixed(1)))
            }
          >
            <Icon as={Plus} />
          </Button>
        </View>
      )}
    </View>
  );
}
