import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Menu } from "react-native-paper";
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
  onStart?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  index: number;
  handleMovePrev: (index: number) => void;
  handleMoveNext: (index: number) => void;
  isDisabledPrev?: boolean;
  isDisabledNext?: boolean;
}

export function Card({
  text,
  onStart,
  onEdit,
  onDelete,
  index,
  handleMovePrev,
  handleMoveNext,
  isDisabledPrev,
  isDisabledNext,
}: CardProps) {
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={styles.card}>
      <Text style={styles.text} numberOfLines={1} ellipsizeMode="tail">
        {text}
      </Text>

      <View style={styles.rightContainer}>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <ThemedButton
              variant="icon"
              onPress={() => {
                setMenuVisible((prev) => !prev);
                console.log("Menu opened");
              }}
              icon={
                <MaterialIcons
                  name="more-vert"
                  size={IconSizes.MEDIUM}
                  color={IconColors.ON_PRIMARY}
                />
              }
              style={styles.menuButton}
            />
          }
        >
          {onStart && (
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                onStart();
              }}
              title="Start"
              leadingIcon="play"
            />
          )}

          {onEdit && (
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                onEdit();
              }}
              title="Edit"
              leadingIcon="pencil"
            />
          )}

          {onDelete && (
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                onDelete();
              }}
              title="Delete"
              leadingIcon="delete"
            />
          )}
        </Menu>

        <View style={styles.arrowsContainer}>
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
            style={styles.upButton}
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
            style={styles.downButton}
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
    shadowColor: "#000",
    shadowOffset: {
      width: Sizes.SHADOW_OFFSET_WIDTH,
      height: Sizes.SHADOW_OFFSET_HEIGHT,
    },
    shadowOpacity: Sizes.SHADOW_OPACITY,
    shadowRadius: Sizes.SHADOW_RADIUS,
    elevation: Sizes.ELEVATION,

    flexDirection: "row",
    alignItems: "center",

    paddingVertical: Sizes.PADDING_LARGE,
    minHeight: 88,
  },
  text: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    padding: Sizes.PADDING_LARGE,
  },

  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.MEDIUM,
    flexShrink: 0,
  },

  arrowsContainer: {
    flexDirection: "column",
    alignItems: "center",
    gap: Spacing.SMALL,
  },

  upButton: {
    borderTopEndRadius: Sizes.BORDER_RADIUS,
    borderBottomEndRadius: 0,
    padding: Sizes.PADDING,
  },

  downButton: {
    borderTopEndRadius: 0,
    borderBottomEndRadius: Sizes.BORDER_RADIUS,
    padding: Sizes.PADDING,
  },

  menuButton: {
    minWidth: 48,
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
  },
});
