import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { View, useWindowDimensions } from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";

interface WorkoutFinishedProps {
  onGoHome: () => void;
}

export function WorkoutFinished({ onGoHome }: WorkoutFinishedProps) {
  const { width } = useWindowDimensions();

  return (
    <View className="items-center justify-center flex-1 gap-6">
      <ConfettiCannon count={80} origin={{ x: -10, y: 0 }} fadeOut />
      <ConfettiCannon count={80} origin={{ x: width + 10, y: 0 }} fadeOut />

      <Text className="text-2xl font-bold">Workout Completed 🎉</Text>

      <Button onPress={onGoHome}>
        <Text>Go Home</Text>
      </Button>
    </View>
  );
}
