import { create } from "zustand";
import { LOCAL_STATUS_UNCHANGED } from "../constants/constants";
import { UISection } from "../types/ui";
import { createTempSection } from "../utils/workout-store-utils";

interface SectionStore {
  localSections: UISection[];

  section: UISection | null;

  loadSections: (sections: UISection[]) => void;

  loadSection: (section: UISection) => void;
  startNewSection: () => void;

  reset: () => void;
}

export const useSectionStore = create<SectionStore>((set, get) => ({
  localSections: [],

  section: null,

  loadSections: (sections) => set({ localSections: sections }),

  startNewSection: () => {
    const state = get();

    return set({
      section: createTempSection(
        state.localSections.length.toString(),
        state.localSections.length,
      ),
    });
  },

  loadSection: (sectionFromDb) =>
    set({
      section: {
        ...sectionFromDb,
        localStatus: LOCAL_STATUS_UNCHANGED,
      },
    }),

  reset: () => set({ section: null }),
}));
