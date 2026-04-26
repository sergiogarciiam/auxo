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
import { Text } from "@/components/ui/text";
import { ArrowLeft, ArrowRight, Trash } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
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
  const styles = createStyles(colors);
  const { weightUnit } = useSettingsContext();
  const insets = useSafeAreaInsets();

  // 🔥 SIN useState local desincronizado
  const exerciseType = exercise.exercise_type ?? "reps";
  const configType = exercise.config_type ?? "simple";

  const [activeTab, setActiveTab] = useState("set-0");

  useEffect(() => {
    setActiveTab("set-0");
  }, [exercise.sets, configType]);

  const handleInputChange = useCallback(
    (field: keyof UIExercise, value: any) => {
      setExercise(exerciseId, { [field]: value });
    },
    [exerciseId, setExercise],
  );

  const handleExerciseTypeChange = useCallback(
    (option: any) => {
      const value = option?.value ?? option;
      handleInputChange("exercise_type", value);
    },
    [handleInputChange],
  );

  const handleConfigTypeChange = useCallback(
    (option: any) => {
      const value = option?.value ?? option;

      handleInputChange("config_type", value);

      if (value === "complex") {
        const sets = exercise.sets || 1;

        const setsData = Array.from({ length: sets }, () => ({
          min_reps: exercise.min_reps ?? 0,
          max_reps: exercise.max_reps ?? 0,
          last_reps: exercise.last_reps ?? 0,
          time_seconds: exercise.exercise_time ?? 0,
          weight: exercise.weight ?? 0,
          rest_time: exercise.rest_time ?? 0,
        }));

        handleInputChange("sets_data", setsData);
      }

      if (value === "simple") {
        handleInputChange("sets_data", undefined);
      }
    },
    [exercise, handleInputChange],
  );

  useEffect(() => {
    if (!exercise.exercise_type) {
      handleInputChange("exercise_type", "reps");
    }

    if (!exercise.config_type) {
      handleInputChange("config_type", "simple");
    }
  }, []);

  const handleSetChange = useCallback(
    (setIndex: number, field: string, value: number) => {
      const current = exercise.sets_data || [];

      const updated = current.map((set, i) =>
        i === setIndex ? { ...set, [field]: value } : set,
      );

      handleInputChange("sets_data", updated);
    },
    [exercise.sets_data, handleInputChange],
  );

  const handleSetsChange = useCallback(
    (newSets: number) => {
      handleInputChange("sets", newSets);

      if (configType !== "complex") return;

      const current = exercise.sets_data || [];

      let updated = [...current];

      if (newSets > current.length) {
        updated = [
          ...current,
          ...Array.from({ length: newSets - current.length }, () => ({
            min_reps: exercise.min_reps ?? 0,
            max_reps: exercise.max_reps ?? 0,
            last_reps: exercise.last_reps ?? 0,
            time_seconds: exercise.exercise_time ?? 0,
            weight: exercise.weight ?? 0,
            rest_time: exercise.rest_time ?? 0,
          })),
        ];
      } else {
        updated = current.slice(0, newSets);
      }

      handleInputChange("sets_data", updated);
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
    (x) => x.value === exerciseType,
  );

  const selectedConfigType = CONFIG_OPTIONS.find((x) => x.value === configType);

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
        <View>
          <Label>Exercise name</Label>
          <Input
            style={styles.input}
            value={exercise.name}
            onChangeText={(text) => handleInputChange("name", text)}
          />
        </View>

        <View>
          <Label>Exercise type</Label>

          <Select
            value={selectedExerciseType}
            onValueChange={handleExerciseTypeChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select type" />
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

        <View>
          <Label>Sets</Label>

          <NumberInput
            value={exercise.sets}
            step={1}
            min={1}
            onChange={handleSetsChange}
          />
        </View>

        <View>
          <Label>Config type</Label>

          <Select
            value={selectedConfigType}
            onValueChange={handleConfigTypeChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select config" />
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

        {/* COMPLEX */}
        {configType === "complex" ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TabsList>
                {Array.from({ length: exercise.sets || 0 }, (_, i) => (
                  <TabsTrigger key={i} value={`set-${i}`}>
                    <Text>Set {i + 1}</Text>
                  </TabsTrigger>
                ))}
              </TabsList>
            </ScrollView>

            {Array.from({ length: exercise.sets || 0 }, (_, i) => {
              const setData = exercise.sets_data?.[i];

              return (
                <TabsContent key={i} value={`set-${i}`} className="gap-3">
                  {exerciseType === "reps" ? (
                    <>
                      <View className="flex-row gap-4">
                        <View className="flex-1">
                          <Label>Min Reps</Label>
                          <NumberInput
                            value={setData?.min_reps ?? 0}
                            step={1}
                            min={0}
                            onChange={(v) => handleSetChange(i, "min_reps", v)}
                          />
                        </View>
                        <View className="flex-1">
                          <Label>Max Reps</Label>
                          <NumberInput
                            value={setData?.max_reps ?? 0}
                            step={1}
                            min={0}
                            onChange={(v) => handleSetChange(i, "max_reps", v)}
                          />
                        </View>
                      </View>
                      <View>
                        <Label>Last Reps</Label>
                        <NumberInput
                          value={setData?.last_reps ?? 0}
                          step={1}
                          min={0}
                          onChange={(v) => handleSetChange(i, "last_reps", v)}
                        />
                      </View>
                    </>
                  ) : (
                    <View>
                      <Label>Exercise time</Label>
                      <TimeInput
                        value={setData?.time_seconds ?? 0}
                        onChange={(v) => handleSetChange(i, "time_seconds", v)}
                      />
                    </View>
                  )}

                  <View>
                    <Label>Weight</Label>
                    <NumberInput
                      value={setData?.weight ?? 0}
                      step={1}
                      min={0}
                      onChange={(v) => handleSetChange(i, "weight", v)}
                    />
                  </View>
                  <View>
                    <Label>Rest time</Label>
                    <TimeInput
                      value={setData?.rest_time ?? 0}
                      onChange={(v) => handleSetChange(i, "rest_time", v)}
                    />
                  </View>
                </TabsContent>
              );
            })}
          </Tabs>
        ) : (
          <View>
            {exerciseType === "reps" ? (
              <>
                <View className="flex-row gap-4">
                  <View className="flex-1">
                    <Label>Min Reps</Label>
                    <NumberInput
                      value={exercise.min_reps ?? 0}
                      step={1}
                      min={0}
                      onChange={(v) => handleInputChange("min_reps", v)}
                    />
                  </View>
                  <View className="flex-1">
                    <Label>Max Reps</Label>
                    <NumberInput
                      value={exercise.max_reps ?? 0}
                      step={1}
                      min={0}
                      onChange={(v) => handleInputChange("max_reps", v)}
                    />
                  </View>
                </View>
                <Label>Last Reps</Label>
                <NumberInput
                  value={exercise.last_reps ?? 0}
                  step={1}
                  min={0}
                  onChange={(v) => handleInputChange("last_reps", v)}
                />
              </>
            ) : (
              <>
                <Label>Exercise time</Label>
                <TimeInput
                  value={exercise.exercise_time}
                  onChange={(v) => handleInputChange("exercise_time", v)}
                />
              </>
            )}

            <Label>{`Weight (${weightUnit})`}</Label>
            <NumberInput
              value={exercise.weight}
              step={1}
              min={0}
              onChange={(v) => handleInputChange("weight", v)}
            />

            <Label>Rest time</Label>
            <TimeInput
              value={exercise.rest_time ?? 0}
              onChange={(v) => handleInputChange("rest_time", v)}
            />
          </View>
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
      alignItems: "center",
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
