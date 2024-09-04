import { Flex } from "@/components/Flex";
import { useAppTheme } from "@/components/providers/Material3ThemeProvider";
import { useStorageState } from "@/hooks/useStorageState";
import { useNotification } from "@/stores/notificationStore";
import { useSessionStore } from "@/stores/sessionStore";
import React from "react";
import { Button, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  const color = useAppTheme();
  const addNotification = useNotification((state) => state.addNotification);
  const signOut = useSessionStore((state) => state.signOut);
  const session = useSessionStore((state) => state.session);
  const [[isLoadingJwt, jwt], setJwt] = useStorageState(
    process.env.EXPO_PUBLIC_TOKEN_SECRET ?? "TOKEN_SECRET"
  );
  const [[isLoadingEmail, email], setEmail] = useStorageState(
    process.env.EXPO_PUBLIC_EMAIL_SECRET ?? "EMAIL_SECRET"
  );


  function handlePress() {
    addNotification({
      message: "¿Desea cerrar sesión?",
      action: {
        label: "Cerrar sesión",
        onClick: handleoggle,
      },
      duration: 20000,
    });
  }

  function handleoggle() {
    signOut();
    setJwt(null);
    setEmail(null);
  }


  return (
    <Flex backgroundColor={color.colors.background} flex={1}>
      <SafeAreaView style={{ flex: 1 }}>
        <Text>Home</Text>
        <Button onPress={handlePress} mode="elevated" style={{ width: "50%" }}>
          Presion
        </Button>
        <Text>
          {JSON.stringify(session, null, 5)}
        </Text>
      </SafeAreaView>
    </Flex>
  );
}
