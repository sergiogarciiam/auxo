import { MaterialIcons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const menuButtonRef = useRef<View>(null);

  const openMenu = () => {
    if (menuButtonRef.current) {
      menuButtonRef.current.measure((x, y, width, height, pageX, pageY) => {
        setMenuPosition({ x: pageX, y: pageY });
        setMenuVisible(true);
      });
    }
  };

  const handleMenuPress = (action?: () => void) => {
    setMenuVisible(false);
    action?.();
  };

  return (
    <View style={styles.card}>
      <Text style={styles.text} numberOfLines={1} ellipsizeMode="tail">
        {text}
      </Text>

      <View style={styles.rightContainer}>
        {/* CUSTOM MODAL BUTTON */}
        <TouchableOpacity
          ref={menuButtonRef}
          onPress={openMenu}
          style={styles.menuButton}
        >
          <MaterialIcons
            name="more-vert"
            size={24}
            color={IconColors.ON_PRIMARY}
          />
        </TouchableOpacity>

        {/* MODAL */}
        <Modal
          transparent
          visible={menuVisible}
          animationType="fade"
          onRequestClose={() => setMenuVisible(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setMenuVisible(false)}
          >
            <View
              style={[
                styles.menu,
                { top: menuPosition.y, left: menuPosition.x - 150 + 48 },
              ]}
            >
              {onStart && (
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleMenuPress(onStart)}
                >
                  <MaterialIcons
                    name="play-arrow"
                    size={IconSizes.MEDIUM}
                    color={IconColors.ON_PRIMARY}
                  />
                  <Text style={styles.menuText}>Start</Text>
                </TouchableOpacity>
              )}

              {onEdit && (
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleMenuPress(onEdit)}
                >
                  <MaterialIcons
                    name="edit"
                    size={IconSizes.MEDIUM}
                    color={IconColors.ON_PRIMARY}
                  />
                  <Text style={styles.menuText}>Edit</Text>
                </TouchableOpacity>
              )}

              {onDelete && (
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleMenuPress(onDelete)}
                >
                  <MaterialIcons
                    name="delete"
                    size={IconSizes.MEDIUM}
                    color={IconColors.ON_PRIMARY}
                  />
                  <Text style={styles.menuText}>Delete</Text>
                </TouchableOpacity>
              )}
            </View>
          </Pressable>
        </Modal>

        {/* ARROWS */}
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
    marginLeft: Spacing.MEDIUM,
  },
  arrowsContainer: {
    flexDirection: "column",
    alignItems: "center",
    marginLeft: Spacing.SMALL,
  },
  upButton: {
    borderTopEndRadius: Sizes.BORDER_RADIUS,
    borderBottomEndRadius: 0,
    padding: Sizes.PADDING,
    marginBottom: Spacing.SMALL,
  },
  downButton: {
    borderTopEndRadius: 0,
    borderBottomEndRadius: Sizes.BORDER_RADIUS,
    padding: Sizes.PADDING,
  },
  menuButton: {
    minWidth: 48,
    minHeight: 48,
    marginRight: Spacing.MEDIUM,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.PRIMARY,
    borderRadius: Sizes.BORDER_RADIUS,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  menu: {
    position: "absolute",
    backgroundColor: Colors.DARK_GRAY,
    borderRadius: Sizes.BORDER_RADIUS,
    paddingVertical: 8,
    width: 150,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  menuText: {
    marginLeft: 12,
    fontSize: 16,
    color: IconColors.ON_PRIMARY,
  },
});
