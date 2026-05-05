import { Sizes, Spacing, Typography } from "@/lib/theme";
import { StyleSheet } from "react-native";

export const createExerciseCardStyles = (colors: any) =>
  StyleSheet.create({
    input: {
      borderWidth: Sizes.BORDER_WIDTH,
      borderColor: colors.BORDER,
      backgroundColor: colors.LIGHT_BACKGROUND,
      borderRadius: Sizes.BORDER_RADIUS,
      padding: Sizes.PADDING,
      fontSize: Typography.FONT_SIZE_DEFAULT,
      color: colors.TEXT_PRIMARY,
    },
    arrowsRow: {
      width: "100%",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: Spacing.MEDIUM,
    },
    arrowButton: {
      flex: 1,
      borderRadius: Sizes.BORDER_RADIUS,
      justifyContent: "center",
      alignItems: "center",
    },
    removeButton: {
      position: "absolute",
      top: 6,
      right: 6,
    },
  });
