// hooks/useWorkoutExecution.ts
import { useEffect, useState } from "react";
import { EXERCISE_STEP_TYPE } from "../../constants/constants";
import { useStartWorkoutStore } from "../../stores/useStartWorkoutStore";
import { useIntervalTimer } from "./useIntervalTimer";
import { useWorkoutBeeps } from "./useWorkoutBeeps";

export const useWorkoutExecution = () => {
  const { workout, executionPlan } = useStartWorkoutStore();
  const [index, setIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const step = executionPlan[index];
  const isLast = index >= executionPlan.length - 1;

  const timer = useIntervalTimer();
  const { playBeep, playDoubleBeep } = useWorkoutBeeps();

  useEffect(() => {
    timer.clear();

    const duration =
      step?.type === EXERCISE_STEP_TYPE
        ? step.time_seconds
        : step?.duration_seconds;

    if (duration && duration > 0) {
      timer.start(duration, () => {
        playDoubleBeep();
        if (!isLast) setIndex((i) => i + 1);
        else setIsFinished(true);
      });
    }
  }, [index, isLast, playDoubleBeep, step, timer]);

  useEffect(() => {
    if (
      timer.remaining !== null &&
      timer.remaining <= 4 &&
      timer.remaining > 1
    ) {
      playBeep();
    }
  }, [timer.remaining, playBeep]);

  return {
    workout,
    step,
    index,
    isLast,
    isFinished,
    remaining: timer.remaining,
    isRunning: timer.isRunning,
    next: () => setIndex((i) => Math.min(i + 1, executionPlan.length - 1)),
    prev: () => setIndex((i) => Math.max(i - 1, 0)),
    pause: timer.pause,
    resume: () => timer.start(timer.remaining ?? 0),
    finish: () => setIsFinished(true),
  };
};
