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

interface InfoDialogProps {
  visible: boolean;
  title?: string;
  message?: string;
  onCancel: () => void;
}

export function InfoDialog({
  visible,
  title,
  message,
  onCancel,
}: InfoDialogProps) {
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
          {/* Botón X para cerrar */}
          <Pressable style={[styles.closeButton]} onPress={onCancel}>
            <Text
              style={[styles.closeButtonText, { color: colors.TEXT_PRIMARY }]}
            >
              ✕
            </Text>
          </Pressable>

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
    position: "relative", // importante para posicionar la X
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
  closeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default InfoDialog;
