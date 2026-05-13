import { setAudioModeAsync, useAudioPlayer } from "expo-audio";
import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, useWindowDimensions } from "react-native";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import * as Haptics from "expo-haptics";
import { SquareArrowRightExit } from "lucide-react-native";

import { CustomAlertDialog } from "../components/alert-dialog";
import { useSettingsContext } from "../context/useSettingsContext";
import { useExercises } from "../hooks/base/useExercises";
import { useTheme } from "../hooks/other/useTheme";
import { useAppStateListener } from "../hooks/start/useAppStateListener";
import { useFlexibleExerciseSelection } from "../hooks/start/useFlexibleExerciseSelection";
import { useNavigationExit } from "../hooks/start/useNavigationExit";
import { usePauseTimer } from "../hooks/start/usePauseTimer";
import { useStartTimer } from "../hooks/start/useStartTimer";
import { useStartWorkoutStore } from "../stores/useStartWorkoutStore";
import { UpdateExercisePayload } from "../types/exercise";
import { handleAndShowError, showSuccessMessage } from "../utils/ui";

import { FlexibleExerciseSelector } from "../components/start/FlexibleExerciseSelector";
import { RepsWeightAdjustment } from "../components/start/RepsWeightAdjustment";
import { WorkoutControls } from "../components/start/WorkoutControls";
import { WorkoutDisplay } from "../components/start/WorkoutDisplay";
import { WorkoutFinished } from "../components/start/WorkoutFinished";
import { WorkoutProgressBar } from "../components/start/WorkoutProgressBar";
import { EXERCISE_TYPES_REPS } from "../constants/constants";

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
  const beepPlayer = useAudioPlayer(beep);
  const doubleBeepPlayer = useAudioPlayer(doubleBeep);

  const { weightUnit } = useSettingsContext();
  const { updateExercise } = useExercises();
  const { width, height } = useWindowDimensions();
  const colors = useTheme();

  const { workout, executionPlan, stopWorkout, markFlexibleExerciseCompleted } =
    useStartWorkoutStore();

  // Subscribe to completed exercises for reactivity
  const completedExercises = useStartWorkoutStore(
    (state) => state.flexibleBlockState.completedExercises,
  );

  // Main navigation state
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);

  // Live tracking state
  const [liveReps, setLiveReps] = useState<number | null>(null);
  const [liveWeight, setLiveWeight] = useState<number | null>(null);

  // Refs
  const timerRef = useRef<number | null>(null);
  const isPausedRef = useRef(false);
  const latestSetsDataRef = useRef<Record<string | number, any[]>>({});

  // Flexible exercise management
  const {
    flexPlan,
    flexIndex,
    selectedExercise,
    isRunningFlexibleExercise,
    isLastFlexIndex,
    handleSelectFlexible,
    resetFlexPlan,
    nextFlexIndex,
    prevFlexIndex,
  } = useFlexibleExerciseSelection();

  // Audio setup
  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: "duckOthers",
    });
  }, []);

  // Current step logic
  const mainStep = executionPlan[index];
  const step = isRunningFlexibleExercise ? flexPlan[flexIndex] : mainStep;
  const isLastMain = index >= executionPlan.length - 1;
  const isLandscape = width > height;

  // Update live reps/weight when step changes
  useEffect(() => {
    const exId = step?.exerciseId as number | undefined;
    const setsData = exId ? latestSetsDataRef.current[exId] : undefined;
    if (setsData && step?.set) {
      const setData = setsData[step.set - 1];
      if (setData) {
        setLiveReps(setData.last_reps ?? null);
        setLiveWeight(setData.weight ?? null);
        return;
      }
    }
    setLiveReps(step?.last_reps ?? null);
    setLiveWeight(step?.weight ?? null);
  }, [step]);

  // Timer management
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleNextRef = useRef<() => void>(() => {});
  const startTimer = useCallback(
    (seconds: number) => {
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
              handleNextRef.current();
            }, 150);
            return 0;
          }

          return prev - 1;
        });
      }, 1000) as unknown as number;
    },
    [clearTimer, beepPlayer, doubleBeepPlayer],
  );

  // Persist exercise changes to database
  const persistChanges = async () => {
    if (!step?.exerciseId) return;
    const exerciseId = step.exerciseId as number;

    const updates: UpdateExercisePayload = {
      id: exerciseId,
    };

    if (step.sets_data && step.set) {
      const setIndex = step.set - 1;
      let baseSetsData =
        latestSetsDataRef.current[exerciseId] ?? step.sets_data;

      if (baseSetsData.length <= setIndex) {
        baseSetsData = [
          ...baseSetsData,
          ...Array.from({ length: setIndex + 1 - baseSetsData.length }, () => ({
            min_reps: step.min_reps ?? 0,
            max_reps: step.max_reps ?? 0,
            last_reps: step.last_reps ?? 0,
            time_seconds: step.time_seconds ?? 0,
            weight: step.weight ?? 0,
            rest_time: 0,
          })),
        ];
      }

      const newSetsData = baseSetsData.map((s, i) => {
        if (i !== setIndex) return s;
        const updated = { ...s };
        if (liveReps !== null && liveReps !== s.last_reps) {
          updated.last_reps = liveReps;
        }
        if (liveWeight !== null && liveWeight !== s.weight) {
          updated.weight = liveWeight;
        }
        return updated;
      });

      const hasChanges = newSetsData.some(
        (s, i) =>
          s.last_reps !== baseSetsData[i].last_reps ||
          s.weight !== baseSetsData[i].weight,
      );

      if (hasChanges) {
        updates.sets_data = JSON.stringify(newSetsData);
      }
    } else {
      if (liveReps !== null && liveReps !== step.last_reps) {
        updates.last_reps = liveReps;
      }

      if (liveWeight !== null && liveWeight !== step.weight) {
        updates.weight = liveWeight;
      }
    }

    if (Object.keys(updates).length > 1) {
      try {
        await updateExercise(updates);
        if (updates.sets_data) {
          latestSetsDataRef.current[exerciseId] = JSON.parse(updates.sets_data);
        }
        showSuccessMessage("Exercise saved");
      } catch (error) {
        handleAndShowError(error);
      }
    }
  };

  // Navigation handlers
  const handleNext = async () => {
    await persistChanges();
    clearTimer();
    setRemaining(null);

    if (isRunningFlexibleExercise) {
      if (!isLastFlexIndex) {
        nextFlexIndex();
        return;
      }

      markFlexibleExerciseCompleted(
        mainStep.blockId as string,
        String(selectedExercise!.id),
      );
      resetFlexPlan();
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

  handleNextRef.current = handleNext;

  // Navigation exit handler
  const { confirmExit, handleGoHome } = useNavigationExit({
    onPauseWorkout: () => setIsPaused(true),
    onOpenExitDialog: () => setExitDialogOpen(true),
    onStopWorkout: stopWorkout,
    clearTimer,
  });

  // Timer hooks
  useStartTimer(
    step,
    startTimer,
    setRemaining,
    isPaused,
    clearTimer,
    isRunningFlexibleExercise ? flexIndex : index,
  );

  usePauseTimer(isPaused, clearTimer, startTimer, remaining);

  // App state listener for background/foreground
  useAppStateListener({
    remaining,
    isPaused,
    step,
    onTimeElapsed: handleNext,
    onSetRemaining: setRemaining,
  });

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  const handlePrev = () => {
    clearTimer();
    setRemaining(null);

    if (isRunningFlexibleExercise) {
      if (flexIndex > 0) {
        prevFlexIndex();
        return;
      }

      resetFlexPlan();
      return;
    }

    if (index > 0) {
      setIndex((p) => p - 1);
    }
  };

  const handleExit = () => {
    setExitDialogOpen(true);
    setIsPaused(true);
  };

  const completedFlexIds = useMemo(() => {
    if (!mainStep?.blockId) return [];
    return (
      mainStep.availableExercises
        ?.filter((ex: any) => {
          const key = `${mainStep.blockId}:${String(ex.id)}`;
          return completedExercises.includes(key);
        })
        ?.map((ex: any) => String(ex.id)) ?? []
    );
  }, [mainStep?.blockId, mainStep?.availableExercises, completedExercises]);

  const percent = useMemo(() => {
    if (isFinished) return 100;

    // Get unique block IDs in order
    const uniqueBlockIds = Array.from(
      new Set(executionPlan.map((step) => step.blockId)),
    );
    const totalBlocks = uniqueBlockIds.length;

    // Calculate progress for each block
    let totalProgress = 0;

    uniqueBlockIds.forEach((blockId) => {
      const blockSteps = executionPlan.filter((s) => s.blockId === blockId);
      if (blockSteps.length === 0) return;

      const firstBlockStepIndex = executionPlan.findIndex(
        (s) => s.blockId === blockId,
      );
      const lastBlockStepIndex = firstBlockStepIndex + blockSteps.length - 1;

      // Block is fully completed
      if (index > lastBlockStepIndex) {
        totalProgress += 1;
        return;
      }

      // Block is current or future block, calculate partial progress
      if (blockId === mainStep?.blockId) {
        if (mainStep?.type === "flexible-selection") {
          // Flexible: based on completed exercises
          const totalExercises = mainStep.availableExercises?.length || 1;
          const completedCount = completedFlexIds.length;
          totalProgress += completedCount / totalExercises;
        } else {
          // Regular: based on steps completed in this block
          const stepsInBlockBeforeCurrent = index - firstBlockStepIndex;
          totalProgress +=
            Math.max(0, stepsInBlockBeforeCurrent) / blockSteps.length;
        }
      }
    });

    return Math.round((totalProgress / totalBlocks) * 100);
  }, [
    isFinished,
    mainStep?.blockId,
    mainStep?.type,
    mainStep?.availableExercises?.length,
    completedFlexIds.length,
    index,
    executionPlan,
  ]);

  // Error state
  if (!workout || !executionPlan?.length || !mainStep) {
    return;
  }

  // UI calculations
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

      {/* Pause overlay */}
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

      {/* Main content */}
      <View
        className="flex-1 gap-6 p-6"
        style={{ backgroundColor: colors.BACKGROUND_SECONDARY }}
      >
        {/* Flexible exercise selector */}
        {mainStep.type === "flexible-selection" &&
          !isRunningFlexibleExercise &&
          !isFinished && (
            <FlexibleExerciseSelector
              availableExercises={mainStep.availableExercises || []}
              completedExerciseIds={completedFlexIds}
              onSelectExercise={(ex) =>
                handleSelectFlexible(ex, mainStep.blockId as string)
              }
            />
          )}
        <WorkoutProgressBar percent={percent} />

        <View className="items-center justify-center flex-1 gap-6">
          {isFinished ? (
            <WorkoutFinished onGoHome={handleGoHome} />
          ) : (
            <>
              <WorkoutDisplay
                step={step}
                remaining={remaining}
                isLandscape={isLandscape}
                isIdleFlexibleSelection={isIdleFlexibleSelection}
              />

              <RepsWeightAdjustment
                liveReps={liveReps}
                liveWeight={liveWeight}
                weightUnit={weightUnit}
                showReps={
                  step.exercise_type === EXERCISE_TYPES_REPS &&
                  liveReps !== null
                }
                showWeight={true}
                onRepsChange={setLiveReps}
                onWeightChange={setLiveWeight}
              />
            </>
          )}
        </View>

        <WorkoutControls
          isPaused={isPaused}
          remaining={remaining}
          isFirstExercise={index === 0 && !isRunningFlexibleExercise}
          isFinished={isFinished}
          onPrev={handlePrev}
          onTogglePause={() => setIsPaused((p) => !p)}
          onNext={handleNext}
        />
      </View>

      {/* Exit dialog */}
      <CustomAlertDialog
        open={exitDialogOpen}
        message="Are you sure you want to exit workout?"
        confirm={confirmExit}
        cancel={() => {
          setExitDialogOpen(false);
          setIsPaused(false);
        }}
      />
    </>
  );
}
