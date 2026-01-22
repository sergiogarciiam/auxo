import { useEffect, useState } from "react";
import { useWorkoutStore } from "../stores/useWorkoutStore";

export const useSectionLifecycle = (initialSectionId?: string) => {
  const { section, loadSection, startNewSection } = useWorkoutStore();

  const [sectionId, setSectionId] = useState<string | null>(
    initialSectionId ?? null,
  );

  useEffect(() => {
    if (sectionId) {
      loadSection(sectionId);
    } else {
      const newSection = startNewSection(`temp-${Date.now()}`);
      if (newSection) setSectionId(newSection.id.toString());
    }
  }, [sectionId, loadSection, startNewSection]);

  return { section, sectionId };
};
