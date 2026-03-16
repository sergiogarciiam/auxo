import { PortalHost } from "@rn-primitives/portal";
import { SQLiteProvider } from "expo-sqlite";
import { SettingsProvider } from "../context/useSettingsContext";
import { dbRepository } from "../repositories/dbRepository";
import RootNavigator from "./root-navigator";

import { NAV_THEME } from "@/lib/theme";
import { ThemeProvider } from "@react-navigation/native";
import "../global.css";

export default function RootLayout() {
  return (
    <ThemeProvider value={NAV_THEME["dark"]}>
      <SQLiteProvider
        databaseName="workout_timer.db"
        onInit={dbRepository.onInit}
      >
        <SettingsProvider>
          <RootNavigator />
        </SettingsProvider>
        <PortalHost />
      </SQLiteProvider>
    </ThemeProvider>
  );
}
