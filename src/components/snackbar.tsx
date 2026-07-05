import { Alert, AlertTitle } from "@/components/ui/alert";
import { Sizes } from "@/lib/theme";
import { AlertCircleIcon, CheckCircle2Icon } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import { AccessibilityInfo, Animated, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SnackbarMessage, useSnackbarStore } from "../stores/useSnackbarStore";

export function Snackbar() {
  const messages = useSnackbarStore((s) => s.messages);
  const hide = useSnackbarStore((s) => s.hide);
  const insets = useSafeAreaInsets();

  const msg: SnackbarMessage = messages[0] || null;

  const translateY = useRef(new Animated.Value(40)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!msg) return;

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
  }, [msg, hide, opacity, translateY]);

  if (!msg) return null;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        left: Sizes.PADDING_LARGE,
        right: Sizes.PADDING_LARGE,
        bottom: insets.bottom + 16,
        zIndex: 9999,
        transform: [{ translateY }],
        opacity,
      }}
    >
      <TouchableOpacity activeOpacity={0.8} onPress={() => hide(msg.id)}>
        <Alert
          icon={msg.variant === "success" ? CheckCircle2Icon : AlertCircleIcon}
          variant={msg.variant === "success" ? "default" : "destructive"}
        >
          <AlertTitle>{msg.text}</AlertTitle>
        </Alert>
      </TouchableOpacity>
    </Animated.View>
  );
}
