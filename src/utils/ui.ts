/**
 * UI utilities and helpers
 */
import { Alert, Platform, ToastAndroid } from "react-native";

/**
 * Shows a platform-appropriate error message
 * Uses Toast on Android and Alert on iOS
 */
export function showErrorMessage(message: string): void {
  try {
    if (Platform.OS === "android") {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert("Error", message);
    }
  } catch (error) {
    console.error("Failed to show error message:", error);
  }
}

/**
 * Extracts error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as any).message);
  }

  return "An unknown error occurred";
}

/**
 * Combines showErrorMessage and getErrorMessage
 */
export function handleAndShowError(error: unknown): void {
  const message = getErrorMessage(error);
  showErrorMessage(message);
}
