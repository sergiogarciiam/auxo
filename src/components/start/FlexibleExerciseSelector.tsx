import { Text } from "@/components/ui/text";
import { Pressable, View } from "react-native";

interface FlexibleExerciseSelectorProps {
  availableExercises: any[];
  completedExerciseIds: string[];
  onSelectExercise: (exercise: any) => void;
}

export function FlexibleExerciseSelector({
  availableExercises,
  completedExerciseIds,
  onSelectExercise,
}: FlexibleExerciseSelectorProps) {
  return (
    <View className="absolute inset-0 justify-center px-6 bg-black/60">
      <View className="gap-3">
        {availableExercises?.map((ex: any) => {
          const isDone = completedExerciseIds.includes(String(ex.id));

          return (
            <Pressable
              key={ex.id}
              disabled={isDone}
              onPress={() => onSelectExercise(ex)}
              className={`p-4 rounded-xl ${
                isDone ? "bg-green-700" : "bg-neutral-800"
              }`}
            >
              <Text className="font-bold text-center text-white">
                {ex.name} {isDone ? "✓" : ""}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
