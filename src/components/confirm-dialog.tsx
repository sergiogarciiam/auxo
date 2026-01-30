import React from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Sizes, Spacing } from "../constants/theme";
import { useTheme } from "../hooks/useTheme";

interface ConfirmDialogProps {
  visible: boolean;
  title?: string;
  message?: string;
  cancelText?: string;
  confirmText?: string;
  destructive?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  cancelText = "Cancel",
  confirmText = "OK",
  destructive = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  const colors = useTheme();

  return (
    <Modal transparent visible={visible} animationType="fade">
      <Pressable style={styles.overlay} onPress={onCancel}>
        <View
          style={[
            styles.container,
            {
              backgroundColor: colors.BACKGROUND,
              shadowColor: colors.SHADOW_COLOR,
            },
          ]}
        >
          {title ? (
            <Text style={[styles.title, { color: colors.TEXT_PRIMARY }]}>
              {title}
            </Text>
          ) : null}
          {message ? (
            <Text style={[styles.message, { color: colors.TEXT_SECONDARY }]}>
              {message}
            </Text>
          ) : null}

          <View style={styles.actionsRow}>
            <Pressable style={styles.action} onPress={onCancel}>
              <Text style={[styles.cancelText, { color: colors.PRIMARY }]}>
                {" "}
                {cancelText}{" "}
              </Text>
            </Pressable>

            <Pressable style={styles.action} onPress={onConfirm}>
              <Text
                style={[
                  styles.confirmText,
                  { color: destructive ? colors.DESTRUCTIVE : colors.PRIMARY },
                ]}
              >
                {confirmText}
              </Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.DOUBLE_EXTRA_LARGE,
  },
  container: {
    minWidth: 280,
    borderRadius: Sizes.BORDER_RADIUS_LARGE,
    padding: Sizes.PADDING_LARGE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: Platform.OS === "android" ? 6 : 0,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    marginBottom: 16,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: Spacing.MEDIUM as any,
  },
  action: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "500",
  },
  confirmText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ConfirmDialog;
