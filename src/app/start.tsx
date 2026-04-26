import { setAudioModeAsync, useAudioPlayer } from "expo-audio";
import * as Notifications from "expo-notifications";
import { Stack, useNavigation, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  AppState,
  AppStateStatus,
  Pressable,
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
  Minus,
  Pause,
  Play,
  Plus,
  SquareArrowRightExit,
} from "lucide-react-native";

import ConfettiCannon from "react-native-confetti-cannon";

import { CustomAlertDialog } from "../components/alert-dialog";
import { useSettingsContext } from "../context/useSettingsContext";
import { useExercises } from "../hooks/base/useExercises";
import { usePauseTimer } from "../hooks/start/usePauseTimer";
import { useStartTimer } from "../hooks/start/useStartTimer";
import { useStartWorkoutStore } from "../stores/useStartWorkoutStore";
import { UpdateExercisePayload } from "../types/exercise";
import { buildFlexibleExercisePlan } from "../utils/buildFlexibleExercisePlan";
import { formatTime } from "../utils/formatTime";
import { handleAndShowError, showSuccessMessage } from "../utils/ui";

const beep = require("../../assets/beep.wav");
const doubleBeep = require("../../assets/double-beep.wav");

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
  const navigation = useNavigation();

  const beepPlayer = useAudioPlayer(beep);
  const doubleBeepPlayer = useAudioPlayer(doubleBeep);

  const { weightUnit } = useSettingsContext();
  const { updateExercise } = useExercises();

  const {
    workout,
    executionPlan,
    stopWorkout,
    markFlexibleExerciseCompleted,
    isFlexibleExerciseCompleted,
  } = useStartWorkoutStore();

  const [index, setIndex] = useState(0);

  const [remaining, setRemaining] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [open, setOpen] = useState(false);

  const [flexPlan, setFlexPlan] = useState<any[]>([]);
  const [flexIndex, setFlexIndex] = useState(0);
  const [selectedExercise, setSelectedExercise] = useState<any | null>(null);

  const [liveReps, setLiveReps] = useState<number | null>(null);
  const [liveWeight, setLiveWeight] = useState<number | null>(null);

  const timerRef = useRef<number | null>(null);
  const backgroundTimeRef = useRef<number | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const isPausedRef = useRef(false);
  const allowExitRef = useRef(false);

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: "duckOthers",
    });
  }, []);

  useEffect(() => {
    const unsub = navigation.addListener("beforeRemove", (e) => {
      if (allowExitRef.current) return;

      e.preventDefault();
      setIsPaused(true);
      setOpen(true);
    });

    return unsub;
  }, [navigation]);

  const mainStep = executionPlan[index];
  const step = flexPlan.length > 0 ? flexPlan[flexIndex] : mainStep;

  const isRunningFlexibleExercise = flexPlan.length > 0;
  const isLastMain = index >= executionPlan.length - 1;

  useEffect(() => {
    setLiveReps(step?.last_reps ?? null);
    setLiveWeight(step?.weight ?? null);
  }, [step]);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startTimer = (seconds: number) => {
    clearTimer();

    setRemaining(seconds);

    timerRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev === null) return prev;

        if (prev <= 4 && prev > 1) {
          beepPlayer.seekTo(0);
          beepPlayer.play();
        }

        if (prev <= 1) {
          doubleBeepPlayer.seekTo(0);
          doubleBeepPlayer.play();

          clearTimer();

          setTimeout(() => {
            handleNext();
          }, 150);

          return 0;
        }

        return prev - 1;
      });
    }, 1000) as unknown as number;
  };

  useStartTimer(
    step,
    startTimer,
    setRemaining,
    isPaused,
    clearTimer,
    flexPlan.length > 0 ? flexIndex : index,
  );

  usePauseTimer(isPaused, clearTimer, startTimer, remaining);

  const handleSelectFlexible = (exercise: any) => {
    const plan = buildFlexibleExercisePlan(exercise, mainStep.blockId);

    setSelectedExercise(exercise);
    setFlexPlan(plan);
    setFlexIndex(0);
    setRemaining(null);
  };

  const persistChanges = async () => {
    if (!step?.exerciseId) return;

    const updates: UpdateExercisePayload = {
      id: step.exerciseId,
    };

    if (liveReps !== null && liveReps !== step.last_reps) {
      updates.last_reps = liveReps;
    }

    if (liveWeight !== null && liveWeight !== step.weight) {
      updates.weight = liveWeight;
    }

    if (Object.keys(updates).length > 1) {
      try {
        await updateExercise(updates);
        showSuccessMessage("Exercise saved");
      } catch (error) {
        handleAndShowError(error);
      }
    }
  };

  const handleNext = async () => {
    await persistChanges();

    clearTimer();
    setRemaining(null);

    if (isRunningFlexibleExercise) {
      const isLastFlex = flexIndex >= flexPlan.length - 1;

      if (!isLastFlex) {
        setFlexIndex((p) => p + 1);
        return;
      }

      markFlexibleExerciseCompleted(mainStep.blockId, selectedExercise.id);

      setFlexPlan([]);
      setFlexIndex(0);
      setSelectedExercise(null);
      setRemaining(null);
      return;
    }

    if (isLastMain) {
      setIsFinished(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setIndex((p) => p + 1);
    }
  };

  const handlePrev = () => {
    clearTimer();
    setRemaining(null);

    if (isRunningFlexibleExercise) {
      if (flexIndex > 0) {
        setFlexIndex((p) => p - 1);
        return;
      }

      setFlexPlan([]);
      setFlexIndex(0);
      setSelectedExercise(null);
      return;
    }

    if (index > 0) {
      setIndex((p) => p - 1);
    }
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
    allowExitRef.current = true;

    clearTimer();
    stopWorkout();

    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch {}

    router.replace("/");
  };

  const handleGoHome = async () => {
    allowExitRef.current = true;

    stopWorkout();
    router.replace("/");
  };

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", async (nextAppState) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        try {
          await Notifications.cancelAllScheduledNotificationsAsync();
        } catch {}

        if (backgroundTimeRef.current && remaining && !isPausedRef.current) {
          const elapsed = Math.floor(
            (Date.now() - backgroundTimeRef.current) / 1000,
          );

          const newRemaining = Math.max(0, remaining - elapsed);

          if (newRemaining <= 0) {
            handleNext();
          } else {
            setRemaining(newRemaining);
          }
        }
      }

      if (
        nextAppState.match(/inactive|background/) &&
        remaining &&
        remaining > 0 &&
        !isPausedRef.current
      ) {
        backgroundTimeRef.current = Date.now();

        try {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "Workout Timer",
              body: `${step.name} finished!`,
              sound: true,
            },
            trigger: {
              seconds: remaining,
              type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            },
          });
        } catch {}
      }

      appStateRef.current = nextAppState;
    });

    return () => sub.remove();
  }, [remaining, step]);

  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const percent = isFinished
    ? 100
    : Math.round(((index + 1) / executionPlan.length) * 100);

  if (!workout || !executionPlan?.length || !mainStep) {
    return (
      <View className="items-center justify-center flex-1">
        <Text>No workout loaded</Text>
      </View>
    );
  }

  const isIdleFlexibleSelection =
    mainStep.type === "flexible-selection" && !isRunningFlexibleExercise;

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
      {isPaused && (
        <View
          pointerEvents="auto"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 20,
          }}
        />
      )}
      {mainStep.type === "flexible-selection" &&
        !isRunningFlexibleExercise &&
        !isFinished && (
          <View className="absolute inset-0 justify-center px-6 bg-black/60">
            <View className="gap-3">
              {mainStep.availableExercises?.map((ex: any) => {
                const done = isFlexibleExerciseCompleted(
                  mainStep.blockId,
                  ex.id,
                );

                return (
                  <Pressable
                    key={ex.id}
                    disabled={done}
                    onPress={() => handleSelectFlexible(ex)}
                    className={`p-4 rounded-xl ${
                      done ? "bg-green-700" : "bg-neutral-800"
                    }`}
                  >
                    <Text className="font-bold text-center text-white">
                      {ex.name} {done ? "✓" : ""}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

      <View className="flex-1 gap-6 p-6 bg-neutral-900">
        <View className="w-full h-5 overflow-hidden rounded-full bg-neutral-700">
          <View
            className="items-end justify-center h-full pr-3 bg-green-500"
            style={{ width: `${percent}%` }}
          >
            {percent > 5 && <Text className="font-bold">{percent}%</Text>}
          </View>
        </View>

        <View className="items-center justify-center flex-1 gap-6">
          {isFinished ? (
            <>
              <ConfettiCannon count={80} origin={{ x: -10, y: 0 }} fadeOut />
              <ConfettiCannon
                count={80}
                origin={{ x: width + 10, y: 0 }}
                fadeOut
              />

              <Text className="text-2xl font-bold">Workout Completed 🎉</Text>

              <Button onPress={handleGoHome}>
                <Text>Go Home</Text>
              </Button>
            </>
          ) : (
            <>
              <Text className="text-3xl font-bold text-center">
                {step.name}
              </Text>

              <View className="h-[140px] items-center justify-center">
                <Text
                  className={`font-bold text-center ${
                    isLandscape ? "text-[110px]" : "text-[96px]"
                  }`}
                >
                  {remaining !== null
                    ? formatTime(remaining)
                    : step.time_seconds
                      ? formatTime(step.time_seconds)
                      : step.min_reps && step.max_reps
                        ? `${step.min_reps} - ${step.max_reps}`
                        : isIdleFlexibleSelection
                          ? ""
                          : "-"}
                </Text>
              </View>

              <View className="gap-4">
                {!step.time_seconds && liveReps !== null && (
                  <View className="flex-row items-center gap-4">
                    <Button
                      size="icon"
                      variant="outline"
                      onPress={() =>
                        setLiveReps((p) => Math.max(0, (p ?? 0) - 1))
                      }
                    >
                      <Icon as={Minus} />
                    </Button>

                    <Text className="text-2xl font-bold text-center w-28">
                      {liveReps} reps
                    </Text>

                    <Button
                      size="icon"
                      variant="outline"
                      onPress={() => setLiveReps((p) => (p ?? 0) + 1)}
                    >
                      <Icon as={Plus} />
                    </Button>
                  </View>
                )}

                {step.weight !== undefined &&
                  step.weight !== null &&
                  step.weight !== 0 && (
                    <View className="flex-row items-center gap-4">
                      <Button
                        size="icon"
                        variant="outline"
                        onPress={() =>
                          setLiveWeight((p) =>
                            Math.max(0, Number(((p ?? 0) - 2.5).toFixed(1))),
                          )
                        }
                      >
                        <Icon as={Minus} />
                      </Button>

                      <Text className="text-2xl font-bold text-center w-28">
                        {liveWeight} {weightUnit}
                      </Text>

                      <Button
                        size="icon"
                        variant="outline"
                        onPress={() =>
                          setLiveWeight((p) =>
                            Number(((p ?? 0) + 2.5).toFixed(1)),
                          )
                        }
                      >
                        <Icon as={Plus} />
                      </Button>
                    </View>
                  )}

                {step.set && (
                  <Text className="text-lg font-bold text-center">
                    Set {step.set}
                    {step.totalSets ? ` / ${step.totalSets}` : ""}
                  </Text>
                )}
              </View>
            </>
          )}
        </View>

        {!isFinished && (
          <View className="flex-row items-center justify-between gap-6">
            <Button size="icon" onPress={handlePrev} disabled={index === 0}>
              <Icon as={ArrowLeft} />
            </Button>

            <Button
              size="icon"
              onPress={() => setIsPaused((p) => !p)}
              disabled={remaining === null}
              className="z-30"
            >
              {isPaused ? <Icon as={Play} /> : <Icon as={Pause} />}
            </Button>

            <Button size="icon" onPress={handleNext}>
              <Icon as={ArrowRight} />
            </Button>
          </View>
        )}
      </View>

      <CustomAlertDialog
        open={open}
        message="Are you sure you want to exit workout?"
        confirm={confirmExit}
        cancel={cancelExit}
      />
    </>
  );
}
