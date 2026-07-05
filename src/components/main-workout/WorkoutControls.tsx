import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react-native";
import { View } from "react-native";

interface WorkoutControlsProps {
  isPaused: boolean;
  remaining: number | null;
  isFirstExercise: boolean;
  isFinished: boolean;
  isLandscape?: boolean;
  onPrev: () => void;
  onTogglePause: () => void;
  onNext: () => void;
}

export function WorkoutControls({
  isPaused,
  remaining,
  isFirstExercise,
  isFinished,
  isLandscape,
  onPrev,
  onTogglePause,
  onNext,
}: WorkoutControlsProps) {
  if (isFinished) return null;

  return (
    <View
      className={`flex-row items-center justify-between ${isLandscape ? "gap-16" : "gap-6"}`}
    >
      <Button size="icon" onPress={onPrev} disabled={isFirstExercise}>
        <Icon as={ArrowLeft} />
      </Button>

      <Button
        size="icon"
        onPress={onTogglePause}
        disabled={remaining === null}
        className="z-30"
      >
        {isPaused ? <Icon as={Play} /> : <Icon as={Pause} />}
      </Button>

      <Button size="icon" onPress={onNext}>
        <Icon as={ArrowRight} />
      </Button>
    </View>
  );
}
