import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { Button, Dialog, FAB, Portal, Text } from "react-native-paper";

import Progress from "@/components/general/Progress";
import { Material3ThemeProvider } from "@/components/providers/Material3ThemeProvider";
import { ThemeEditor } from "@/components/ThemeEditor";
import { useProgressStore } from "@/stores/progress";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCameraPermissions } from "expo-camera";
import { NotificationBar } from "@/components/general/NotificationBar";

const queryClient = new QueryClient();

export const unstable_settings = {
  // Ensure any route can link back to `/`
  initialRouteName: 'index',
};

export default function RootLayout() {
  const [visible, setVisible] = useState(false);
  const progresses = useProgressStore((state) => state.progresses);
  const [permission, requestPermission] = useCameraPermissions();
  // useLanguage();

  function toggleModal() {
    setVisible(!visible);
  }

  useEffect(() => {
    requestPermission();
  }, []);


  return (
    <QueryClientProvider client={queryClient}>
      <Material3ThemeProvider sourceColor={"#339cff"}>
        {progresses.length > 0 && <Progress />}
        <Stack screenOptions={{ headerShown: false }} initialRouteName="index">
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
        </Stack>
        {permission && !permission.granted && (
          <Portal>
            <Dialog visible={true}>
              <Dialog.Title>Camera Permission</Dialog.Title>
              <Dialog.Content>
                {permission.canAskAgain && (
                  <Text>
                    This app needs camera permission to scan QR codes.
                  </Text>
                )}
                {!permission.canAskAgain && (
                  <Text>
                    You have denied camera permission. Please go to settings and
                    allow camera permission. Then restart the app.
                  </Text>
                )}
              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={requestPermission}>Accept</Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>
        )}
        <Portal>
          <Dialog visible={visible} onDismiss={toggleModal}>
            <Dialog.Title>Change theme</Dialog.Title>
            <Dialog.Content>
              <ThemeEditor />
            </Dialog.Content>
          </Dialog>
        </Portal>
        <FAB
          icon="palette"
          style={{
            position: "absolute",
            margin: 16,
            right: 0,
            bottom: 45,
          }}
          onPress={toggleModal}
          visible={false}
        />
        <NotificationBar />
      </Material3ThemeProvider>
    </QueryClientProvider>
  );
}
