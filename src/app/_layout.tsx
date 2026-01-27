import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { Snackbar } from "../components/snackbar";
import { Colors } from "../constants/theme";
import { dbRepository } from "../repositories/dbRepository";

export default function RootLayout() {
  return (
    <SQLiteProvider
      databaseName="workout_timer.db"
      onInit={dbRepository.onInit}
    >
      <Snackbar />
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          headerBackVisible: false,
          headerStyle: {
            backgroundColor: Colors.BACKGROUND,
          },
          headerTitleStyle: {
            fontWeight: "600",
            fontSize: 18,
            color: Colors.TEXT_PRIMARY,
          },
        }}
      />
    </SQLiteProvider>
  );
}
