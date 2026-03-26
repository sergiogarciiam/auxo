import React, { useEffect, useRef } from "react";
import {
  AccessibilityInfo,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { Sizes } from "../constants/theme";
import { useTheme } from "../hooks/useTheme";
import { useSnackbarStore } from "../stores/useSnackbarStore";

export function Snackbar() {
  const colors = useTheme();
  const variantBg: Record<string, string> = {
    success: colors.SUCCESS,
    error: colors.DESTRUCTIVE,
    warning: colors.WARNING,
  };
  const styles = createStyles(colors);
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
        styles.container,
        {
          transform: [{ translateY }],
          opacity: opacity,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => hide(msg.id)}
        style={[styles.snackbar, { backgroundColor: variantBg[msg.variant] }]}
      >
        <Text style={styles.text}>{msg.text}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      position: "absolute",
      left: Sizes.PADDING_LARGE,
      right: Sizes.PADDING_LARGE,
      bottom: 24,
      zIndex: 9999,
    },
    snackbar: {
      padding: 12,
      borderRadius: Sizes.BORDER_RADIUS,
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    text: {
      color: "white",
      fontWeight: "600",
    },
  });
