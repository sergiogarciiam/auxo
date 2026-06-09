/**
 * Reusable deletion hook with confirmation dialog
 * Handles: confirmation UI, error handling, loading state, optimistic updates
 *
 * Usage:
 * const { deleteAndConfirm, isDeleting } = useDeletion(repository, onSuccess);
 * await deleteAndConfirm(id, "Delete this item?");
 */

import { useCallback, useRef, useState } from "react";
import { useDialogState } from "./useDialogState";

export interface DeletionConfig {
  title?: string;
  message?: string;
  onSuccess?: (id: string | number) => void;
  onError?: (error: Error) => void;
  entityName?: string;
}

/**
 * Generic deletion hook with confirmation
 * @param repository - Object with delete(params: { id }) method
 * @param defaultConfig - Default configuration for deletion dialogs
 */
export function useDeletion<
  T extends { delete: (params: { id: unknown }) => Promise<void> },
>(repository: T, defaultConfig: DeletionConfig = {}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDialog, confirmDialogActions] = useDialogState({
    type: "confirm",
  });

  const entityName = defaultConfig.entityName || "item";
  const pendingIdRef = useRef<string | number | null>(null);

  const handleConfirmDelete = useCallback(async () => {
    const id = pendingIdRef.current;
    if (id === null) return;

    setIsDeleting(true);
    try {
      await repository.delete({ id });
      confirmDialogActions.close();

      if (defaultConfig.onSuccess) {
        defaultConfig.onSuccess(id);
      }

      pendingIdRef.current = null;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error(`Failed to delete ${entityName}:`, err);

      if (defaultConfig.onError) {
        defaultConfig.onError(err);
      }
    } finally {
      setIsDeleting(false);
    }
  }, [repository, confirmDialogActions, defaultConfig, entityName]);

  const deleteAndConfirm = useCallback(
    async (id: string | number, message?: string, title?: string) => {
      pendingIdRef.current = id;

      confirmDialogActions.open({
        title: title || `Delete ${entityName}?`,
        message:
          message || `Are you sure you want to delete this ${entityName}?`,
        type: "confirm",
      });
    },
    [confirmDialogActions, entityName],
  );

  return {
    // Dialog state
    confirmDialog,
    confirmDialogActions,

    // Deletion handler
    deleteAndConfirm,
    handleConfirmDelete,

    // Loading state
    isDeleting,

    // Reset state
    reset: () => {
      confirmDialogActions.reset();
      pendingIdRef.current = null;
      setIsDeleting(false);
    },
  };
}
