import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import {
  Colors,
  IconColors,
  IconSizes,
  Sizes,
  Spacing,
} from "../constants/theme";
import { ThemedButton } from "./themed-button";

interface CardProps {
  text: string;
  onPlay?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  index: number;
  handleMovePrev: (index: number) => void;
  handleMoveNext: (index: number) => void;
  isDisabledPrev?: boolean;
  isDisabledNext?: boolean;
}

/**
 * Reusable card component for displaying workout/section information
 */
export function Card({
  text,
  onPlay,
  onEdit,
  onDelete,
  index,
  handleMovePrev,
  handleMoveNext,
  isDisabledPrev,
  isDisabledNext,
}: CardProps) {
  return (
    <View style={styles.card}>
      <Text>{text}</Text>

      <View style={styles.rightContainer}>
        <View style={styles.buttonsContainer}>
          {onPlay && (
            <ThemedButton
              icon={
                <MaterialIcons
                  name="play-arrow"
                  size={IconSizes.MEDIUM}
                  color={IconColors.ON_PRIMARY}
                />
              }
              onPress={onPlay}
            />
          )}
          {onEdit && (
            <ThemedButton
              icon={
                <MaterialIcons
                  name="edit"
                  size={IconSizes.MEDIUM}
                  color={IconColors.ON_PRIMARY}
                />
              }
              onPress={onEdit}
            />
          )}
          {onDelete && (
            <ThemedButton
              icon={
                <MaterialIcons
                  name="delete"
                  size={IconSizes.MEDIUM}
                  color={IconColors.ON_PRIMARY}
                />
              }
              onPress={onDelete}
              variant="destructive"
            />
          )}
        </View>

        <View style={styles.arrwosContainer}>
          <ThemedButton
            icon={
              <MaterialIcons
                name="keyboard-arrow-up"
                size={IconSizes.LARGE}
                color={IconColors.ON_PRIMARY}
              />
            }
            variant="icon"
            disabled={isDisabledPrev}
            onPress={() => handleMovePrev(index)}
          />
          <ThemedButton
            icon={
              <MaterialIcons
                name="keyboard-arrow-down"
                size={IconSizes.LARGE}
                color={IconColors.ON_PRIMARY}
              />
            }
            variant="icon"
            disabled={isDisabledNext}
            onPress={() => handleMoveNext(index)}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.BACKGROUND,
    borderRadius: Sizes.BORDER_RADIUS,
    padding: Sizes.PADDING_LARGE,
    shadowColor: "#000",
    shadowOffset: {
      width: Sizes.SHADOW_OFFSET_WIDTH,
      height: Sizes.SHADOW_OFFSET_HEIGHT,
    },
    shadowOpacity: Sizes.SHADOW_OPACITY,
    shadowRadius: Sizes.SHADOW_RADIUS,
    elevation: Sizes.ELEVATION,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.LARGE,
  },

  buttonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.LARGE,
  },

  arrwosContainer: {
    flexDirection: "column",
    alignItems: "center",
    gap: Spacing.SMALL,
  },
});
