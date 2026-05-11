/**
 * Common type definitions and aliases used throughout the application
 * Replaces scattered `any` types with proper, maintainable interfaces
 */

// ============================================================================
// Form & Input Components
// ============================================================================

/** Generic select option with label and value */
export interface SelectOption<T = string | number> {
  label: string;
  value: T;
}

/** Form field validation error */
export interface FormFieldError {
  field: string;
  message: string;
}

/** Generic form values object */
export type FormValues = Record<
  string,
  string | number | boolean | null | undefined
>;

/** Handler for form value changes */
export type FormChangeHandler<T extends FormValues = FormValues> = (
  key: keyof T,
  value: T[keyof T],
) => void;

// ============================================================================
// UI & Components
// ============================================================================

/** Dialog state management */
export interface DialogState {
  isOpen: boolean;
  type?: "confirm" | "info" | "warning" | "error";
  title?: string;
  message?: string;
}

/** Drag and drop event data */
export interface DragDropData {
  id: string | number;
  type: "workout" | "block" | "exercise";
  fromIndex: number;
  toIndex: number;
}

/** Theme and styling colors from useTheme hook */
export type ThemeColors = Record<string, string | Record<string, string>>;

// ============================================================================
// Async & API Handlers
// ============================================================================

/** Generic async operation handler result */
export interface AsyncResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  isLoading?: boolean;
}

/** Handler for async operations with loading state */
export type AsyncHandler<TArgs extends unknown[] = [], TReturn = void> = (
  ...args: TArgs
) => Promise<TReturn> | void;

// ============================================================================
// Entity IDs
// ============================================================================

/** Flexible ID type used throughout app - normalized to string in comparisons */
export type EntityID = string | number;

/** Helper to normalize entity IDs for consistent comparison */
export const normalizeID = (id: EntityID): string => String(id);

/** Helper to create composite keys (e.g., blockId:exerciseId) */
export const createCompositeKey = (...ids: EntityID[]): string =>
  ids.map(normalizeID).join(":");

// ============================================================================
// Collection/List Handlers
// ============================================================================

/** Handler for reordering items in a list */
export interface ReorderEvent {
  fromIndex: number;
  toIndex: number;
}

export type ReorderHandler = (event: ReorderEvent) => void;

/** Handler for deleting item from collection */
export type DeleteHandler = (id: EntityID) => Promise<void> | void;

/** Handler for updating item in collection */
export type UpdateHandler<T> = (
  id: EntityID,
  updates: Partial<T>,
) => Promise<void> | void;

/** Handler for creating new item in collection */
export type CreateHandler<T> = (data: T) => Promise<void> | void;

// ============================================================================
// Navigation & Routing
// ============================================================================

/** Navigation parameters object */
export type NavigationParams = Record<
  string,
  string | number | boolean | undefined
>;

/** Handler for navigation with params */
export type NavigationHandler<T extends NavigationParams = NavigationParams> = (
  params?: T,
) => void;

// ============================================================================
// Array/List Utilities
// ============================================================================

/** Item with index - useful for list rendering */
export interface IndexedItem<T> {
  item: T;
  index: number;
}

/** Handler for list item operations */
export type ListItemHandler<T> = (item: T, index: number) => void;
