import { Button, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Flex } from "@/components/Flex";
import { useAppTheme } from "@/components/providers/Material3ThemeProvider";
import { useEffect } from "react";
import { useSessionStore } from "@/stores/sessionStore";
import { useStorageState } from "@/hooks/useStorageState";
import { router } from "expo-router";
import { StyleSheet } from "react-native";

export default function Index() {
  const insets = useSafeAreaInsets();
  const color = useAppTheme();

  const [[isLoadingJwt, jwt], _setJwt, reloadJWT] = useStorageState(
    process.env.EXPO_PUBLIC_TOKEN_SECRET ?? "TOKEN_SECRET"
  );
  const [[isLoadingEmail, email], _setEmail] = useStorageState(
    process.env.EXPO_PUBLIC_EMAIL_SECRET ?? "EMAIL_SECRET"
  );

  const signIn = useSessionStore((state) => state.signIn);
  const signOut = useSessionStore((state) => state.signOut);
  const session = useSessionStore((state) => state.session);

  function handleContinue() {
    if (jwt && email) {
      router.navigate({ pathname: "/home" });
    } else {
      router.push({ pathname: "/login" });
    }
  }

  useEffect(() => {
    if (jwt && email) {
      signIn(email, jwt);
    } else if (!jwt && !email) {
      signOut();
    }
  }, [jwt, email]);

  useEffect(() => {
    reloadJWT();
  }, [session]);

  return (
    <Flex
      flex={1}
      backgroundColor={color.colors.primaryContainer}
      style={{
        paddingTop: insets.top,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text variant="titleLarge" style={styles.title}>
        Bienvenido de nuevo a Inventario, la aplicación de inventario de la
        empresa.
      </Text>
      <Button mode="contained" onPress={handleContinue} icon={"home-variant"}
        disabled={isLoadingJwt || isLoadingEmail}>
        Empezar
      </Button>
    </Flex>
  );
}

const styles = StyleSheet.create({
  title: {
    textAlign: "center",
    marginBottom: 50,
    fontWeight: "bold",
  },
});
