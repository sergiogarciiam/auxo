/**
 * Reusable hook for managing dialog state
 * Eliminates repeated useState calls across multiple components
 *
 * Usage:
 * const deleteDialog = useDialogState();
 * const confirmDialog = useDialogState({ initialOpen: false });
 */

import { useCallback, useState } from "react";

export interface DialogState {
  isOpen: boolean;
  title?: string;
  message?: string;
  type?: "confirm" | "info" | "warning" | "error";
  data?: unknown; // Attach any custom data to dialog
}

export interface DialogActions {
  open: (config?: Partial<Omit<DialogState, "isOpen">>) => void;
  close: () => void;
  reset: () => void;
  setData: (data: unknown) => void;
}

const defaultState: DialogState = {
  isOpen: false,
};

/**
 * Manages dialog state and provides simple open/close/reset interface
 * @param initialState - Initial dialog state
 * @returns [state, actions]
 */
export function useDialogState(
  initialState?: Partial<DialogState>,
): [DialogState, DialogActions] {
  const [state, setState] = useState<DialogState>({
    ...defaultState,
    ...initialState,
  });

  const open = useCallback((config?: Partial<Omit<DialogState, "isOpen">>) => {
    setState((prev) => ({
      ...prev,
      ...config,
      isOpen: true,
    }));
  }, []);

  const close = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      ...defaultState,
      ...initialState,
    });
  }, [initialState]);

  const setData = useCallback((data: unknown) => {
    setState((prev) => ({
      ...prev,
      data,
    }));
  }, []);

  return [
    state,
    {
      open,
      close,
      reset,
      setData,
    },
  ];
}

/**
 * Multiple dialog state management
 * Useful for screens with multiple dialogs
 *
 * Usage:
 * const dialogs = useMultipleDialogs(['delete', 'create', 'edit']);
 * // Access: dialogs.delete.state, dialogs.delete.open(), etc.
 */
export function useMultipleDialogs<T extends readonly string[]>(
  names: T,
): Record<
  T[number],
  {
    state: DialogState;
    open: (config?: Partial<Omit<DialogState, "isOpen">>) => void;
    close: () => void;
    reset: () => void;
    setData: (data: unknown) => void;
  }
> {
  const [state, actions] = useDialogState();
  const dialogStates = names.reduce(
    (acc, name) => {
      acc[name as T[number]] = { state, ...actions };
      return acc;
    },
    {} as Record<
      T[number],
      {
        state: DialogState;
        open: (config?: Partial<Omit<DialogState, "isOpen">>) => void;
        close: () => void;
        reset: () => void;
        setData: (data: unknown) => void;
      }
    >,
  );

  return dialogStates;
}
