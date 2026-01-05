/**
 * UI utilities and helpers
 */
import { showSnackbar } from "../stores/useSnackbarStore";

/**
 * Shows a platform-appropriate error message
 * Uses Toast on Android and Alert on iOS
 */
export function showErrorMessage(message: string): void {
  try {
    showSnackbar(message, "error");
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

/**
 * Shows a platform-appropriate success message
 * Uses Toast on Android and Alert on iOS
 */
export function showSuccessMessage(message: string): void {
  try {
    showSnackbar(message, "success");
  } catch (error) {
    console.error("Failed to show success message:", error);
  }
}

export function showWarningMessage(message: string): void {
  try {
    showSnackbar(message, "warning");
  } catch (error) {
    console.error("Failed to show warning message:", error);
  }
}
