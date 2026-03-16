import { SQLiteProvider } from "expo-sqlite";
import { SettingsProvider } from "../context/useSettingsContext";
import { dbRepository } from "../repositories/dbRepository";
import RootNavigator from "./root-navigator";

export default function RootLayout() {
  return (
    <SQLiteProvider
      databaseName="workout_timer.db"
      onInit={dbRepository.onInit}
    >
      <SettingsProvider>
        <RootNavigator />
      </SettingsProvider>
    </SQLiteProvider>
  );
}
