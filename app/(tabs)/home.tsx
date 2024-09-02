import { Flex } from "@/components/Flex";
import { useAppTheme } from "@/components/providers/Material3ThemeProvider";
import React from "react";
import { View, Text } from "react-native";

export default function Home() {
  const color = useAppTheme();
  return (
    <Flex backgroundColor={color.colors.inversePrimary}>
      <Text>Home</Text>
    </Flex>
  );
}
