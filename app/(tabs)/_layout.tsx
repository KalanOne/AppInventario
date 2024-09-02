import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { useAppTheme } from "@/components/providers/Material3ThemeProvider";
import { Tabs } from "expo-router";

export default function TabLayout() {
  const colors = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.colors.primary,
        headerShown: true,
        tabBarStyle: {
          backgroundColor: colors.colors.background,
        },
      }}
    >
      <Tabs.Screen
        name="cameras/scanCamera"
        options={{
          // href: null,
          // tabBarStyle: {
          //   display: "none",
          // },
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
