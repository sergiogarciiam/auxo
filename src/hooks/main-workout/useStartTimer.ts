import { EXERCISE_STEP_TYPE } from "@/src/constants/constants";
import { ExecutionStep } from "@/src/types/ui";
import { useEffect, useRef } from "react";

export const useStartTimer = (
  step: ExecutionStep | null | undefined,
  startTimer: (seconds: number) => void,
  setRemaining: (seconds: number | null) => void,
  isPaused: boolean,
  clearTimer: () => void,
  index: number,
) => {
  const clearTimerRef = useRef(clearTimer);
  const startTimerRef = useRef(startTimer);
  const setRemainingRef = useRef(setRemaining);
  const isPausedRef = useRef(isPaused);

  clearTimerRef.current = clearTimer;
  startTimerRef.current = startTimer;
  setRemainingRef.current = setRemaining;
  isPausedRef.current = isPaused;

  useEffect(() => {
    if (!step) return;

    clearTimerRef.current();

    const initial =
      step.type === EXERCISE_STEP_TYPE
        ? (step.time_seconds ?? null)
        : (step.duration_seconds ?? null);

    if (initial && initial > 0) {
      setRemainingRef.current(initial);
      if (!isPausedRef.current) {
        startTimerRef.current(initial);
      }
    } else {
      setRemainingRef.current(null);
    }

    return () => clearTimerRef.current();
  }, [index, step]);
};
