import { useCallback, useRef, useState } from "react";

export const useIntervalTimer = () => {
  const timerRef = useRef<number | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const clear = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const start = useCallback(
    (seconds: number, onFinish?: () => void) => {
      clear();
      setRemaining(seconds);
      setIsRunning(true);

      timerRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev === null) return null;
          if (prev <= 1) {
            clear();
            onFinish?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000) as unknown as number;
    },
    [clear],
  );

  const pause = useCallback(() => {
    clear();
  }, [clear]);

  return { remaining, isRunning, start, pause, clear };
};
