import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Icon } from 'react-native-paper';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { useAppTheme } from '@/components/providers/Material3ThemeProvider';
import { FontAwesome } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function DrawerLayout() {
  const colors = useAppTheme();

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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        initialRouteName="home"
        backBehavior="history"
        screenOptions={{
          headerShown: true,
          headerTintColor: colors.colors.primary,
          headerStyle: {
            backgroundColor: colors.colors.surfaceContainer,
            elevation: 6,
          },
          drawerContentStyle: {
            backgroundColor: colors.colors.surfaceContainer,
            // paddingTop: 25,
          },
          drawerInactiveTintColor: colors.colors.secondary,
          drawerActiveTintColor: colors.colors.primary,
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
            drawerItemStyle: {
              display: 'none',
            },
          }}
        />
        <Drawer.Screen
          name="user"
          options={{
            drawerLabel: 'User',
            title: 'User',
            drawerIcon: ({ color, focused, size }) => (
              <FontAwesome
                name={focused ? 'user-circle' : 'user-circle-o'}
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Drawer.Screen
          name="almacenes"
          options={{
            drawerLabel: 'Almacenes',
            title: 'Almacenes',
            drawerIcon: ({ color, size }) => (
              <Icon source={'warehouse'} color={color} size={size} />
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
