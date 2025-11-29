import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { dbRepository } from "../repositories/dbRepository";

export default function RootLayout() {
  return (
    <SQLiteProvider
      databaseName="workout_timer.db"
      onInit={dbRepository.migrateDbIfNeeded}
    >
      <Stack />
    </SQLiteProvider>
  );
}
