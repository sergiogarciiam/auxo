import { MaterialIcons } from "@expo/vector-icons";
import { useAudioPlayer } from "expo-audio";
import { Stack, useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

import { ThemedButton } from "../components/themed-button";
import { ThemedText } from "../components/themed-text";
import { Colors, IconColors, IconSizes, Spacing } from "../constants/theme";
import { usePauseTimer } from "../hooks/start/usePauseTimer";
import { useStartTimer } from "../hooks/start/useStartTimer";
import { useStartWorkoutStore } from "../stores/useStartWorkoutStore";
import { formatTime } from "../utils/formatTime";

const beep = require("../../assets/beep.wav");
const doubleBeep = require("../../assets/double-beep.wav");

export default function StartWorkout() {
  const router = useRouter();
  const beepPlayer = useAudioPlayer(beep);
  const doubleBeepPlayer = useAudioPlayer(doubleBeep);

  const { workout, executionPlan, stopWorkout } = useStartWorkoutStore();

  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const timerRef = useRef<number | null>(null);

  const startTimer = (seconds: number) => {
    clearTimer();
    setRemaining(seconds);

    timerRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev === null) return null;

        if (prev <= 4 && prev > 1) {
          beepPlayer.seekTo(0);
          beepPlayer.play();
        }

        if (prev <= 1) {
          doubleBeepPlayer.seekTo(0);
          doubleBeepPlayer.play();
          clearTimer();

          setTimeout(() => {
            if (!isLast) setIndex((i) => i + 1);
          }, 200);

          return 0;
        }

        return prev - 1;
      });
    }, 1000) as unknown as number;
  };

  const clearTimer = () => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current as unknown as number);
      timerRef.current = null;
    }
  };

  const handleNext = () => {
    clearTimer();
    setRemaining(null);
    setIsPaused(false);
    if (!isLast) setIndex((i) => i + 1);
  };

  const handlePrev = () => {
    clearTimer();
    setRemaining(null);
    setIsPaused(false);
    if (index > 0) setIndex((i) => i - 1);
  };

  const handleExit = () => {
    Alert.alert(
      "Exit workout?",
      "Are you sure you want to exit this workout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Exit",
          style: "destructive",
          onPress: () => {
            clearTimer();
            stopWorkout();
            router.replace("/");
          },
        },
      ],
    );
  };

  // Start timer when step changes
  useStartTimer(
    executionPlan?.[index],
    startTimer,
    setRemaining,
    isPaused,
    clearTimer,
    index,
  );

  // Pause / Resume timer
  usePauseTimer(isPaused, clearTimer, startTimer, remaining);

  const step = executionPlan?.[index];

  if (!workout || !executionPlan || !step || executionPlan.length === 0) {
    return (
      <View style={styles.container}>
        <ThemedText>No execution plan available</ThemedText>
      </View>
    );
  }

  const isLast = index >= executionPlan.length - 1;

  const percent = isFinished
    ? 100
    : Math.round(((index + 1) / executionPlan.length) * 100);

  const showReps =
    step.time_seconds !== undefined &&
    step.time_seconds > 0 &&
    step.reps !== undefined &&
    step.reps > 0;

  const showWeight = step.weight !== undefined && step.weight > 0;

  return (
    <>
      <Stack.Screen
        options={{
          title: workout.name,
          headerRight: () => (
            <ThemedButton
              text="Exit"
              variant="destructive"
              onPress={handleExit}
            />
          ),
        }}
      />

      <View style={styles.container}>
        <View style={styles.progressBarWrapper}>
          <View style={[styles.progressBarFill, { width: `${percent}%` }]}>
            {percent > 10 && (
              <ThemedText style={styles.progressTextInside}>
                {percent}%
              </ThemedText>
            )}
          </View>
        </View>

        <View style={styles.stepContainer}>
          {isFinished ? (
            <>
              <ThemedText type="title" style={styles.bigValue}>
                Workout completed!
              </ThemedText>
              <ThemedText type="subtitle">{workout.name}</ThemedText>
            </>
          ) : (
            <>
              <ThemedText type="subtitle">{step.name}</ThemedText>

              <ThemedText type="title" style={styles.bigValue}>
                {remaining !== null
                  ? formatTime(remaining)
                  : step.time_seconds
                    ? formatTime(step.time_seconds)
                    : step.reps
                      ? `x${step.reps}`
                      : "-"}
              </ThemedText>

              {showReps && (
                <ThemedText type="subtitle">Reps: {step.reps}</ThemedText>
              )}

              {showWeight && (
                <ThemedText type="subtitle">Weight: {step.weight}</ThemedText>
              )}
            </>
          )}
        </View>
      </View>

      {!isFinished && (
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
            icon={
              <MaterialIcons
                name={isPaused ? "play-arrow" : "pause"}
                size={IconSizes.MEDIUM}
                color={IconColors.ON_PRIMARY}
              />
            }
            onPress={() => setIsPaused((p) => !p)}
            disabled={remaining === null}
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
            onPress={
              isLast
                ? () => {
                    clearTimer();
                    setRemaining(null);
                    setIsPaused(false);
                    setIsFinished(true);
                  }
                : handleNext
            }
          />
        </View>
      )}
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
    gap: Spacing.EXTRA_LARGE,
  },
  bigValue: {
    fontSize: 100,
    fontWeight: "bold",
    lineHeight: 86,
    textAlign: "center",
  },
  progressBarWrapper: {
    width: "100%",
    height: 28,
    backgroundColor: "#e6e6e6",
    borderRadius: 14,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Colors.SUCCESS,
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: Spacing.MEDIUM,
  },
  progressTextInside: {
    color: "#fff",
    fontWeight: "600",
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: Spacing.LARGE,
    margin: Spacing.LARGE,
  },
});
