import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Text } from "@/components/ui/text";
import { ScrollView, View } from "react-native";
import { UIExercise } from "../../types/ui";
import { NumberInput } from "../number-input";
import { TimeInput } from "../time-input";

interface SetTabContentProps {
  setIndex: number;
  exerciseType: string;
  setData: any;
  onSetChange: (setIndex: number, field: string, value: number) => void;
  weightUnit: string;
}

function SetTabContent({
  setIndex,
  exerciseType,
  setData,
  onSetChange,
  weightUnit,
}: SetTabContentProps) {
  return (
    <View className="gap-3">
      {exerciseType === "reps" ? (
        <>
          <View className="flex-row gap-4">
            <View className="flex-1">
              <Label>Min reps</Label>
              <NumberInput
                value={setData?.min_reps ?? 0}
                step={1}
                min={0}
                max={1000}
                padWithZeros={false}
                onChange={(v) => onSetChange(setIndex, "min_reps", v)}
              />
            </View>
            <View className="flex-1">
              <Label>Max reps</Label>
              <NumberInput
                value={setData?.max_reps ?? 0}
                step={1}
                min={0}
                max={1000}
                padWithZeros={false}
                onChange={(v) => onSetChange(setIndex, "max_reps", v)}
              />
            </View>
          </View>
          <View>
            <Label>Last reps</Label>
            <NumberInput
              value={setData?.last_reps ?? 0}
              step={1}
              min={0}
              max={1000}
              padWithZeros={false}
              onChange={(v) => onSetChange(setIndex, "last_reps", v)}
            />
          </View>
        </>
      ) : (
        <View>
          <Label>Exercise time</Label>
          <TimeInput
            value={setData?.time_seconds ?? 0}
            onChange={(v) => onSetChange(setIndex, "time_seconds", v)}
          />
        </View>
      )}

      <View>
        <Label>{`Weight (${weightUnit})`}</Label>
        <NumberInput
          value={setData?.weight ?? 0}
          step={2.5}
          min={0}
          max={1000}
          padWithZeros={false}
          onChange={(v) => onSetChange(setIndex, "weight", v)}
        />
      </View>

      <View>
        <Label>Rest time</Label>
        <TimeInput
          value={setData?.rest_time ?? 0}
          onChange={(v) => onSetChange(setIndex, "rest_time", v)}
        />
      </View>
    </View>
  );
}

interface ExerciseComplexConfigProps {
  exercise: UIExercise;
  exerciseType: string;
  activeTab: string;
  onTabChange: (value: string) => void;
  onSetChange: (setIndex: number, field: string, value: number) => void;
  weightUnit: string;
}

export function ExerciseComplexConfig({
  exercise,
  exerciseType,
  activeTab,
  onTabChange,
  onSetChange,
  weightUnit,
}: ExerciseComplexConfigProps) {
  const numSets = exercise.sets || 0;

  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TabsList>
          {Array.from({ length: numSets }, (_, i) => (
            <TabsTrigger key={i} value={`set-${i}`}>
              <Text>Set {i + 1}</Text>
            </TabsTrigger>
          ))}
        </TabsList>
      </ScrollView>

      {Array.from({ length: numSets }, (_, i) => {
        const setData = exercise.sets_data?.[i];
        return (
          <TabsContent key={i} value={`set-${i}`}>
            <SetTabContent
              setIndex={i}
              exerciseType={exerciseType}
              setData={setData}
              onSetChange={onSetChange}
              weightUnit={weightUnit}
            />
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
