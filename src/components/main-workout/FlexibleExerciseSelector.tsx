import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { type UIExercise } from "@/src/types/ui";
import { ScrollView, View } from "react-native";
import { idIncludes, normalizeID } from "../../utils/idUtils";

interface FlexibleExerciseSelectorProps {
  availableExercises: UIExercise[];
  completedExerciseIds: string[];
  onSelectExercise: (exercise: UIExercise) => void;
  isLandscape: boolean;
}

export function FlexibleExerciseSelector({
  availableExercises,
  completedExerciseIds,
  onSelectExercise,
  isLandscape,
}: FlexibleExerciseSelectorProps) {
  return (
    <View className="flex-1">
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          ...(isLandscape
            ? {}
            : { justifyContent: "center", paddingVertical: 20 }),
        }}
      >
        <View
          className={`gap-3 ${isLandscape ? "flex-row flex-wrap justify-center" : ""}`}
        >
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
                className={`${isDone && "!bg-green-700"} ${isLandscape ? "w-[48%]" : ""}`}
              >
                <Text>
                  {ex.name} {isDone ? "✓" : ""}
                </Text>
              </Button>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
