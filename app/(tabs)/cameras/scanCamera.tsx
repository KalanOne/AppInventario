import { BarcodeScanningResult, CameraType, CameraView } from "expo-camera";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet } from "react-native";
import { Appbar, Dialog, IconButton, Portal, Snackbar, Text } from "react-native-paper";

import { Flex } from "@/components/Flex";
import { useAppTheme } from "@/components/providers/Material3ThemeProvider";

export default function SanCamera() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [scanningResult, setScanningResult] = useState<BarcodeScanningResult>();
  const [visible, setVisible] = useState(false);
  const color = useAppTheme();

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  function handleBackPress() {
    router.back();
  }

  function barCodeScanned(scanningResult: BarcodeScanningResult) {
    console.log(scanningResult);
    setScanningResult(scanningResult);
    setVisible(true);
  }

  function togglePortal() {
    setVisible(!visible);
  }

  return (
    <Flex backgroundColor={color.colors.background} flex={1}>
      <Appbar.Header mode="center-aligned">
        <Appbar.BackAction onPress={handleBackPress} />
        <Appbar.Content title="Camera" />
      </Appbar.Header>
      <CameraView
        style={styles.camera}
        facing={facing}
        onBarcodeScanned={barCodeScanned}
      >
        <Flex style={styles.buttonContainer}>
          <IconButton
            icon={"camera-flip"}
            size={20}
            onPress={toggleCameraFacing}
          />
        </Flex>
        <Snackbar
          visible={true}
          onDismiss={() => {}}
        >
          se ve?
        </Snackbar>
      </CameraView>
      <Portal>
        <Dialog visible={visible} onDismiss={togglePortal}>
          <Dialog.Title>Bar code scanned</Dialog.Title>
          <Dialog.Content>
            <Text>{JSON.stringify(scanningResult)}</Text>
          </Dialog.Content>
        </Dialog>
      </Portal>
    </Flex>
  );
}

const styles = StyleSheet.create({
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 10,
    right: 10,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
});
