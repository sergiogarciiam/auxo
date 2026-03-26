import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, Trash } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { Sizes, Spacing, Typography } from "../constants/theme";
import { useSettingsContext } from "../context/useSettingsContext";
import { useTheme } from "../hooks/useTheme";
import { UIExercise } from "../types/ui";
import { NumberInput } from "./number-input";
import { TimeInput } from "./time-input";

interface ExerciseCardProps {
  exercise: UIExercise;
  exerciseId: number | string;
  setExercise: (index: number | string, exercise: Partial<UIExercise>) => void;
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
  const styles = createStyles(colors);
  const handleInputChange = (field: keyof UIExercise, value: any) => {
    setExercise(exerciseId, { [field]: value });
  };

  const { weightUnit } = useSettingsContext();

  const handleNumericChange = (field: keyof UIExercise, value: string) => {
    const numValue =
      value === ""
        ? 0
        : value === "0" && field === "sets"
          ? "1"
          : parseInt(value, 10);
    handleInputChange(field, numValue);
  };

  return (
    <Card className="relative w-[320px]">
      <Button
        style={styles.removeButton}
        variant="destructive"
        onPress={onRemoveExercise}
      >
        <Icon as={Trash}></Icon>
      </Button>
      <CardContent className="gap-2 mt-2">
        <View>
          <Label>Exercise name</Label>
          <Input
            style={styles.input}
            value={exercise.name}
            onChangeText={(text) => handleInputChange("name", text)}
          />
        </View>
        <View>
          <Label>Sets</Label>
          <NumberInput
            value={exercise.sets}
            step={1}
            min={1}
            onChange={(v) => handleInputChange("sets", v)}
          />
        </View>

        <View style={styles.filedsContainer}>
          <View className="flex-1">
            <Label>Reps</Label>
            <NumberInput
              value={exercise.reps}
              step={1}
              min={0}
              onChange={(v) => handleInputChange("reps", v)}
            />
          </View>
          <View className="flex-1">
            <Label>{`Weight (${weightUnit})`} </Label>
            <NumberInput
              value={exercise.weight}
              step={1}
              min={0}
              onChange={(v) => handleInputChange("weight", v)}
            />
          </View>
        </View>
        <View>
          <Label>Exercise time</Label>
          <TimeInput
            value={exercise.time_seconds}
            onChange={(seconds) =>
              handleNumericChange("time_seconds", seconds.toString())
            }
          />
        </View>
      </CardContent>
      <CardFooter>
        <View style={styles.arrowsRow}>
          <Button
            style={styles.arrowButton}
            disabled={!handleMovePrev || isDisabledPrev}
            onPress={() => {
              if (!handleMovePrev || index === undefined) return;
              handleMovePrev(index);
            }}
          >
            <Icon as={ArrowLeft}></Icon>
          </Button>
          <Button
            style={styles.arrowButton}
            disabled={!handleMoveNext || isDisabledNext}
            onPress={() => {
              if (!handleMoveNext || index === undefined) return;
              handleMoveNext(index);
            }}
          >
            <Icon as={ArrowRight}></Icon>
          </Button>
        </View>
      </CardFooter>
    </Card>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    input: {
      borderWidth: Sizes.BORDER_WIDTH,
      borderColor: colors.BORDER,
      backgroundColor: colors.LIGHT_BACKGROUND,
      borderRadius: Sizes.BORDER_RADIUS,
      padding: Sizes.PADDING,
      fontSize: Typography.FONT_SIZE_DEFAULT,
      color: colors.TEXT_PRIMARY,
    },
    arrowsRow: {
      width: "100%",
      flexDirection: "row",
      justifyContent: "space-between",
      gap: Spacing.MEDIUM,
    },
    arrowButton: {
      flex: 1,
      borderRadius: Sizes.BORDER_RADIUS,
      justifyContent: "center",
      alignItems: "center",
    },
    filedsContainer: {
      flexDirection: "row",
      gap: Spacing.DOUBLE_EXTRA_LARGE,
    },
    removeButton: {
      position: "absolute",
      top: 6,
      right: 6,
    },
  });
