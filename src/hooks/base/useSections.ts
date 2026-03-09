import { useCallback, useEffect, useState } from "react";
import { exerciseRepository } from "../../repositories/exerciseRepository";
import { sectionRepository } from "../../repositories/sectionRepository";
import {
  CreateSectionPayload,
  Section,
  UpdateSectionPayload,
} from "../../types/section";

export const useSections = () => {
  const [sections, setSections] = useState<Section[]>([]);

  const fetchSections = useCallback(async () => {
    try {
      const data = await sectionRepository.getAll();
      setSections(data);
    } catch (error) {
      console.error("Failed to fetch sections:", error);
      throw error;
    }
  }, []);

  const getSectionById = useCallback(async (id: number) => {
    try {
      const section = await sectionRepository.getById({ id });
      return section;
    } catch (error) {
      console.error("Failed to fetch section:", error);
      throw error;
    }
  }, []);

  const createSection = useCallback(
    async (sectionData: CreateSectionPayload) => {
      try {
        const result = await sectionRepository.create(sectionData);
        await fetchSections();
        return result.lastInsertRowId;
      } catch (error) {
        console.error("Failed to create section:", error);
        throw error;
      }
    },
    [fetchSections],
  );

  const updateSection = useCallback(
    async (sectionData: UpdateSectionPayload) => {
      try {
        await sectionRepository.update(sectionData);
        await fetchSections();
      } catch (error) {
        console.error("Failed to update section:", error);
        throw error;
      }
    },
    [fetchSections],
  );

  const deleteSection = useCallback(
    async (id: number) => {
      try {
        await sectionRepository.delete({ id });
        await fetchSections();
      } catch (error) {
        console.error("Failed to delete section:", error);
        throw error;
      }
    },
    [fetchSections],
  );

  const getAllExercisesBySectionId = useCallback(async (section_id: number) => {
    try {
      const exercises = await sectionRepository.getAllExercisesBySectionId({
        section_id,
      });
      return exercises;
    } catch (error) {
      console.error("Failed to fetch exercises:", error);
      throw error;
    }
  }, []);

  const addExerciseToSection = useCallback(
    async (sectionId: number, exerciseId: number, position: number) => {
      try {
        await exerciseRepository.addToSection({
          section_id: sectionId,
          exercise_id: exerciseId,
          position,
        });
      } catch (error) {
        console.error("Failed to add exercise to section:", error);
        throw error;
      }
    },
    [],
  );

  const removeExerciseFromSection = useCallback(
    async (sectionId: number, exerciseId: number) => {
      try {
        await exerciseRepository.removeFromSection({
          section_id: sectionId,
          exercise_id: exerciseId,
        });
      } catch (error) {
        console.error("Failed to remove exercise from section:", error);
        throw error;
      }
    },
    [],
  );

  const updateExercisePositionInSection = useCallback(
    async (sectionId: number, exerciseId: number, position: number) => {
      try {
        await exerciseRepository.updatePositionInSection({
          section_id: sectionId,
          exercise_id: exerciseId,
          position,
        });
      } catch (error) {
        console.error("Failed to update exercise position:", error);
        throw error;
      }
    },
    [],
  );

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  return {
    sections,
    fetchSections,
    getSectionById,
    createSection,
    updateSection,
    deleteSection,
    getAllExercisesBySectionId,
    addExerciseToSection,
    removeExerciseFromSection,
    updateExercisePositionInSection,
  };
};
