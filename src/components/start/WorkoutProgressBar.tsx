import { Text } from "@/components/ui/text";
import { useTheme } from "@/src/hooks/other/useTheme";
import { View } from "react-native";

interface WorkoutProgressBarProps {
  percent: number;
}

export function WorkoutProgressBar({ percent }: WorkoutProgressBarProps) {
  const theme = useTheme();
  return (
    <View
      className="w-full h-5 overflow-hidden rounded-full"
      style={{ backgroundColor: theme.border }}
    >
      <View
        className="items-end justify-center h-full pr-3 bg-green-500"
        style={{ width: `${percent}%` }}
      >
        {percent > 5 && (
          <Text className="font-bold text-white">{percent}%</Text>
        )}
      </View>
    </View>
  );
}
