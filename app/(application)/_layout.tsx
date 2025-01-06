import { router } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { useAppTheme } from '@/components/providers/Material3ThemeProvider';
import { useStorageState } from '@/hooks/useStorageState';
import { useNotification } from '@/stores/notificationStore';
import { useSessionStore } from '@/stores/sessionStore';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export const unstable_settings = {
  initialRouteName: 'home',
};

export default function DrawerLayout() {
  const colors = useAppTheme();
  const addNotification = useNotification((state) => state.addNotification);
  const [[isLoadingJwt, jwt], setJwt] = useStorageState(
    process.env.EXPO_PUBLIC_TOKEN_SECRET ?? 'TOKEN_SECRET'
  );
  const [[isLoadingEmail, email], setEmail] = useStorageState(
    process.env.EXPO_PUBLIC_EMAIL_SECRET ?? 'EMAIL_SECRET'
  );
  const session = useSessionStore((state) => state.session);

  // Evitar de ir hacia atras
  // useEffect(() => {
  //   const backAction = () => {
  //     addNotification({
  //       message:
  //         'Ir hacia atras esta deshabilitado. ¿Desea salir de la aplicación?',
  //       action: {
  //         label: 'Salir',
  //         onClick: () => {
  //           BackHandler.exitApp();
  //         },
  //       },
  //     });
  //     return true;
  //   };

  //   const backHandler = BackHandler.addEventListener(
  //     'hardwareBackPress',
  //     backAction
  //   );

  //   return () => backHandler.remove();
  // }, []);

  useEffect(() => {
    if (!session) {
      setJwt(null);
      setEmail(null);
      router.dismissAll();
    }
  }, [session]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        initialRouteName="home"
        backBehavior="order"
        screenOptions={{
          headerShown: true,
          headerTintColor: colors.colors.primary,
          headerStyle: {
            backgroundColor: colors.colors.surfaceContainer,
            elevation: 6,
          },
          drawerContentStyle: {
            backgroundColor: colors.colors.surfaceContainer,
          },
          drawerInactiveTintColor: colors.colors.secondary,
          drawerActiveTintColor: colors.colors.primary,
          // unmountOnBlur: true,
        }}
      >
        <Drawer.Screen
          name="home"
          options={{
            drawerLabel: 'Home',
            title: 'Home',
            drawerIcon: ({ color, focused, size }) => (
              <TabBarIcon
                name={focused ? 'home' : 'home-outline'}
                color={color}
                size={size}
              />
            ),
          }}
        />
        <Drawer.Screen
          name="articulos"
          options={{
            drawerLabel: 'Artículos',
            title: 'Artículos',
            drawerIcon: ({ color, focused, size }) => (
              <MaterialCommunityIcons
                name={focused ? 'database-search' : 'database-search-outline'}
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Drawer.Screen
          name="nuevaTransaccion"
          options={{
            drawerLabel: 'Nueva Transacción',
            title: 'Nueva Transacción',
            drawerIcon: ({ color, focused, size }) => (
              <MaterialCommunityIcons
                name={focused ? 'plus-circle' : 'plus-circle-outline'}
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Drawer.Screen
          name="transacciones"
          options={{
            drawerLabel: 'Transacciones',
            title: 'Transacciones',
            drawerIcon: ({ color, focused, size }) => (
              <MaterialCommunityIcons
                name={focused ? 'bank' : 'bank-outline'}
                color={color}
                size={size}
              />
            ),
          }}
        />
        <Drawer.Screen
          name="(inventory)"
          options={{
            drawerLabel: 'Inventario',
            title: 'Inventario',
            drawerIcon: ({ color, focused, size }) => (
              <TabBarIcon
                name={focused ? 'storefront' : 'storefront-outline'}
                color={color}
                size={size}
              />
            ),
          }}
        />
        <Drawer.Screen
          name="logout"
          options={{
            drawerLabel: 'Logout',
            title: 'Logout',
            drawerIcon: ({ color, focused, size }) => (
              <TabBarIcon
                name={focused ? 'log-out' : 'log-out-outline'}
                color={color}
                size={size}
              />
            ),
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
