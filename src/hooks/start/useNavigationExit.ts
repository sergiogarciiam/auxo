import * as Notifications from "expo-notifications";
import { useNavigation, useRouter } from "expo-router";
import { useEffect, useRef } from "react";

interface UseNavigationExitProps {
  onPauseWorkout: () => void;
  onOpenExitDialog: () => void;
  onStopWorkout: () => void;
  clearTimer: () => void;
}

export function useNavigationExit({
  onPauseWorkout,
  onOpenExitDialog,
  onStopWorkout,
  clearTimer,
}: UseNavigationExitProps) {
  const router = useRouter();
  const navigation = useNavigation();
  const allowExitRef = useRef(false);

  // Handle navigation back attempts
  useEffect(() => {
    const unsub = navigation.addListener("beforeRemove", (e: any) => {
      if (allowExitRef.current) return;

      e.preventDefault();
      onPauseWorkout();
      onOpenExitDialog();
    });

    return unsub;
  }, [navigation, onPauseWorkout, onOpenExitDialog]);

  const confirmExit = async () => {
    allowExitRef.current = true;
    clearTimer();
    onStopWorkout();

    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch {}

    router.back();
  };

  const handleGoHome = async () => {
    allowExitRef.current = true;
    onStopWorkout();
    router.back();
  };

  return {
    confirmExit,
    handleGoHome,
    allowExitRef,
  };
}
