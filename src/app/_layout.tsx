import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { Snackbar } from "../components/snackbar";
import { useTheme } from "../hooks/useTheme";
import { dbRepository } from "../repositories/dbRepository";

export default function RootLayout() {
  const colors = useTheme();
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
            backgroundColor: colors.BACKGROUND,
          },
          headerTitleStyle: {
            fontWeight: "600",
            fontSize: 18,
            color: colors.TEXT_PRIMARY,
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </SQLiteProvider>
  );
}
