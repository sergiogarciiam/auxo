import { Picker } from "@react-native-picker/picker";
import { Stack } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Sizes, Spacing, Typography } from "../constants/theme";
import { useSettingsContext } from "../context/useSettingsContext";
import { useTheme } from "../hooks/useTheme";
import { ThemeOption, WeightUnit } from "../types/ui";

export default function SettingsScreen() {
  const colors = useTheme();
  const { theme, weightUnit, setTheme, setWeightUnit } = useSettingsContext();

  const handleThemeChange = async (newTheme: ThemeOption) => {
    try {
      setTheme(newTheme);
    } catch (err) {
      console.error(err);
    }
  };

  const handleWeightUnitChange = async (newUnit: WeightUnit) => {
    try {
      setWeightUnit(newUnit);
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
            selectedValue={theme}
            onValueChange={(value) => handleThemeChange(value as ThemeOption)}
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
            onValueChange={(value) =>
              handleWeightUnitChange(value as WeightUnit)
            }
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
