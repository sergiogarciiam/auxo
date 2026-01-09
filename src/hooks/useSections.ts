import { useCallback, useEffect, useState } from "react";
import { sectionRepository } from "../repositories/sectionRepository";
import {
  CreateSectionPayload,
  Section,
  UpdateSectionPayload,
} from "../types/section";

export const useSections = () => {
  const [sections, setSections] = useState<Section[]>([]);

  /**
   * Fetches all sections from database
   */
  const fetchSections = useCallback(async () => {
    try {
      const data = await sectionRepository.getAll();
      setSections(data);
    } catch (error) {
      console.error("Failed to fetch sections:", error);
      throw error;
    }
  }, []);

  /**
   * Fetches all exercises for a section
   */
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

  /**
   * Fetches a specific section by ID
   */
  const getSectionById = useCallback(async (id: number) => {
    try {
      const section = await sectionRepository.getById({ id });
      return section;
    } catch (error) {
      console.error("Failed to fetch section:", error);
      throw error;
    }
  }, []);

  /**
   * Creates a new section
   */
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

  /**
   * Updates an existing section
   */
  const updateSection = useCallback(
    async (sectionData: UpdateSectionPayload) => {
      try {
        await sectionRepository.update(sectionData);
        console.log("Section updated:", sectionData);
        await fetchSections();
      } catch (error) {
        console.error("Failed to update section:", error);
        throw error;
      }
    },
    [fetchSections],
  );

  /**
   * Deletes a section
   */
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

  // Load sections on mount
  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  return {
    sections,
    fetchSections,
    getAllExercisesBySectionId,
    getSectionById,
    createSection,
    updateSection,
    deleteSection,
  };
};
