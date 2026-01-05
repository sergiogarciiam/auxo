import { create } from "zustand";

export type SnackbarVariant = "success" | "error" | "warning";

export type SnackbarMessage = {
  id: number;
  text: string;
  variant: SnackbarVariant;
};

type SnackbarState = {
  messages: SnackbarMessage[];
  show: (text: string, variant?: SnackbarVariant) => number;
  hide: (id: number) => void;
  clear: () => void;
};

export const useSnackbarStore = create<SnackbarState>((set, get) => ({
  messages: [],
  show: (text: string, variant: SnackbarVariant = "success") => {
    const id = Date.now();
    set((s) => ({ messages: [...s.messages, { id, text, variant }] }));
    return id;
  },
  hide: (id: number) => {
    set((s) => ({ messages: s.messages.filter((m) => m.id !== id) }));
  },
  clear: () => set({ messages: [] }),
}));

// Helper for non-hook call sites
export function showSnackbar(
  text: string,
  variant: SnackbarVariant = "success",
) {
  return useSnackbarStore.getState().show(text, variant);
}

export function hideSnackbar(id: number) {
  useSnackbarStore.getState().hide(id);
}
