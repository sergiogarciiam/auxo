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
import { Switch } from "@/components/ui/switch";
import type { TriggerRef } from "@rn-primitives/select";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import * as React from "react";
import { useEffect, useState } from "react";
import {
  AppState,
  Linking,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useSettingsContext } from "../context/useSettingsContext";
import { useTheme } from "../hooks/other/useTheme";
import { ThemeOption, WeightUnit } from "../types/ui";

export default function SettingsScreen() {
  const { theme, weightUnit, setTheme, setWeightUnit } = useSettingsContext();
  const colors = useTheme();

  const weightRef = React.useRef<TriggerRef>(null!);

  const insets = useSafeAreaInsets();
  const [notificationsEnabled, setNotificationsEnabled] =
    useState<boolean>(false);

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

  const onTouchStart = (ref: React.RefObject<TriggerRef>) => () => {
    ref.current?.open();
  };

  const updateNotificationsState = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      setNotificationsEnabled(status === "granted");
    } catch {
      setNotificationsEnabled(false);
    }
  };

  useEffect(() => {
    updateNotificationsState();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        updateNotificationsState();
      }
    });

    return () => subscription.remove();
  }, []);

  const openSystemSettings = () => {
    if (Platform.OS === "ios") {
      Linking.openURL("app-settings:");
    } else {
      Linking.openSettings();
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Settings",
        }}
      />

      <SafeAreaView
        edges={["bottom", "left", "right"]}
        style={{ flex: 1, backgroundColor: colors.BACKGROUND_SECONDARY }}
      >
        <ScrollView
          contentContainerStyle={{
            gap: 20,
            padding: 16,
            flexGrow: 1,
            backgroundColor: colors.BACKGROUND_SECONDARY,
          }}
        >
          {/* THEME */}
          <View>
            <Label>Theme</Label>

            <Select
              value={selectedTheme}
              onValueChange={(option) => setTheme(option?.value as ThemeOption)}
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
                setWeightUnit(option?.value as WeightUnit)
              }
            >
              <SelectTrigger
                ref={weightRef}
                className="w-full"
                onTouchStart={Platform.select({ web: onTouchStart(weightRef) })}
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

          {/* NOTIFICATIONS */}
          <View className="flex-row items-center gap-2 mt-4">
            <Label>Notifications</Label>
            <Switch
              checked={notificationsEnabled}
              disabled={!notificationsEnabled}
              onCheckedChange={() => {
                if (!notificationsEnabled) openSystemSettings();
              }}
            />
          </View>
          <Text className="mt-1 text-sm text-gray-400">
            Recommended to enable notifications so you are alerted when an
            exercise finishes, even if the app is in background.{" "}
            <Text className="text-blue-500" onPress={openSystemSettings}>
              Open Settings
            </Text>
          </Text>

          {/* REPORT ISSUE */}
          <View className="mt-6">
            <Label>Help</Label>
            <Text className="mt-1 text-sm text-gray-400">
              If you encounter any issues or have suggestions, please let me
              know!
            </Text>
            <Text
              className="mt-1 text-sm text-blue-500"
              onPress={() => {
                const subject = encodeURIComponent("Auxo - Report an issue");
                const body = encodeURIComponent(
                  [
                    "Describe the issue:",
                    "",
                    `OS: ${Platform.OS} ${Platform.Version}`,
                  ].join("\n"),
                );
                Linking.openURL(
                  `mailto:sergiogarciiam@gmail.com?subject=${subject}&body=${body}`,
                );
              }}
            >
              Report an issue
            </Text>
          </View>

          {/* ABOUT */}
          <View className="mt-6">
            <Label>About</Label>
            <Text
              className="mt-1 text-sm text-blue-500"
              onPress={() =>
                Linking.openURL("https://github.com/sergiogarciiam/auxo")
              }
            >
              Contribute on GitHub
            </Text>
            <Text
              className="mt-1 text-sm text-blue-500"
              onPress={() =>
                Linking.openURL(
                  "https://play.google.com/store/apps/details?id=com.sergiogarciiam.auxo",
                )
              }
            >
              Rate the app on Play Store
            </Text>
            <Text
              className="mt-1 text-sm text-blue-500"
              onPress={() => Linking.openURL("https://sergiogarciiam.dev")}
            >
              About the developer
            </Text>
          </View>

          {/* SOUND CREDITS */}
          <View className="mt-6">
            <Label>Sound Effects</Label>
            <Text className="mt-1 text-sm text-gray-400">
              - beep.wav:{" "}
              <Text
                className="text-blue-500"
                onPress={() =>
                  Linking.openURL("https://freesound.org/s/124904/")
                }
              >
                FreeSound
              </Text>{" "}
              (CC BY 3.0)
            </Text>
            <Text className="mt-1 text-sm text-gray-400">
              - double-beep.wav:{" "}
              <Text
                className="text-blue-500"
                onPress={() =>
                  Linking.openURL("https://freesound.org/s/124907/")
                }
              >
                FreeSound
              </Text>{" "}
              (CC BY 3.0)
            </Text>
          </View>

          {/* VERSION */}
          <View className="items-center mt-8">
            <Text className="text-xs text-gray-400">
              Version {Constants.expoConfig?.version ?? "1.0.0"}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
