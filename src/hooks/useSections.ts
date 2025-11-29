import { useEffect, useState } from "react";
import { sectionRepository } from "../repositories/sectionRepository";
import {
  CreateSectionInterface,
  SectionIdType,
  SectionInterface,
  UpdateSectionInterface,
} from "../types/section";

export const useSections = () => {
  const [sections, setSections] = useState<SectionInterface[]>([]);

  const fetchSections = async () => {
    const data = await sectionRepository.getAll();
    setSections(data);
  };

  const getSectionByWorkoutId = async (workout_id: number) => {
    const sections = await sectionRepository.getByWorkoutId({ workout_id });
    return sections;
  };

  const getSectionById = async (id: number) => {
    const section = await sectionRepository.getById({ id });
    return section;
  };

  const createSection = async (sectionData: CreateSectionInterface) => {
    await sectionRepository.create(sectionData);
    await fetchSections();
  };

  const updateSection = async (sectionData: UpdateSectionInterface) => {
    await sectionRepository.update(sectionData);
    await fetchSections();
  };

  const deleteSection = async ({ id }: SectionIdType) => {
    await sectionRepository.delete({ id });
    await fetchSections();
  };

  useEffect(() => {
    fetchSections();
  }, []);

  return {
    sections,
    fetchSections,
    getSectionByWorkoutId,
    getSectionById,
    createSection,
    updateSection,
    deleteSection,
  };
};
