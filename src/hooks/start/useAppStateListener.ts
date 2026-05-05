import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";

interface UseAppStateListenerProps {
  remaining: number | null;
  isPaused: boolean;
  step: any;
  onTimeElapsed: () => void;
  onSetRemaining: (value: number) => void;
}

export function useAppStateListener({
  remaining,
  isPaused,
  step,
  onTimeElapsed,
  onSetRemaining,
}: UseAppStateListenerProps) {
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const backgroundTimeRef = useRef<number | null>(null);
  const isPausedRef = useRef(isPaused);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", async (nextAppState) => {
      // App coming back from background
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
            onTimeElapsed();
          } else {
            onSetRemaining(newRemaining);
          }
        }
      }

      // App going to background
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
  }, [remaining, step, onTimeElapsed, onSetRemaining]);
}
