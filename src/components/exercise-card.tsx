import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ArrowRight, Trash } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Sizes, Spacing, Typography } from "../constants/theme";
import { useSettingsContext } from "../context/useSettingsContext";
import { useTheme } from "../hooks/useTheme";
import { UIExercise } from "../types/ui";
import { NumberInput } from "./number-input";
import { TimeInput } from "./time-input";

interface ExerciseCardProps {
  exercise: UIExercise;
  exerciseId: string;
  setExercise: (index: string, exercise: Partial<UIExercise>) => void;
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
  const { weightUnit } = useSettingsContext();
  const insets = useSafeAreaInsets();

  const [exerciseType, setExerciseType] = useState(
    exercise.exercise_type || "reps",
  );
  const [configType, setConfigType] = useState(
    exercise.config_type || "simple",
  );

  const handleInputChange = useCallback(
    (field: keyof UIExercise, value: any) => {
      setExercise(exerciseId, { [field]: value });
    },
    [exerciseId, setExercise],
  );

  const handleExerciseTypeChange = useCallback(
    (option: any) => {
      const value = option?.value ?? option; // fallback por si cambia la lib
      setExerciseType(value);
      handleInputChange("exercise_type", value);
    },
    [handleInputChange],
  );

  const handleConfigTypeChange = useCallback(
    (option: any) => {
      const value = option?.value ?? option;
      setConfigType(value);
      handleInputChange("config_type", value);

      // Initialize sets_data when switching to complex
      if (value === "complex" && !exercise.sets_data) {
        const newSetsData = Array.from({ length: exercise.sets || 1 }, () => ({
          reps: exercise.reps,
          time_seconds: exercise.exercise_time,
          weight: exercise.weight,
          rest_time: exercise.rest_time,
        }));
        handleInputChange("sets_data", newSetsData);
      }

      // Clear sets_data when switching to simple
      if (value === "simple" && exercise.sets_data) {
        handleInputChange("sets_data", undefined);
      }
    },
    [exercise, handleInputChange],
  );

  useEffect(() => {
    if (exercise.exercise_type == null) {
      handleInputChange("exercise_type", "reps");
    }
    if (exercise.config_type == null) {
      handleInputChange("config_type", "simple");
    }
  }, []);

  // Actualizar estados locales cuando cambia el ejercicio
  useEffect(() => {
    setExerciseType(exercise.exercise_type || "reps");
    setConfigType(exercise.config_type || "simple");
  }, [exercise.id]);

  const handleNumericChange = (field: keyof UIExercise, value: string) => {
    const numValue =
      value === ""
        ? 0
        : value === "0" && field === "sets"
          ? 1
          : parseInt(value, 10);

    handleInputChange(field, numValue);
  };

  const handleSetChange = useCallback(
    (
      setIndex: number,
      field: "reps" | "time_seconds" | "weight" | "rest_time",
      value: number,
    ) => {
      if (!exercise.sets_data) return;

      const newSetsData = exercise.sets_data.map((set, idx) =>
        idx === setIndex ? { ...set, [field]: value } : set,
      );

      handleInputChange("sets_data", newSetsData);
    },
    [exercise.sets_data, handleInputChange],
  );

  const handleSetsChange = useCallback(
    (newSets: number) => {
      handleInputChange("sets", newSets);

      // If in complex mode, update sets_data accordingly
      if (configType === "complex") {
        const currentData = exercise.sets_data || [];
        let newSetsData;

        if (newSets > currentData.length) {
          // Add new sets with default values
          newSetsData = [
            ...currentData,
            ...Array.from({ length: newSets - currentData.length }, () => ({
              reps: exercise.reps,
              time_seconds: exercise.exercise_time,
              weight: exercise.weight,
              rest_time: exercise.rest_time,
            })),
          ];
        } else {
          // Remove extra sets
          newSetsData = currentData.slice(0, newSets);
        }

        handleInputChange("sets_data", newSetsData);
      }
    },
    [configType, exercise, handleInputChange],
  );

  const EXERCISE_OPTIONS = [
    { label: "By reps", value: "reps" },
    { label: "By time", value: "time" },
  ];

  const CONFIG_OPTIONS = [
    { label: "Simple", value: "simple" },
    { label: "Complex", value: "complex" },
  ];

  const contentInsets = {
    top: insets.top,
    bottom: Platform.select({
      ios: insets.bottom,
      android: insets.bottom + 24,
    }),
    left: 12,
    right: 12,
  };

  const selectedExerciseType = EXERCISE_OPTIONS.find(
    (opt) => opt.value === exerciseType,
  );

  const selectedConfigType = CONFIG_OPTIONS.find(
    (opt) => opt.value === configType,
  );

  const [activeTab, setActiveTab] = useState("set-0");

  return (
    <Card className="relative w-[320px]">
      <Button
        style={styles.removeButton}
        variant="destructive"
        onPress={onRemoveExercise}
      >
        <Icon as={Trash} />
      </Button>

      <CardContent className="gap-2 mt-2">
        {/* NAME */}
        <View>
          <Label>Exercise name</Label>
          <Input
            style={styles.input}
            value={exercise.name}
            onChangeText={(text) => handleInputChange("name", text)}
          />
        </View>

        {/* EXERCISE TYPE */}
        <View>
          <Label>Exercise type</Label>

          <Select
            value={selectedExerciseType}
            onValueChange={handleExerciseTypeChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select exercise type" />
            </SelectTrigger>

            <SelectContent insets={contentInsets}>
              <SelectGroup>
                <SelectLabel>Exercise type</SelectLabel>

                {EXERCISE_OPTIONS.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    label={opt.label}
                    value={opt.value}
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </View>

        {/* SETS */}
        <View>
          <Label>Sets</Label>
          <NumberInput
            value={exercise.sets}
            step={1}
            min={1}
            onChange={(v) => handleSetsChange(v)}
          />
        </View>

        {/* CONFIG TYPE */}
        <View>
          <Label>Config type</Label>

          <Select
            value={selectedConfigType}
            onValueChange={handleConfigTypeChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select config type" />
            </SelectTrigger>

            <SelectContent insets={contentInsets}>
              <SelectGroup>
                <SelectLabel>Config type</SelectLabel>

                {CONFIG_OPTIONS.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    label={opt.label}
                    value={opt.value}
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </View>

        {/* complexD */}
        {configType === "complex" && (exercise.sets || 0) > 0 ? (
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value)}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              nestedScrollEnabled
            >
              <TabsList>
                {Array.from({ length: exercise.sets || 0 }, (_, i) => (
                  <TabsTrigger key={`set-${i}`} value={`set-${i}`}>
                    <Text
                      style={{
                        color: activeTab === `set-${i}` ? "white" : "gray",
                      }}
                    >
                      Set {i + 1}
                    </Text>
                  </TabsTrigger>
                ))}
              </TabsList>
            </ScrollView>

            {Array.from({ length: exercise.sets || 0 }, (_, i) => {
              const setData = exercise.sets_data?.[i];
              const reps = setData?.reps ?? exercise.reps;
              const exerciseTs =
                setData?.time_seconds ?? exercise.exercise_time;
              const weight = setData?.weight ?? exercise.weight;
              const restTime = setData?.rest_time ?? exercise.rest_time;

              return (
                <TabsContent key={i} value={`set-${i}`} className="">
                  {exerciseType === "reps" ? (
                    <View>
                      <Label>Reps</Label>
                      <NumberInput
                        value={reps}
                        step={1}
                        min={0}
                        onChange={(v) => handleSetChange(i, "reps", v)}
                      />
                    </View>
                  ) : (
                    <View>
                      <Label>Exercise time</Label>
                      <TimeInput
                        value={exerciseTs}
                        onChange={(seconds) =>
                          handleSetChange(i, "time_seconds", seconds)
                        }
                      />
                    </View>
                  )}

                  <View>
                    <Label>Weight</Label>
                    <NumberInput
                      value={weight}
                      step={1}
                      min={0}
                      onChange={(v) => handleSetChange(i, "weight", v)}
                    />
                  </View>

                  <View>
                    <Label>Rest time</Label>
                    <TimeInput
                      value={restTime}
                      onChange={(seconds) =>
                        handleSetChange(i, "rest_time", seconds)
                      }
                    />
                  </View>
                </TabsContent>
              );
            })}
          </Tabs>
        ) : (
          <View>
            {/* REPS vs TIME */}
            {exerciseType === "reps" ? (
              <View>
                <Label>Reps</Label>
                <NumberInput
                  value={exercise.reps}
                  step={1}
                  min={0}
                  onChange={(v) => handleInputChange("reps", v)}
                />
              </View>
            ) : (
              <View>
                <Label>Exercise time</Label>
                <TimeInput
                  value={exercise.exercise_time}
                  onChange={(seconds) =>
                    handleNumericChange("exercise_time", seconds.toString())
                  }
                />
              </View>
            )}

            <View>
              <Label>{`Weight (${weightUnit})`}</Label>
              <NumberInput
                value={exercise.weight}
                step={1}
                min={0}
                onChange={(v) => handleInputChange("weight", v)}
              />
            </View>

            <View>
              <Label>Rest time</Label>
              <TimeInput
                value={exercise.rest_time || 0}
                onChange={(seconds) =>
                  handleNumericChange("rest_time", seconds.toString())
                }
              />
            </View>
          </View>
        )}
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
            <Icon as={ArrowLeft} />
          </Button>

          <Button
            style={styles.arrowButton}
            disabled={!handleMoveNext || isDisabledNext}
            onPress={() => {
              if (!handleMoveNext || index === undefined) return;
              handleMoveNext(index);
            }}
          >
            <Icon as={ArrowRight} />
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
    removeButton: {
      position: "absolute",
      top: 6,
      right: 6,
    },
  });
