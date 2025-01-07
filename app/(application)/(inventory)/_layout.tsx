import { Stack } from 'expo-router';

export default function InventoryLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        freezeOnBlur: true,
      }}
      initialRouteName="products"
    >
      <Stack.Screen name="products" />
      <Stack.Screen name="products/[id]" />
    </Stack>
  );
}
