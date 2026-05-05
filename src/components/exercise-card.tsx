import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { ArrowLeft, ArrowRight, Trash } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSettingsContext } from "../context/useSettingsContext";
import { useExerciseHandlers } from "../hooks/handlers/useExerciseHandlers";
import { useTheme } from "../hooks/useTheme";
import { UIExercise } from "../types/ui";
import { ExerciseBasicFields } from "./exercise-card/ExerciseBasicFields";
import { ExerciseComplexConfig } from "./exercise-card/ExerciseComplexConfig";
import { ExerciseSimpleConfig } from "./exercise-card/ExerciseSimpleConfig";
import { createExerciseCardStyles } from "./exercise-card/styles";

interface ExerciseCardProps {
  exercise: UIExercise;
  exerciseId: string;
  setExercise: (id: string, exercise: Partial<UIExercise>) => void;
  onRemoveExercise: () => void;
  index?: number;
  handleMovePrev?: (index: number) => void;
  handleMoveNext?: (index: number) => void;
  isDisabledPrev?: boolean;
  isDisabledNext?: boolean;
}

export function ExerciseCard({
  exercise,
  exerciseId,
  setExercise,
  onRemoveExercise,
  index,
  handleMovePrev,
  handleMoveNext,
  isDisabledPrev,
  isDisabledNext,
}: ExerciseCardProps) {
  const colors = useTheme();
  const styles = createExerciseCardStyles(colors);
  const { weightUnit } = useSettingsContext();
  const insets = useSafeAreaInsets();

  const exerciseType = exercise.exercise_type ?? "reps";
  const configType = exercise.config_type ?? "simple";

  const [activeTab, setActiveTab] = useState("set-0");

  const {
    handleInputChange,
    handleExerciseTypeChange,
    handleConfigTypeChange,
    handleSetChange,
    handleSetsChange,
  } = useExerciseHandlers({
    exercise,
    exerciseId,
    configType,
    setExercise,
  });

  // Initialize exercise defaults if not set
  useEffect(() => {
    setActiveTab("set-0");
  }, [exercise.sets, configType]);

  useEffect(() => {
    if (!exercise.exercise_type) {
      handleInputChange("exercise_type", "reps");
    }
    if (!exercise.config_type) {
      handleInputChange("config_type", "simple");
    }
  }, []);

  const contentInsets = {
    top: insets.top,
    bottom:
      Platform.select({
        ios: insets.bottom,
        android: insets.bottom + 24,
        default: insets.bottom,
      }) ?? insets.bottom,
    left: 12,
    right: 12,
  };

  const showComplexConfig = configType === "complex";

  return (
    <Card className="relative w-[320px]">
      <Button
        style={styles.removeButton}
        variant="destructive"
        onPress={onRemoveExercise}
      >
        <Icon as={Trash} />
      </Button>

      <CardContent className="flex-1 gap-3 mt-2">
        <ExerciseBasicFields
          exercise={exercise}
          exerciseType={exerciseType}
          configType={configType}
          contentInsets={contentInsets}
          onExerciseNameChange={(text) => handleInputChange("name", text)}
          onExerciseTypeChange={handleExerciseTypeChange}
          onSetsChange={handleSetsChange}
          onConfigTypeChange={handleConfigTypeChange}
        />

        {showComplexConfig ? (
          <ExerciseComplexConfig
            exercise={exercise}
            exerciseType={exerciseType}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onSetChange={handleSetChange}
          />
        ) : (
          <ExerciseSimpleConfig
            exercise={exercise}
            exerciseType={exerciseType}
            weightUnit={weightUnit}
            onFieldChange={handleInputChange}
          />
        )}
      </CardContent>

      <CardFooter className="mt-auto">
        <View style={styles.arrowsRow}>
          <Button
            variant="outline"
            style={styles.arrowButton}
            disabled={!handleMovePrev || isDisabledPrev}
            onPress={() => index !== undefined && handleMovePrev?.(index)}
          >
            <Icon as={ArrowLeft} />
          </Button>

          <Text>#{index !== undefined ? index + 1 : 0}</Text>

          <Button
            variant="outline"
            style={styles.arrowButton}
            disabled={!handleMoveNext || isDisabledNext}
            onPress={() => index !== undefined && handleMoveNext?.(index)}
          >
            <Icon as={ArrowRight} />
          </Button>
        </View>
      </CardFooter>
    </Card>
  );
}
