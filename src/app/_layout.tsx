import { PortalHost } from "@rn-primitives/portal";
import { SQLiteProvider } from "expo-sqlite";
import {
  SettingsProvider,
  useSettingsContext,
} from "../context/useSettingsContext";
import { ErrorBoundary } from "../components/error-boundary";
import { dbRepository } from "../repositories/dbRepository";
import RootNavigator from "./root-navigator";

import { NAV_THEME } from "@/lib/theme";
import { ThemeProvider } from "@react-navigation/native";
import { useColorScheme } from "nativewind";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../global.css";

function AppProviders() {
  const { theme } = useSettingsContext();
  const { colorScheme, setColorScheme } = useColorScheme();

  const scheme = theme === "system" ? (colorScheme ?? "light") : theme;

  useEffect(() => {
    setColorScheme(theme);
  }, [theme]);

  return (
    <ErrorBoundary>
      <ThemeProvider value={NAV_THEME[scheme]}>
        <SQLiteProvider
          databaseName="workout_timer.db"
          onInit={dbRepository.onInit}
        >
          <GestureHandlerRootView style={{ flex: 1 }}>
            <RootNavigator />
          </GestureHandlerRootView>

          <PortalHost />
        </SQLiteProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default function RootLayout() {
  return (
    <SettingsProvider>
      <AppProviders />
    </SettingsProvider>
  );
}
