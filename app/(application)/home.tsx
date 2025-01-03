import React from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Flex } from '@/components/UI/Flex';
import { useAppTheme } from '@/components/providers/Material3ThemeProvider';
import { useStorageState } from '@/hooks/useStorageState';
import { useNotification } from '@/stores/notificationStore';
import { useSessionStore } from '@/stores/sessionStore';

export default function HomeScreen() {
  const color = useAppTheme();
  const addNotification = useNotification((state) => state.addNotification);
  const signOut = useSessionStore((state) => state.signOut);
  const session = useSessionStore((state) => state.session);
  const [[isLoadingJwt, jwt], setJwt] = useStorageState(
    process.env.EXPO_PUBLIC_TOKEN_SECRET ?? 'TOKEN_SECRET'
  );
  const [[isLoadingEmail, email], setEmail] = useStorageState(
    process.env.EXPO_PUBLIC_EMAIL_SECRET ?? 'EMAIL_SECRET'
  );
  const handPositionX = useSharedValue(0);

  // Animación para mover la mano de izquierda a derecha
  handPositionX.value = withRepeat(
    withSequence(withTiming(50, { duration: 1500, easing: Easing.bounce })),
    20
  );
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: handPositionX.value }],
  }));

  return (
    <Flex
      backgroundColor={color.colors.background}
      flex={1}
      style={{
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        variant="titleLarge"
        style={{ textAlign: 'center', paddingTop: 15 }}
      >
        Welcome back to Home Screen
      </Text>
      <Animated.Text style={[styles.container, animatedStyle]}>
        <Text>Desliza a la izquiera para ver el menú</Text>
      </Animated.Text>
    </Flex>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    padding: 10,
  },
  hand: {
    fontSize: 60,
  },
});
