import { Button, Dialog, IconButton, Portal, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Flex } from "@/components/Flex";
import { useAppTheme } from "@/components/providers/Material3ThemeProvider";
import { Link } from "expo-router";
export default function Index() {
  const insets = useSafeAreaInsets();
  const color = useAppTheme();

  return (
    <Flex
      flex={1}
      backgroundColor={color.colors.background}
      style={{ paddingTop: insets.top }}
    >
      <Link href="/cameras/scanCamera">
        <IconButton icon="camera" size={20} mode="contained" />
      </Link>
    </Flex>
  );
}
