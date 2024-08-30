import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { useAppTheme } from "@/components/providers/Material3ThemeProvider";
import { Tabs } from "expo-router";

export default function TabLayout() {
  const colors = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.colors.primary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.colors.background,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "home" : "home-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="cameras/scanCamera"
        options={{
          // href: null,
          tabBarStyle: {
            display: "none",
          },
          title: "Camera",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "camera" : "camera-outline"}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
