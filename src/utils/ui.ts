import {
  SNACKBAR_VARIANT_ERROR,
  SNACKBAR_VARIANT_SUCCESS,
  SNACKBAR_VARIANT_WARNING,
} from "../constants/constants";
import { showSnackbar } from "../stores/useSnackbarStore";

export function showErrorMessage(message: string): void {
  try {
    showSnackbar(message, SNACKBAR_VARIANT_ERROR);
  } catch (error) {
    console.error("Failed to show error message:", error);
  }
}

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

export function handleAndShowError(error: unknown): void {
  const message = getErrorMessage(error);
  showErrorMessage(message);
}

export function showSuccessMessage(message: string): void {
  try {
    showSnackbar(message, SNACKBAR_VARIANT_SUCCESS);
  } catch (error) {
    console.error("Failed to show success message:", error);
  }
}

export function showWarningMessage(message: string): void {
  try {
    showSnackbar(message, SNACKBAR_VARIANT_WARNING);
  } catch (error) {
    console.error("Failed to show warning message:", error);
  }
}
