import { MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useTheme } from "../../hooks/useTheme";

export default function TabsLayout() {
  const colors = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: colors.BACKGROUND,
        },
        headerTitleStyle: {
          fontWeight: "600",
          fontSize: 18,
          color: colors.TEXT_PRIMARY,
        },
        tabBarStyle: {
          backgroundColor: colors.BACKGROUND,
          borderTopColor: colors.BORDER,
        },

        tabBarActiveTintColor: colors.PRIMARY_ICON_COLOR,
        tabBarInactiveTintColor: colors.TEXT_SECONDARY,

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Workouts",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="fitness-center" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="sections"
        options={{
          title: "Sections",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="view-list" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="exercises"
        options={{
          title: "Exercises",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="run-circle" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
