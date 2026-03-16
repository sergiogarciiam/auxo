import { MaterialIcons } from "@expo/vector-icons";
import { useAudioPlayer } from "expo-audio";
import * as Notifications from "expo-notifications";
import { Stack, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AppState,
  AppStateStatus,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";

import * as Haptics from "expo-haptics";
import ConfettiCannon from "react-native-confetti-cannon";
import { ConfirmDialog } from "../components/confirm-dialog";
import { ThemedButton } from "../components/themed-button";
import { ThemedText } from "../components/themed-text";
import { IconSizes, Spacing } from "../constants/theme";
import { useSettingsContext } from "../context/useSettingsContext";
import { usePauseTimer } from "../hooks/start/usePauseTimer";
import { useStartTimer } from "../hooks/start/useStartTimer";
import { useTheme } from "../hooks/useTheme";
import { useStartWorkoutStore } from "../stores/useStartWorkoutStore";
import { formatTime } from "../utils/formatTime";

const beep = require("../../assets/beep.wav");
const doubleBeep = require("../../assets/double-beep.wav");

// Configure notifications with minimal settings
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function StartWorkout() {
  const router = useRouter();
  const colors = useTheme();
  const beepPlayer = useAudioPlayer(beep);
  const doubleBeepPlayer = useAudioPlayer(doubleBeep);

  const { weightUnit } = useSettingsContext();
  const { workout, executionPlan, stopWorkout } = useStartWorkoutStore();

  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isTimerStopped, setIsTimerStopped] = useState(false);

  const timerRef = useRef<number | null>(null);
  const backgroundTimeRef = useRef<number | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const isTimerStoppedRef = useRef(false);
  const isAppInBackgroundRef = useRef(false);
  const isPausedRef = useRef(isPaused);

  const startTimer = (seconds: number) => {
    // Don't start if timer is stopped
    if (isTimerStoppedRef.current) {
      return;
    }

    clearTimer();
    setRemaining(seconds);

    timerRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev === null || isTimerStoppedRef.current) return prev;

        if (prev <= 4 && prev > 1) {
          beepPlayer.seekTo(0);
          beepPlayer.play();
        }

        if (prev <= 1) {
          doubleBeepPlayer.seekTo(0);
          doubleBeepPlayer.play();
          clearTimer();

          if (isLast) {
            setTimeout(() => {
              setIsFinished(true);
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success,
              );
            }, 200);
          } else {
            setTimeout(() => {
              setIndex((i) => i + 1);
            }, 200);
          }

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
    setIsTimerStopped(false);
    isTimerStoppedRef.current = false;
    if (!isLast) {
      doubleBeepPlayer.seekTo(0);
      doubleBeepPlayer.play();
      setIndex((i) => i + 1);
    }
  };

  const handlePrev = () => {
    clearTimer();
    setRemaining(null);
    setIsPaused(false);
    setIsTimerStopped(false);
    isTimerStoppedRef.current = false;
    if (index > 0) {
      doubleBeepPlayer.seekTo(0);
      doubleBeepPlayer.play();
      setIndex((i) => i - 1);
    }
  };

  const handleFinish = () => {
    clearTimer();
    setRemaining(null);
    setIsPaused(false);
    setIsFinished(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const [exitConfirmVisible, setExitConfirmVisible] = useState(false);

  const handleExit = () => {
    setExitConfirmVisible(true);
  };

  const doExit = async () => {
    setExitConfirmVisible(false);
    clearTimer();
    stopWorkout();

    // cancel any pending notification when leaving workout altogether
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch {
      /* ignore */
    }

    router.replace("/");
  };

  // Get current step and block early for use in effects
  const step = executionPlan?.[index];
  const currentBlockName = workout?.blocks?.find(
    (s) => String(s.id) === String(step?.blockId),
  )?.name;

  // Start timer when step changes
  useStartTimer(
    executionPlan?.[index],
    startTimer,
    setRemaining,
    isPaused,
    clearTimer,
    index,
  );

  // keep paused ref in sync immediately and clear notifications
  // when the user explicitly pauses; this avoids a race where the
  // app could be backgrounded before the larger app-state effect runs.
  useEffect(() => {
    isPausedRef.current = isPaused;

    if (isPaused) {
      // cancel any notification scheduled earlier - pause behaves like stop
      Notifications.cancelAllScheduledNotificationsAsync().catch(() => {});
      backgroundTimeRef.current = null;
    }
  }, [isPaused]);

  // Handle app state changes (background/foreground)
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        // App has come to foreground
        isAppInBackgroundRef.current = false;

        // cancel any notification we may have scheduled while backgrounded
        try {
          await Notifications.cancelAllScheduledNotificationsAsync();
        } catch {
          /* ignore */
        }

        if (
          backgroundTimeRef.current &&
          remaining !== null &&
          remaining > 0 &&
          !isTimerStoppedRef.current &&
          !isPausedRef.current
        ) {
          const elapsedSeconds = Math.floor(
            (Date.now() - backgroundTimeRef.current) / 1000,
          );
          const newRemaining = Math.max(0, remaining - elapsedSeconds);

          if (newRemaining <= 0) {
            clearTimer();
            setRemaining(0);
          } else {
            setRemaining(newRemaining);
          }
        }
      } else if (
        nextAppState.match(/inactive|background/) &&
        remaining !== null &&
        remaining > 0 &&
        !isTimerStoppedRef.current &&
        !isPausedRef.current
      ) {
        // App is going to background - save timestamp only if timer is running
        isAppInBackgroundRef.current = true;
        backgroundTimeRef.current = Date.now();

        // Send system notification ONLY when going to background
        // If we background during an active timer we schedule a notification
        // to fire when the countdown would reach zero. This way the user gets
        // alerted even if the JS timer stops while the app is suspended.
        if (remaining > 0 && step) {
          try {
            // clear any previous scheduled notifications so we don't stack
            await Notifications.cancelAllScheduledNotificationsAsync();

            await Notifications.scheduleNotificationAsync({
              content: {
                title: "Workout Timer",
                body: `${step.name} finished!`,
                sound: true,
              },
              // trigger after `remaining` seconds from now
              trigger: {
                type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                seconds: remaining,
                repeats: false,
              },
            });
          } catch (error) {
            console.warn("Failed to schedule notification:", error);
          }
        }
      }

      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );

    return () => {
      subscription.remove();
    };
  }, [remaining, step]);

  // Pause / Resume timer
  const contentStyle = useMemo(() => createStyles(colors), [colors]);

  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  usePauseTimer(isPaused, clearTimer, startTimer, remaining);

  if (!workout || !executionPlan || !step || executionPlan.length === 0) {
    return (
      <View style={contentStyle.container}>
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

  const showSet = step.set !== undefined && step.set > 0;

  return (
    <>
      <Stack.Screen
        options={{
          title: isFinished
            ? `${workout.name}`
            : `${workout.name} > ${currentBlockName ?? ""}`,
          headerRight: () => (
            <ThemedButton
              text="Exit"
              variant="destructive"
              onPress={handleExit}
            />
          ),
        }}
      />

      {(isPaused || isTimerStopped) && (
        <View style={contentStyle.pausedOverlay}></View>
      )}

      <View style={contentStyle.container}>
        <View style={contentStyle.progressBarWrapper}>
          <View
            style={[contentStyle.progressBarFill, { width: `${percent}%` }]}
          >
            {percent > 5 && (
              <ThemedText style={contentStyle.progressTextInside}>
                {percent}%
              </ThemedText>
            )}
          </View>
        </View>

        <View style={contentStyle.stepContainer}>
          {isFinished ? (
            <>
              <ConfettiCannon count={80} origin={{ x: -10, y: 0 }} fadeOut />
              <ConfettiCannon
                count={80}
                origin={{ x: width + 10, y: 0 }}
                fadeOut
              />
              <ThemedText type="title">🎉 Workout completed!</ThemedText>
              <ThemedText type="subtitle">{workout.name}</ThemedText>

              <ThemedButton
                variant="primary"
                onPress={() => router.replace("/")}
                text="Return homepage"
              />
            </>
          ) : (
            <View style={contentStyle.exerciseDataContainer}>
              <ThemedText type="subtitle" style={contentStyle.exerciseName}>
                {step.name}
              </ThemedText>
              <ThemedText
                type="title"
                style={[
                  contentStyle.bigValue,
                  isLandscape && contentStyle.bigValueLandscape,
                ]}
              >
                {remaining !== null
                  ? formatTime(remaining)
                  : step.time_seconds
                    ? formatTime(step.time_seconds)
                    : step.reps
                      ? `${step.reps} reps`
                      : "-"}
              </ThemedText>

              <ThemedText style={contentStyle.meta}>
                {showSet && `Set ${step.set}`}
                {showReps && ` · ${step.reps} reps`}
                {showWeight && ` · ${step.weight}${weightUnit}`}
              </ThemedText>
            </View>
          )}
        </View>
      </View>

      {!isFinished && (
        <View style={contentStyle.controls}>
          <ThemedButton
            text="Prev"
            icon={
              <MaterialIcons
                name="chevron-left"
                size={IconSizes.MEDIUM}
                color={colors.PRIMARY_ICON_COLOR}
              />
            }
            onPress={handlePrev}
            disabled={index === 0}
          />

          <ThemedButton
            style={contentStyle.playButton}
            icon={
              <MaterialIcons
                name={isPaused ? "play-arrow" : "pause"}
                size={IconSizes.MEDIUM}
                color={colors.PRIMARY_ICON_COLOR}
              />
            }
            onPress={() => setIsPaused((p) => !p)}
            disabled={remaining === null || isTimerStopped}
          />

          <ThemedButton
            text={isLast ? "Finish" : "Next"}
            icon={
              <MaterialIcons
                name="chevron-right"
                size={IconSizes.MEDIUM}
                color={colors.PRIMARY_ICON_COLOR}
              />
            }
            onPress={isLast ? handleFinish : handleNext}
          />
        </View>
      )}
      <ConfirmDialog
        visible={exitConfirmVisible}
        title="Exit workout?"
        message="Are you sure you want to exit this workout?"
        onCancel={() => setExitConfirmVisible(false)}
        onConfirm={doExit}
        cancelText="Cancel"
        confirmText="Exit"
        destructive
      />
    </>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: Spacing.LARGE,
      gap: Spacing.LARGE,
      backgroundColor: colors.BACKGROUND_SECONDARY,
    },
    exerciseDataContainer: {
      alignItems: "center",
      gap: Spacing.LARGE,
    },
    stepContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: Spacing.EXTRA_LARGE,
    },
    bigValue: {
      fontSize: 96,
      fontWeight: "bold",
      textAlign: "center",
      color: colors.TEXT_PRIMARY,
    },
    exerciseName: {
      fontSize: 26,
      fontWeight: "700",
      textAlign: "center",
      color: colors.TEXT_PRIMARY,
    },
    meta: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.TEXT_PRIMARY,
    },
    bigValueLandscape: {
      fontSize: 100,
      lineHeight: 100,
    },
    progressBarWrapper: {
      width: "100%",
      height: 24,
      backgroundColor: "#e6e6e6",
      borderRadius: 14,
      overflow: "hidden",
    },
    progressBarFill: {
      height: "100%",
      backgroundColor: colors.SUCCESS,
      justifyContent: "center",
      alignItems: "flex-end",
      paddingRight: Spacing.MEDIUM,
    },
    progressTextInside: {
      color: "#e6e6e6",
      fontWeight: "600",
    },
    controls: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: Spacing.LARGE,
      padding: Spacing.LARGE,
      backgroundColor: colors.BACKGROUND_SECONDARY,
    },
    pausedOverlay: {
      opacity: 0.7,
      backgroundColor: colors.BACKGROUND,
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 2,
    },
    playButton: {
      zIndex: 3,
    },
  });
