import { Picker } from "@react-native-picker/picker";
import { Stack } from "expo-router";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Sizes, Spacing, Typography } from "../constants/theme";
import { useSettings } from "../hooks/base/useSettings";
import { useTheme } from "../hooks/useTheme";

export default function SettingsScreen() {
  const colors = useTheme();
  const {
    theme: currentTheme,
    weightUnit,
    updateSettings,
    loading,
  } = useSettings();

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  const handleThemeChange = async (newTheme) => {
    try {
      await updateSettings(newTheme, weightUnit); // actualiza DB
      //setTheme(newTheme); // actualiza UI inmediatamente
    } catch (err) {
      console.error(err);
    }
  };

  const handleWeightUnitChange = async (newUnit) => {
    try {
      await updateSettings(currentTheme, newUnit); // actualiza DB
    } catch (err) {
      console.error(err);
    }
  };

  const styles = createStyles(colors);

  return (
    <>
      <Stack.Screen
        options={{
          title: "Settings",
          headerBackVisible: true,
        }}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>Theme</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={currentTheme}
            onValueChange={(value) => handleThemeChange(value)}
            itemStyle={styles.pickerItem}
          >
            <Picker.Item
              label="System"
              value="system"
              style={styles.pickerItem}
            />
            <Picker.Item
              label="Light"
              value="light"
              style={styles.pickerItem}
            />
            <Picker.Item label="Dark" value="dark" style={styles.pickerItem} />
          </Picker>
        </View>

        <Text style={styles.label}>Weight Unit</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={weightUnit}
            onValueChange={(value) => handleWeightUnitChange(value)}
            itemStyle={styles.pickerItem}
          >
            <Picker.Item
              label="Kilograms (kg)"
              value="kg"
              style={styles.pickerItem}
            />
            <Picker.Item
              label="Pounds (lb)"
              value="lb"
              style={styles.pickerItem}
            />
          </Picker>
        </View>
      </ScrollView>
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
    label: {
      fontSize: Typography.FONT_SIZE_DEFAULT,
      fontWeight: "600",
      color: colors.TEXT_PRIMARY,
      marginBottom: Spacing.SMALL,
    },

    pickerItem: {
      color: colors.TEXT_PRIMARY,
      backgroundColor: colors.PICKER_BACKGROUND,
    },
    pickerContainer: {
      borderWidth: Sizes.BORDER_WIDTH,
      borderColor: colors.BORDER,
      borderRadius: Sizes.BORDER_RADIUS,
      backgroundColor: colors.LIGHT_BACKGROUND,
      color: colors.TEXT_PRIMARY,
      overflow: "hidden",
    },
  });
