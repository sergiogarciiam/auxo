import { useEffect } from "react";

export const usePauseTimer = (
  isPaused: boolean,
  clearTimer: () => void,
  startTimer: (seconds: number) => void,
  remaining: number | null,
) => {
  useEffect(() => {
    if (isPaused) {
      clearTimer();
    } else if (remaining && remaining > 0) {
      startTimer(remaining);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaused]);
};
