import { Alert, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon, CheckCircle2Icon } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import { AccessibilityInfo, Animated } from "react-native";
import { Sizes } from "../constants/theme";
import { SnackbarMessage, useSnackbarStore } from "../stores/useSnackbarStore";
import { SnackbarVariant } from "../types/ui";

export function Snackbar() {
  const messages = useSnackbarStore((s: any) => s.messages);
  const hide = useSnackbarStore((s: any) => s.hide);

  const msg: SnackbarMessage = messages[0] || null;

  const translateY = useRef(new Animated.Value(40)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const COLORS: Record<SnackbarVariant, string> = {
    success: "#15803d",
    error: "#b91c1c",
    warning: "#f59e0b",
  };

  useEffect(() => {
    if (!msg) return;

    // reset ANTES de animar (esto es lo importante)
    translateY.setValue(40);
    opacity.setValue(0);

    AccessibilityInfo.announceForAccessibility(msg.text);

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();

    const timeout = setTimeout(() => {
      hide(msg.id);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [msg?.id]);

  if (!msg) return null;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        left: Sizes.PADDING_LARGE,
        right: Sizes.PADDING_LARGE,
        bottom: 65,
        zIndex: 9999,
        transform: [{ translateY }],
        opacity,
      }}
    >
      <Alert
        icon={msg.variant === "success" ? CheckCircle2Icon : AlertCircleIcon}
        variant={msg.variant === "success" ? "default" : "destructive"}
        style={{ backgroundColor: COLORS[msg.variant] }}
      >
        <AlertTitle>{msg.text}</AlertTitle>
      </Alert>
    </Animated.View>
  );
}
