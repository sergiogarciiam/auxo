/**
 * Generic CRUD hook factory
 * Eliminates repeated code across useWorkouts, useBlocks, useExercises
 *
 * Usage:
 * export const useMyEntity = createCRUDHook(myRepository, "MyEntity")
 */

import { useCallback, useState } from "react";

export interface Repository<
  TEntity extends { id: number | string },
  TCreatePayload,
  TUpdatePayload,
> {
  getAll?(): Promise<TEntity[]>;
  getById?(params: { id: number | string }): Promise<TEntity | null>;
  create(data: TCreatePayload): Promise<{ lastInsertRowId: number | string }>;
  update(data: TUpdatePayload): Promise<void>;
  delete(params: { id: number | string }): Promise<void>;
}

export interface CRUDHookOptions {
  entityName?: string;
  onError?: (error: Error, operation: string) => void;
}

/**
 * Creates a custom CRUD hook for any entity type
 * @param repository - Implementation of Repository interface
 * @param options - Configuration options
 * @returns Hook function with all CRUD operations
 */
export function createCRUDHook<
  TEntity extends { id: number | string },
  TCreatePayload,
  TUpdatePayload,
>(
  repository: Repository<TEntity, TCreatePayload, TUpdatePayload>,
  options: CRUDHookOptions = {},
) {
  const { entityName = "Entity", onError } = options;

  return function useCRUD() {
    const [items, setItems] = useState<TEntity[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleError = useCallback((error: unknown, operation: string) => {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error(`Failed to ${operation} ${entityName}:`, err);

      if (onError) {
        onError(err, operation);
      }

      throw err;
    }, []);

    const fetchItems = useCallback(async () => {
      setIsLoading(true);
      try {
        const data = await repository.getAll?.();
        setItems(data || []);
        return data || [];
      } catch (error) {
        handleError(error, "fetch");
      } finally {
        setIsLoading(false);
      }
    }, [handleError]);

    const getItemById = useCallback(
      async (id: number | string) => {
        try {
          return await repository.getById?.({ id });
        } catch (error) {
          handleError(error, "fetch single");
          return null;
        }
      },
      [handleError],
    );

    const createItem = useCallback(
      async (data: TCreatePayload): Promise<number | string> => {
        try {
          const result = await repository.create(data);
          await fetchItems();
          return result.lastInsertRowId;
        } catch (error) {
          handleError(error, "create");
          throw error;
        }
      },
      [handleError, fetchItems],
    );

    const updateItem = useCallback(
      async (data: TUpdatePayload): Promise<void> => {
        try {
          await repository.update(data);
          await fetchItems();
        } catch (error) {
          handleError(error, "update");
          throw error;
        }
      },
      [handleError, fetchItems],
    );

    const deleteItem = useCallback(
      async (id: number | string): Promise<void> => {
        try {
          await repository.delete({ id });
          await fetchItems();
        } catch (error) {
          handleError(error, "delete");
          throw error;
        }
      },
      [handleError, fetchItems],
    );

    // Optimistic update for immediate UI feedback
    const updateItemOptimistic = useCallback(
      async (id: number | string, updates: Partial<TEntity>) => {
        const originalItems = items;
        try {
          // Optimistically update local state
          setItems((prev) =>
            prev.map((item) =>
              item.id === id ? { ...item, ...updates } : item,
            ),
          );

          // Then sync with repository
          await repository.update({
            id,
            ...updates,
          } as TUpdatePayload);
        } catch (error) {
          // Revert on error
          setItems(originalItems);
          handleError(error, "update");
        }
      },
      [items, handleError],
    );

    return {
      items,
      isLoading,
      fetchItems,
      getItemById,
      createItem,
      updateItem,
      updateItemOptimistic,
      deleteItem,
    };
  };
}
