import { Text } from "@/components/ui/text";
import { View } from "react-native";

interface WorkoutProgressBarProps {
  percent: number;
}

export function WorkoutProgressBar({ percent }: WorkoutProgressBarProps) {
  return (
    <View className="w-full h-5 overflow-hidden rounded-full bg-neutral-700">
      <View
        className="items-end justify-center h-full pr-3 bg-green-500"
        style={{ width: `${percent}%` }}
      >
        {percent > 5 && <Text className="font-bold">{percent}%</Text>}
      </View>
    </View>
  );
}
