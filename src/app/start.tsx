import { setAudioModeAsync, useAudioPlayer } from "expo-audio";
import * as Notifications from "expo-notifications";
import { Stack, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  AppState,
  AppStateStatus,
  View,
  useWindowDimensions,
} from "react-native";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import * as Haptics from "expo-haptics";
import {
  ArrowLeft,
  ArrowRight,
  Pause,
  Play,
  SquareArrowRightExit,
} from "lucide-react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import { CustomAlertDialog } from "../components/alert-dialog";
import { useSettingsContext } from "../context/useSettingsContext";
import { usePauseTimer } from "../hooks/start/usePauseTimer";
import { useStartTimer } from "../hooks/start/useStartTimer";
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
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: "duckOthers",
    });
  }, []);

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
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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

  const handleExit = () => {
    setOpen(true);
    setIsPaused(true);
  };

  const cancelExit = () => {
    setOpen(false);
    setIsPaused(false);
  };

  const confirmExit = async () => {
    setOpen(false);
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

  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  usePauseTimer(isPaused, clearTimer, startTimer, remaining);

  if (!workout || !executionPlan || !step || executionPlan.length === 0) {
    return (
      <View className="items-center justify-center flex-1">
        <Text>No execution plan</Text>
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
          title: workout.name,
          headerBackVisible: false,
          headerRight: () => (
            <Button variant="destructive" size="icon" onPress={handleExit}>
              <Icon as={SquareArrowRightExit} />
            </Button>
          ),
        }}
      />

      {(isPaused || isTimerStopped) && (
        <View className="absolute inset-0 z-10 bg-black/60" />
      )}

      <View className="flex-1 gap-6 p-6 bg-neutral-900">
        {/* Progress */}
        <View className="w-full h-5 overflow-hidden rounded-full bg-neutral-700">
          <View
            className="items-end justify-center h-full pr-3 bg-green-500 rounded-full"
            style={{ width: `${percent}%` }}
          >
            {percent > 5 && <Text className="font-semibold">{percent}%</Text>}
          </View>
        </View>

        {/* Step */}
        <View className="items-center justify-center flex-1 gap-10">
          {isFinished ? (
            <>
              <ConfettiCannon count={80} origin={{ x: -10, y: 0 }} fadeOut />
              <ConfettiCannon
                count={80}
                origin={{ x: width + 10, y: 0 }}
                fadeOut
              />

              <Text className="text-xl font-bold">🎉 Workout completed!</Text>

              <Button onPress={() => router.replace("/")}>
                <Text>Go home</Text>
              </Button>
            </>
          ) : (
            <View className="items-center gap-6">
              <Text className="text-2xl font-bold text-center">
                {step.name}
              </Text>

              <Text
                className={`text-[96px] font-bold text-center ${
                  isLandscape ? "text-[110px]" : ""
                }`}
              >
                {remaining !== null
                  ? formatTime(remaining)
                  : step.time_seconds
                    ? formatTime(step.time_seconds)
                    : step.reps
                      ? `${step.reps} reps`
                      : "-"}
              </Text>

              <Text className="text-base font-bold">
                {showSet && `Set ${step.set}`}
                {showReps && ` · ${step.reps} reps`}
                {showWeight && ` · ${step.weight}${weightUnit}`}
              </Text>
            </View>
          )}
        </View>

        {/* Controls */}
        {!isFinished && (
          <View className="flex-row items-center justify-between gap-6">
            <Button size="icon" onPress={handlePrev} disabled={index === 0}>
              <Icon as={ArrowLeft} />
            </Button>

            <Button
              size="icon"
              onPress={() => setIsPaused((p) => !p)}
              disabled={remaining === null}
              className="z-20"
            >
              {isPaused ? <Icon as={Play} /> : <Icon as={Pause} />}
            </Button>

            <Button size="icon" onPress={isLast ? handleFinish : handleNext}>
              <Icon as={ArrowRight} />
            </Button>
          </View>
        )}
      </View>

      <CustomAlertDialog
        message="Do you want to exit workout?"
        open={open}
        confirm={confirmExit}
        cancel={cancelExit}
      ></CustomAlertDialog>
    </>
  );
}
