/**
 * ID management utilities
 * Centralizes ID normalization and comparison logic
 * Replaces scattered ID conversions throughout the codebase
 *
 * Problem: IDs are sometimes `number`, sometimes `string`, sometimes `number | string`
 * causing bugs when comparing or using in keys
 *
 * Solution: Always normalize to string for consistent comparisons
 */

export type EntityID = string | number;

/**
 * Normalize any entity ID to string for consistent comparison
 * @param id - ID in any format
 * @returns Normalized string ID
 */
export const normalizeID = (id: EntityID): string => String(id);

/**
 * Create a composite key from multiple IDs
 * Useful for: blockId:exerciseId, workoutId:blockId, etc.
 * @param ids - Variable number of IDs
 * @returns Composite key in format "id1:id2:id3"
 */
export const createCompositeKey = (...ids: EntityID[]): string =>
  ids.map(normalizeID).join(":");

/**
 * Parse a composite key back into individual IDs
 * @param key - Composite key in format "id1:id2:id3"
 * @returns Array of normalized IDs
 */
export const parseCompositeKey = (key: string): string[] => key.split(":");

/**
 * Check if ID is in a list, handling type mismatches
 * Replaces: items.some(item => item.id === id)
 * @param id - ID to search for
 * @param ids - List of IDs to search in
 * @returns true if ID found
 */
export const idIncludes = (id: EntityID, ids: EntityID[]): boolean =>
  ids.some((item) => normalizeID(item) === normalizeID(id));

/**
 * Find item by ID in array, handling type mismatches
 * Replaces: items.find(item => item.id === id)
 * @param id - ID to search for
 * @param items - Items to search
 * @returns Found item or undefined
 */
export const findByID = <T extends { id: EntityID }>(
  id: EntityID,
  items: T[],
): T | undefined =>
  items.find((item) => normalizeID(item.id) === normalizeID(id));

/**
 * Filter items by ID array, handling type mismatches
 * Replaces: items.filter(item => selectedIds.includes(item.id))
 * @param ids - IDs to filter by
 * @param items - Items to filter
 * @returns Filtered items
 */
export const filterByIDs = <T extends { id: EntityID }>(
  ids: EntityID[],
  items: T[],
): T[] => {
  const normalized = ids.map(normalizeID);
  return items.filter((item) => normalized.includes(normalizeID(item.id)));
};

/**
 * Map ID to new format
 * @param id - ID to map
 * @param format - Format to map to ('string' or 'number')
 * @returns Mapped ID
 */
export const mapID = (
  id: EntityID,
  format: "string" | "number",
): string | number => {
  if (format === "string") return normalizeID(id);
  return Number(id);
};

/**
 * Compare two IDs for equality
 * @param id1 - First ID
 * @param id2 - Second ID
 * @returns true if IDs represent same value
 */
export const idEquals = (id1: EntityID, id2: EntityID): boolean =>
  normalizeID(id1) === normalizeID(id2);

/**
 * Create a Record keyed by ID
 * Replaces: Object.fromEntries(items.map(item => [item.id, item]))
 * @param items - Items to create record from
 * @param keyFn - Optional custom key function
 * @returns Record keyed by ID
 */
export const createIDMap = <T extends { id: EntityID }>(
  items: T[],
  keyFn?: (item: T) => string,
): Record<string, T> =>
  Object.fromEntries(
    items.map((item) => [keyFn ? keyFn(item) : normalizeID(item.id), item]),
  );

/**
 * Validate ID format
 * @param id - ID to validate
 * @param allowUndefined - Allow undefined/null
 * @returns true if valid
 */
export const isValidID = (
  id: unknown,
  allowUndefined = false,
): id is EntityID => {
  if (id === undefined || id === null) {
    return allowUndefined;
  }
  return typeof id === "string" || typeof id === "number";
};
