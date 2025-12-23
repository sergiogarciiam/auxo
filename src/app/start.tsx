import { MaterialIcons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { ThemedButton } from "../components/themed-button";
import { ThemedText } from "../components/themed-text";
import { Colors, IconColors, IconSizes, Spacing } from "../constants/theme";
import { useStartWorkoutStore } from "../stores/useStartWorkoutStore";

export default function StartWorkout() {
  const { workout, executionPlan } = useStartWorkoutStore();
  const [index, setIndex] = useState(0);

  if (!executionPlan || executionPlan.length === 0) {
    return (
      <View style={styles.container}>
        <ThemedText type="title">{workout?.name}</ThemedText>
        <ThemedText>No execution plan available</ThemedText>
      </View>
    );
  }

  const step = executionPlan[index];
  const isLast = index >= executionPlan.length - 1;
  const percent = Math.round((index / executionPlan.length) * 100);

  const handleNext = () => {
    if (!isLast) setIndex((i) => i + 1);
  };

  const handlePrev = () => {
    if (index > 0) setIndex((i) => i - 1);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: workout?.name .,
        }}
      />
      <View style={styles.container}>
        <View style={styles.progressBarWrapper}>
          <View style={styles.progressBarInner}>
            <View style={[styles.progressBarFill, { width: `${percent}%` }]}>
              {percent > 6 && (
                <ThemedText
                  style={styles.progressBarPercentInside}
                >{`${percent}%`}</ThemedText>
              )}
            </View>

            <View style={styles.progressBarRest}>
              {percent <= 6 && (
                <ThemedText
                  style={styles.progressBarPercentOutside}
                >{`${percent}%`}</ThemedText>
              )}
            </View>
          </View>
        </View>

        <ThemedText
          style={styles.progressText}
        >{`${index + 1} / ${executionPlan.length}`}</ThemedText>

        <View style={styles.stepContainer}>
          {step.type === "exercise" ? (
            <>
              <ThemedText type="title" style={styles.bigValue}>
                {step.time_seconds && step.time_seconds > 0
                  ? `${step.time_seconds}s`
                  : `${step.reps ?? "-"} reps`}
              </ThemedText>

              <ThemedText type="subtitle">{step.name}</ThemedText>
              {step.weight !== undefined && step.weight !== 0 && (
                <ThemedText>{`Weight: ${step.weight}`}</ThemedText>
              )}
              {step.set && <ThemedText>{`Set ${step.set}`}</ThemedText>}
            </>
          ) : (
            <>
              <ThemedText type="title" style={styles.bigValue}>
                {`${step.duration_seconds ?? 0}s`}
              </ThemedText>
              <ThemedText type="subtitle">{step.name || "Rest"}</ThemedText>
            </>
          )}
        </View>

        <View style={styles.controls}>
          <ThemedButton
            text="Prev"
            icon={
              <MaterialIcons
                name="chevron-left"
                size={IconSizes.MEDIUM}
                color={IconColors.ON_PRIMARY}
              />
            }
            onPress={handlePrev}
            disabled={index === 0}
          />

          <ThemedButton
            text={isLast ? "Finish" : "Next"}
            icon={
              <MaterialIcons
                name="chevron-right"
                size={IconSizes.MEDIUM}
                color={IconColors.ON_PRIMARY}
              />
            }
            onPress={isLast ? () => {} : handleNext}
          />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.LARGE,
    gap: Spacing.LARGE,
  },
  stepContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.TRIPLE_EXTRA_LARGE,
  },
  bigValue: {
    fontSize: 72,
    textAlign: "center",
    fontWeight: "bold",
    lineHeight: 86,
  },
  progressRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressBarWrapper: {
    width: "100%",
    height: 28,
    backgroundColor: "#e6e6e6",
    borderRadius: 14,
    overflow: "hidden",
    marginTop: Spacing.SMALL,
  },
  progressBarInner: {
    flex: 1,
    flexDirection: "row",
    height: "100%",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Colors.SUCCESS,
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: Spacing.MEDIUM,
  },
  progressBarRest: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
    alignItems: "flex-start",
  },
  progressBarPercentInside: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    lineHeight: 28,
    paddingRight: Spacing.MEDIUM,
  },
  progressBarPercentOutside: {
    color: "#333",
    fontWeight: "600",
    fontSize: 14,
    lineHeight: 28,
    paddingLeft: Spacing.MEDIUM,
  },
  progressText: {
    textAlign: "center",
    fontSize: 12,
    color: "#666",
    marginTop: Spacing.TINY,
  },

  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.LARGE,
  },
});
