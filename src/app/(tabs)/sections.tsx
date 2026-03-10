import { useLoadSection } from "@/src/hooks/other/useLoad";
import { MaterialIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Card } from "../../components/card";
import { ConfirmDialog } from "../../components/confirm-dialog";
import { ThemedButton } from "../../components/themed-button";
import { ThemedText } from "../../components/themed-text";
import { IconSizes, Sizes, Spacing } from "../../constants/theme";
import { useSections } from "../../hooks/base/useSections";
import { useTheme } from "../../hooks/useTheme";
import { useSectionStore } from "../../stores/useSectionStore";
import { transformSectionToUI } from "../../utils/transformers";
import { handleAndShowError } from "../../utils/ui";

export default function Sections() {
  const router = useRouter();
  const colors = useTheme();
  const { localSections, loadSections, loadSection, reset } = useSectionStore();
  const { sections, deleteSection } = useSections();
  const loadSectionWithData = useLoadSection();

  useEffect(() => {
    loadSections(
      sections.map((section: any) => transformSectionToUI(section, [])),
    );
  }, [sections, loadSections]);

  const handleCreateSection = useCallback(() => {
    reset();
    router.push("/section-form");
  }, [reset, router]);

  const handleEditSection = useCallback(
    async (id: number) => {
      try {
        reset();
        const section = await loadSectionWithData(id);
        loadSection(section);
        router.push("/section-form");
      } catch (error) {
        handleAndShowError(error);
      }
    },
    [loadSectionWithData, loadSection, reset, router],
  );

  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<number | null>(null);

  const handleDeleteSection = useCallback((id: number) => {
    setSectionToDelete(id);
    setDeleteConfirmVisible(true);
  }, []);

  const doDeleteSection = useCallback(async () => {
    setDeleteConfirmVisible(false);
    if (sectionToDelete === null) return;
    try {
      await deleteSection(Number(sectionToDelete));
    } catch (error) {
      handleAndShowError(error);
    }
  }, [sectionToDelete, deleteSection]);

  const hasSections = localSections.filter(Boolean).length > 0;

  return (
    <>
      <Stack.Screen
        options={{
          title: "Sections",
        }}
      />
      <ScrollView contentContainerStyle={createStyles(colors).container}>
        {hasSections ? (
          localSections
            .filter(Boolean)
            .map((section: any, index: number) => (
              <Card
                key={section.id || `tmp-${index}`}
                onEdit={() => section.id && handleEditSection(section.id)}
                onDelete={() => section.id && handleDeleteSection(section.id)}
                text={section.name}
                index={index}
                isDisabledPrev={index === 0}
                isDisabledNext={index === localSections.length - 1}
              />
            ))
        ) : (
          <ThemedText>No sections yet. Create one to get started!</ThemedText>
        )}

        <ThemedButton
          text="New Section"
          icon={
            <MaterialIcons
              name="add"
              size={IconSizes.SMALL}
              color={colors.PRIMARY_ICON_COLOR}
            />
          }
          onPress={handleCreateSection}
        />
      </ScrollView>
      <ConfirmDialog
        visible={deleteConfirmVisible}
        title="Remove section?"
        message="Are you sure you want to remove this section?"
        onCancel={() => setDeleteConfirmVisible(false)}
        onConfirm={doDeleteSection}
        cancelText="Cancel"
        confirmText="Delete"
        destructive
      />
    </>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      padding: Sizes.PADDING_LARGE,
      gap: Spacing.LARGE,
      backgroundColor: colors.BACKGROUND_SECONDARY,
      flexGrow: 1,
    },
  });
