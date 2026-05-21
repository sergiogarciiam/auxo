import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { Stack, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { View } from "react-native";
import { useTheme } from "../hooks/other/useTheme";

export default function NotFoundScreen() {
  const router = useRouter();
  const colors = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: "Not Found" }} />
      <View
        className="flex-1 items-center justify-center gap-4 p-6"
        style={{ backgroundColor: colors.BACKGROUND_SECONDARY }}
      >
        <Text variant="h1">404</Text>
        <Text variant="muted" className="text-center">
          This page doesn&apos;t exist.
        </Text>
        <Button onPress={() => router.replace("/")}>
          <Icon as={ArrowLeft} />
          <Text>Go Home</Text>
        </Button>
      </View>
    </>
  );
}
