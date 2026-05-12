import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { type UIExercise } from "@/src/types/ui";
import { View } from "react-native";
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
    <View className="absolute inset-0 justify-center px-6">
      <View className="gap-3">
        {availableExercises?.map((ex) => {
          const isDone = idIncludes(
            ex.id,
            completedExerciseIds.map((id) => Number(id)),
          );

          return (
            <Button
              variant={"outline"}
              key={normalizeID(ex.id)}
              disabled={isDone}
              onPress={() => onSelectExercise(ex)}
              className={`${isDone && "!bg-green-700"}`}
            >
              <Text>
                {ex.name} {isDone ? "✓" : ""}
              </Text>
            </Button>
          );
        })}
      </View>
    </View>
  );
}
