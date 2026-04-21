import { Alert, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon, CheckCircle2Icon } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import { AccessibilityInfo, Animated } from "react-native";
import { Sizes } from "../constants/theme";
import { useSnackbarStore } from "../stores/useSnackbarStore";

export function Snackbar() {
  const messages = useSnackbarStore((s: any) => s.messages);
  const hide = useSnackbarStore((s: any) => s.hide);

  const msg = messages[0] || null;
  const translateY = useRef(new Animated.Value(20)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!msg) return;

    AccessibilityInfo.announceForAccessibility(msg.text);

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    const timeout = setTimeout(() => {
      if (msg) hide(msg.id);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [msg, translateY, opacity, hide]);

  if (!msg) return null;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        {
          position: "absolute",
          left: Sizes.PADDING_LARGE,
          right: Sizes.PADDING_LARGE,
          bottom: 24,
          zIndex: 9999,
          transform: [{ translateY }],
          opacity: opacity,
        },
      ]}
    >
      <Alert
        icon={msg.variant === "success" ? CheckCircle2Icon : AlertCircleIcon}
        variant={msg.variant}
      >
        <AlertTitle>{msg.text}</AlertTitle>
      </Alert>
    </Animated.View>
  );
}
