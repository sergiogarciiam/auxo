import { Stack } from "expo-router";
import { Snackbar } from "../components/snackbar";
import { useTheme } from "../hooks/useTheme";

export default function RootNavigator() {
  const colors = useTheme();

  return (
    <>
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
      />
    </>
  );
}
