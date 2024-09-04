import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { useAppTheme } from "@/components/providers/Material3ThemeProvider";
import { useStorageState } from "@/hooks/useStorageState";
import { useNotification } from "@/stores/notificationStore";
import { useSessionStore } from "@/stores/sessionStore";
import { router, Tabs } from "expo-router";
import { useEffect } from "react";
import { BackHandler } from "react-native";

export const unstable_settings = {
  initialRouteName: 'home',
};

export default function TabLayout() {
  const colors = useAppTheme();
  const addNotification = useNotification((state) => state.addNotification);
  const [[isLoadingJwt, jwt], setJwt] = useStorageState(
    process.env.EXPO_PUBLIC_TOKEN_SECRET ?? "TOKEN_SECRET"
  );
  const [[isLoadingEmail, email], setEmail] = useStorageState(
    process.env.EXPO_PUBLIC_EMAIL_SECRET ?? "EMAIL_SECRET"
  );
  const session = useSessionStore((state) => state.session);

  useEffect(() => {
    const backAction = () => {
      addNotification({
        message: "Ir hacia atras esta deshabilitado. ¿Desea salir de la aplicación?",
        action: {
          label: "Salir",
          onClick: () => {
            BackHandler.exitApp();
          },
        }
      });
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    if (!session) {
      setJwt(null);
      setEmail(null);
      router.dismissAll();
    }
  }, [session]);


  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.colors.primary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.colors.background,
        },
      }}
      initialRouteName="home"
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
          ),
        }}
      />
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
