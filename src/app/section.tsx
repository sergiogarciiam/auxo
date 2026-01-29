import { MaterialIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useRef } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { ExerciseCard } from "../components/exercise-card";
import { Field } from "../components/field";
import { Header } from "../components/header";
import { ThemedButton } from "../components/themed-button";
import { ThemedText } from "../components/themed-text";
import { TimeInput } from "../components/time-input";
import {
  CIRCUIT_TYPE,
  LOCAL_STATUS_NEW,
  SECTION_TYPE_LABELS,
  SECTION_TYPES,
  SUPERSET_TYPE,
} from "../constants/constants";
import { IconSizes, Sizes, Spacing, Typography } from "../constants/theme";
import { useOrderedExercises } from "../hooks/other/useOrdererExercises";
import { useSectionLifecycle } from "../hooks/other/useSectionLifecycle";
import { useTheme } from "../hooks/useTheme";
import { useWorkoutStore } from "../stores/useWorkoutStore";
import { UISection } from "../types/ui";
import { swapItems } from "../utils/reorder";
import { handleAndShowError, showSuccessMessage } from "../utils/ui";
import { validateSection } from "../utils/validation";

export default function SectionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colors = useTheme();
  const initialSectionRef = useRef<UISection | null>(null);

  const {
    updateSection,
    removeSection,
    addExercise,
    updateExercise,
    removeExercise,
  } = useWorkoutStore();

  const { section, sectionId } = useSectionLifecycle(
    params.sectionId as string | undefined,
  );
  const localExercises = useOrderedExercises(section);

  const handleAddExercise = useCallback(() => {
    try {
      addExercise(sectionId as string);
    } catch (error) {
      handleAndShowError(error);
    }
  }, [sectionId, addExercise]);

  const handleMovePrevExercise = (index: number) => {
    const reordered = swapItems(localExercises, index, index - 1);

    reordered.forEach((e, idx) => {
      updateExercise(sectionId!, e.id, { position: idx });
    });
  };

  const handleMoveNextExercise = (index: number) => {
    const reordered = swapItems(localExercises, index, index + 1);

    reordered.forEach((e, idx) => {
      updateExercise(sectionId!, e.id, { position: idx });
    });
  };

  const handleUpdateSection = useCallback(
    (data: any) => {
      try {
        if (!sectionId) return;
        updateSection(sectionId.toString(), data);
      } catch (error) {
        handleAndShowError(error);
      }
    },
    [sectionId, updateSection],
  );

  const handleDeleteSection = useCallback(() => {
    Keyboard.dismiss();

    Alert.alert(
      "Remove section?",
      "Are you sure you want to remove this section?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              removeSection(sectionId as string);
              router.replace("/workout");
              showSuccessMessage("Section deleted");
            } catch (error) {
              handleAndShowError(error);
            }
          },
        },
      ],
    );
  }, [sectionId, removeSection, router]);

  const isCreating = section?.id?.toString().startsWith("temp-") || false;

  const handleDone = useCallback(() => {
    Keyboard.dismiss();

    try {
      const currentSection = useWorkoutStore.getState().section;
      const validationError = validateSection(currentSection as UISection);
      if (validationError) {
        throw new Error(validationError);
      }
      router.replace("/workout");
      showSuccessMessage("Section saved");
    } catch (error) {
      handleAndShowError(error);
    }
  }, [router]);

  const handleDiscard = useCallback(() => {
    Keyboard.dismiss();

    Alert.alert(
      "Discard changes?",
      "Are you sure you want to discard changes to this section?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Discard",
          style: "destructive",
          onPress: () => {
            try {
              if (section?.localStatus === LOCAL_STATUS_NEW) {
                removeSection(sectionId as string);
              } else if (initialSectionRef.current) {
                if (!sectionId) return;
                updateSection(sectionId.toString(), initialSectionRef.current);
              }
              router.replace("/workout");
            } catch (error) {
              handleAndShowError(error);
            }
          },
        },
      ],
    );
  }, [section, sectionId, removeSection, updateSection, router]);

  if (!section) return null;

  const isCircuitOrSuperset =
    section.type === CIRCUIT_TYPE || section.type === SUPERSET_TYPE;

  return (
    <>
      <Stack.Screen
        options={{
          title: "Section",
          headerRight: () => (
            <Header
              handleDiscard={handleDiscard}
              handleDelete={handleDeleteSection}
              handleDone={handleDone}
              isCreating={isCreating}
            />
          ),
        }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={createStyles(colors).container}>
            <View style={createStyles(colors).card}>
              <Field label="Section name">
                <TextInput
                  style={createStyles(colors).input}
                  value={section.name}
                  onChangeText={(text) => handleUpdateSection({ name: text })}
                  accessibilityLabel="Section name input"
                />
              </Field>

              <Field label="Section type">
                <View style={createStyles(colors).pickerContainer}>
                  <Picker
                    selectedValue={section.type}
                    onValueChange={(value) =>
                      handleUpdateSection({ type: value })
                    }
                    accessibilityLabel="Section type picker"
                    itemStyle={createStyles(colors).pickerItem}
                  >
                    <Picker.Item
                      label="Select Type"
                      value=""
                      style={createStyles(colors).pickerItem}
                    />
                    {SECTION_TYPES.map((type) => (
                      <Picker.Item
                        key={type}
                        label={SECTION_TYPE_LABELS[type]}
                        value={type}
                        style={createStyles(colors).pickerItem}
                      />
                    ))}
                  </Picker>
                </View>
              </Field>

              <Field label="Prepare time">
                <TimeInput
                  value={section.prepare_time}
                  onChange={(seconds) =>
                    handleUpdateSection({ prepare_time: seconds })
                  }
                />
              </Field>

              <Field label="Rest between exercises">
                <TimeInput
                  value={section.rest_exercise}
                  onChange={(seconds) =>
                    handleUpdateSection({
                      rest_exercise: seconds,
                    })
                  }
                />
              </Field>

              <Field label={`Rest between ${section.type || "group"}`}>
                <TimeInput
                  disabled={!isCircuitOrSuperset}
                  value={section.rest_group}
                  onChange={(seconds) =>
                    handleUpdateSection({
                      rest_group: seconds,
                    })
                  }
                />
              </Field>
            </View>

            <ThemedText type="subtitle">Exercises</ThemedText>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={createStyles(colors).exercisesScroll}
            >
              {localExercises.map((exercise, index) => (
                <View
                  key={exercise.id}
                  style={createStyles(colors).exerciseWrapper}
                >
                  <ExerciseCard
                    exercise={exercise}
                    exerciseId={exercise.id}
                    index={index}
                    handleMovePrev={handleMovePrevExercise}
                    handleMoveNext={handleMoveNextExercise}
                    isDisabledPrev={index === 0}
                    isDisabledNext={index === localExercises.length - 1}
                    setExercise={(exerciseId, ex) => {
                      updateExercise(sectionId as string, exerciseId, ex);
                    }}
                    onRemoveExercise={() =>
                      removeExercise(sectionId as string, exercise.id)
                    }
                  />
                </View>
              ))}

              <View style={createStyles(colors).newExerciseButtonContainer}>
                <ThemedButton
                  text="New Exercise"
                  icon={
                    <MaterialIcons
                      name="add"
                      size={IconSizes.SMALL}
                      color={colors.PRIMARY_ICON_COLOR}
                    />
                  }
                  onPress={handleAddExercise}
                />
              </View>
            </ScrollView>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      padding: Sizes.PADDING_LARGE,
      gap: Spacing.DOUBLE_EXTRA_LARGE,
      backgroundColor: colors.BACKGROUND_SECONDARY,
      flexGrow: 1,
    },
    card: {
      padding: Sizes.PADDING_LARGE,
      backgroundColor: colors.BACKGROUND,
      borderRadius: Sizes.BORDER_RADIUS_LARGE,
      borderWidth: Sizes.BORDER_WIDTH,
      borderColor: colors.BORDER,
      gap: Spacing.LARGE,
    },
    input: {
      borderWidth: Sizes.BORDER_WIDTH,
      borderColor: colors.BORDER,
      padding: Sizes.PADDING,
      color: colors.TEXT_PRIMARY,
      borderRadius: Sizes.BORDER_RADIUS,
      backgroundColor: colors.LIGHT_BACKGROUND,
      fontSize: Typography.FONT_SIZE_DEFAULT,
    },
    inputDisabled: {
      backgroundColor: colors.DISABLED_BACKGROUND,
      borderColor: colors.BORDER,
      color: colors.DISABLED_TEXT,
    },
    pickerContainer: {
      borderWidth: Sizes.BORDER_WIDTH,
      borderColor: colors.BORDER,
      borderRadius: Sizes.BORDER_RADIUS,
      backgroundColor: colors.LIGHT_BACKGROUND,
      color: colors.TEXT_PRIMARY,
      overflow: "hidden",
    },
    pickerItem: {
      color: colors.TEXT_PRIMARY,
      backgroundColor: colors.PICKER_BACKGROUND,
    },
    exercisesScroll: {
      paddingVertical: Spacing.MEDIUM,
    },
    exerciseWrapper: {
      marginRight: Spacing.LARGE,
      width: 320,
    },
    exerciseAddButton: {
      justifyContent: "center",
      alignItems: "center",
      alignSelf: "center",
    },
    newExerciseButtonContainer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: Spacing.LARGE,
    },
  });
