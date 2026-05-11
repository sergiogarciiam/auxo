import { useEffect, useRef } from "react";

export const usePauseTimer = (
  isPaused: boolean,
  clearTimer: () => void,
  startTimer: (seconds: number) => void,
  remaining: number | null,
) => {
  const clearTimerRef = useRef(clearTimer);
  const startTimerRef = useRef(startTimer);

  clearTimerRef.current = clearTimer;
  startTimerRef.current = startTimer;

  useEffect(() => {
    if (isPaused) {
      clearTimerRef.current();
    } else if (remaining && remaining > 0) {
      startTimerRef.current(remaining);
    }
  }, [isPaused, remaining]);
};
