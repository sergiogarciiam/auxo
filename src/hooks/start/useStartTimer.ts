import { EXERCISE_STEP_TYPE } from "@/src/constants/constants";
import { useEffect } from "react";

export const useStartTimer = (
  step: any,
  startTimer: (seconds: number) => void,
  setRemaining: (seconds: number | null) => void,
  isPaused: boolean,
  clearTimer: () => void,
  index: number,
) => {
  useEffect(() => {
    if (!step) return;

    clearTimer();

    const initial =
      step.type === EXERCISE_STEP_TYPE
        ? (step.time_seconds ?? null)
        : (step.duration_seconds ?? null);

    if (initial && initial > 0 && !isPaused) {
      startTimer(initial);
    } else {
      setRemaining(null);
    }

    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);
};
