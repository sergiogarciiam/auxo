import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TriggerRef } from "@rn-primitives/select";
import { Stack } from "expo-router";
import * as React from "react";
import { Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSettingsContext } from "../context/useSettingsContext";
import { ThemeOption, WeightUnit } from "../types/ui";

export default function SettingsScreen() {
  const { theme, weightUnit, setTheme, setWeightUnit } = useSettingsContext();

  const themeRef = React.useRef<TriggerRef>(null);
  const weightRef = React.useRef<TriggerRef>(null);

  const insets = useSafeAreaInsets();

  const THEME_OPTIONS = [
    { label: "System", value: "system" },
    { label: "Light", value: "light" },
    { label: "Dark", value: "dark" },
  ];

  const WEIGHT_UNIT_OPTIONS = [
    { label: "Kilograms (kg)", value: "kg" },
    { label: "Pounds (lb)", value: "lb" },
  ];

  const selectedTheme = THEME_OPTIONS.find((opt) => opt.value === theme);
  const selectedWeightUnit = WEIGHT_UNIT_OPTIONS.find(
    (opt) => opt.value === weightUnit,
  );

  const contentInsets = {
    top: insets.top,
    bottom: Platform.select({
      ios: insets.bottom,
      android: insets.bottom + 24,
    }),
    left: 12,
    right: 12,
  };

  // Fix web
  const onTouchStart = (ref: React.RefObject<TriggerRef>) => () => {
    ref.current?.open();
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Settings",
        }}
      />

      <ScrollView contentContainerStyle={{ gap: 20, padding: 16 }}>
        {/* THEME */}
        <View>
          <Label>Theme</Label>

          <Select
            value={selectedTheme}
            onValueChange={(option) => setTheme(option.value as ThemeOption)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>

            <SelectContent insets={contentInsets}>
              <SelectGroup>
                <SelectLabel>Theme</SelectLabel>

                {THEME_OPTIONS.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    label={opt.label}
                    value={opt.value}
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </View>

        {/* WEIGHT UNIT */}
        <View>
          <Label>Weight Unit</Label>

          <Select
            value={selectedWeightUnit}
            onValueChange={(option) =>
              setWeightUnit(option.value as WeightUnit)
            }
          >
            <SelectTrigger
              ref={weightRef}
              className="w-full"
              onTouchStart={Platform.select({
                web: onTouchStart(weightRef),
              })}
            >
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>

            <SelectContent insets={contentInsets}>
              <SelectGroup>
                <SelectLabel>Weight Unit</SelectLabel>

                <SelectItem label="Kilograms (kg)" value="kg">
                  Kilograms (kg)
                </SelectItem>
                <SelectItem label="Pounds (lb)" value="lb">
                  Pounds (lb)
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </View>
      </ScrollView>
    </>
  );
}
