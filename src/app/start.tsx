import { MaterialIcons } from "@expo/vector-icons";
import { useAudioPlayer } from "expo-audio";
import { Stack, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { ThemedButton } from "../components/themed-button";
import { ThemedText } from "../components/themed-text";
import { Colors, IconColors, IconSizes, Spacing } from "../constants/theme";
import { useStartWorkoutStore } from "../stores/useStartWorkoutStore";

const beep = require("../../assets/beep.wav");
const doubleBeep = require("../../assets/double-beep.wav");

export default function StartWorkout() {
  const beepPlayer = useAudioPlayer(beep);
  const doubleBeepPlayer = useAudioPlayer(doubleBeep);

  const { workout, executionPlan, stopWorkout } = useStartWorkoutStore();
  const [index, setIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const step = executionPlan[index];
  const isLast = index >= executionPlan.length - 1;
  const percent = isFinished
    ? 100
    : Math.round(((index + 1) / executionPlan.length) * 100);
  const currentSection = workout?.sections?.find(
    (s) => s.id === step.sectionId,
  );
  const screenTitle = `${workout?.name ?? ""}${currentSection ? ` > ${currentSection.name}` : ""}`;

  const [remaining, setRemaining] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<number | null>(null);
  const router = useRouter();

  const clearIntervalTimer = () => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current as unknown as number);
      timerRef.current = null;
    }
  };

  const handleNext = () => {
    clearIntervalTimer();
    setRemaining(null);
    setIsPaused(false);
    if (!isLast) setIndex((i) => i + 1);
  };

  const handlePrev = () => {
    clearIntervalTimer();
    setRemaining(null);
    setIsPaused(false);
    if (index > 0) setIndex((i) => i - 1);
  };

  const handleExit = () => {
    if (!isFinished) {
      Alert.alert(
        "Exit workout?",
        "Are you sure you want to exit this workout?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Exit",
            style: "destructive",
            onPress: async () => {
              stopWorkout();
              router.replace("/");
            },
          },
        ],
      );
    } else {
      stopWorkout();
      router.replace("/");
    }
  };

  const startInterval = () => {
    clearIntervalTimer();

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
          // reached zero
          clearIntervalTimer();
          // advance to next step after a short delay to allow UI update
          setTimeout(() => {
            if (!isLast) setIndex((i) => i + 1);
          }, 200);
          return 0;
        }
        return prev - 1;
      });
    }, 1000) as unknown as number;
  };

  // run when index changes: reset remaining and start timer (unless paused)
  useEffect(() => {
    clearIntervalTimer();

    const initial =
      step.type === "exercise"
        ? (step.time_seconds ?? null)
        : (step.duration_seconds ?? null);
    if (initial && initial > 0) {
      setRemaining(initial);
      if (!isPaused) startInterval();
    } else {
      setRemaining(null);
    }

    return () => clearIntervalTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  // run when pause toggles: stop or start interval without resetting remaining
  useEffect(() => {
    if (isPaused) {
      clearIntervalTimer();
    } else {
      // resume
      if (remaining && remaining > 0) startInterval();
    }
    return () => {};
  }, [isPaused]);

  const formatTime = (s: number) => {
    const mm = Math.floor(s / 60);
    const ss = s % 60;
    return `${mm.toString().padStart(2, "0")}:${ss.toString().padStart(2, "0")}`;
  };

  if (!executionPlan || executionPlan.length === 0) {
    return (
      <View style={styles.container}>
        <ThemedText type="title">{workout?.name}</ThemedText>
        <ThemedText>No execution plan available</ThemedText>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: screenTitle,
          headerRight: () => (
            <ThemedButton
              text="Exit"
              onPress={handleExit}
              variant="destructive"
            />
          ),
        }}
      />

      {isPaused && <View style={styles.pausedScreen}></View>}

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

        <View style={styles.stepContainer}>
          {isFinished ? (
            <>
              <ThemedText type="title" style={styles.bigValue}>
                You finished the workout!
              </ThemedText>
              <ThemedText type="subtitle">{workout?.name}</ThemedText>
            </>
          ) : step.type === "exercise" ? (
            <>
              <ThemedText type="title" style={styles.bigValue}>
                {remaining !== null
                  ? formatTime(remaining)
                  : step.time_seconds && step.time_seconds > 0
                    ? formatTime(step.time_seconds)
                    : step.reps
                      ? `x${step.reps}`
                      : "-"}
              </ThemedText>

              <ThemedText type="subtitle">{step.name}</ThemedText>
              {step.time_seconds !== undefined &&
                step.time_seconds > 0 &&
                step.reps !== undefined &&
                step.reps > 0 && (
                  <ThemedText>{`Reps: ${step.reps}`}</ThemedText>
                )}
              {step.weight !== undefined && step.weight !== 0 && (
                <ThemedText>{`Weight: ${step.weight}`}</ThemedText>
              )}
              {step.set && <ThemedText>{`Set ${step.set}`}</ThemedText>}
              {isPaused && remaining !== null && (
                <ThemedText style={styles.pausedText}>Paused</ThemedText>
              )}
            </>
          ) : (
            <>
              <ThemedText type="title" style={styles.bigValue}>
                {remaining !== null
                  ? formatTime(remaining)
                  : formatTime(step.duration_seconds ?? 0)}
              </ThemedText>
              <ThemedText type="subtitle">{step.name || "Rest"}</ThemedText>
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
            style={styles.playButton}
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
                    // mark isFinished in-place
                    clearIntervalTimer();
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
    marginTop: Spacing.SMALL,
  },
  pausedText: {
    marginTop: Spacing.MEDIUM,
    color: "#b00020",
    fontWeight: "600",
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: Spacing.LARGE,
    margin: Spacing.LARGE,
  },
  pausedScreen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.BACKGROUND,
    opacity: 0.7,
    zIndex: 2,
  },
  playButton: {
    zIndex: 3,
  },
});
