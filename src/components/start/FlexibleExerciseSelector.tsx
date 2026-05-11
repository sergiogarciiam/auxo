import { Text } from "@/components/ui/text";
import { type UIExercise } from "@/src/types/ui";
import { Pressable, View } from "react-native";
import { idIncludes, normalizeID } from "../../utils/idUtils";

interface FlexibleExerciseSelectorProps {
  availableExercises: UIExercise[];
  completedExerciseIds: string[];
  onSelectExercise: (exercise: UIExercise) => void;
}

export function FlexibleExerciseSelector({
  availableExercises,
  completedExerciseIds,
  onSelectExercise,
}: FlexibleExerciseSelectorProps) {
  return (
    <View className="absolute inset-0 justify-center px-6 bg-black/60">
      <View className="gap-3">
        {availableExercises?.map((ex) => {
          const isDone = idIncludes(
            ex.id,
            completedExerciseIds.map((id) => Number(id)),
          );

          return (
            <Pressable
              key={normalizeID(ex.id)}
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
