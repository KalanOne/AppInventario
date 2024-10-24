import { Stack } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Button, Dialog, FAB, Portal, Text } from 'react-native-paper';

import Progress from '@/components/general/Progress';
import { Material3ThemeProvider } from '@/components/providers/Material3ThemeProvider';
import { ThemeEditor } from '@/components/ThemeEditor';
import { useProgressStore } from '@/stores/progress';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCameraPermissions } from 'expo-camera';
import { NotificationBar } from '@/components/general/NotificationBar';
import { Animated, PanResponder } from 'react-native';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry(failureCount, error) {
        if (error.status === 404) return false;
        else if (error.status === 401) return false;
        else if (error.status === 403) return false;
        else if (failureCount < 2) return true;
        else return false;
      },
      refetchInterval: 600000,
      refetchOnMount: 'always',
      refetchOnWindowFocus: 'always',
      staleTime: 600000,
    },
  },
});

export const unstable_settings = {
  // Ensure any route can link back to `/`
  initialRouteName: 'index',
};

export default function RootLayout() {
  const [visible, setVisible] = useState(false);
  const progresses = useProgressStore((state) => state.progresses);
  const [permission, requestPermission] = useCameraPermissions();
  // useLanguage();
  const pan = useRef(new Animated.ValueXY()).current;

  function toggleModal() {
    setVisible(!visible);
  }

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [
          null,
          { dx: pan.x, dy: pan.y }, // Movemos en función del gesto
        ],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        pan.flattenOffset(); // Resetea la posición de offset cuando el usuario suelta
      },
    })
  ).current;

  useEffect(() => {
    requestPermission();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Material3ThemeProvider>
        {progresses.length > 0 && <Progress />}
        <Stack
          screenOptions={{
            headerShown: false,
            freezeOnBlur: true,
          }}
          initialRouteName="index"
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(application)" />
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
        {/* <FAB
          icon="palette"
          style={{
            position: 'absolute',
            margin: 16,
            right: 0,
            // bottom: 45,
            bottom: 15,
          }}
          onPress={toggleModal}
          visible={true}
          size="small"
        /> */}
        <Animated.View
          style={{
            transform: [{ translateX: pan.x }, { translateY: pan.y }],
            position: 'absolute',
            right: 0,
            bottom: 15,
          }}
          {...panResponder.panHandlers}
          // onTouchStart={toggleModal}
        >
          <FAB
            icon="palette"
            style={{
              margin: 16,
            }}
            onPress={toggleModal}
            visible={true}
            // size="small"
          />
        </Animated.View>
        <NotificationBar />
      </Material3ThemeProvider>
    </QueryClientProvider>
  );
}
