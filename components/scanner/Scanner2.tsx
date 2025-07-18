import { Audio } from 'expo-av';
import { BarcodeScanningResult, CameraView } from 'expo-camera';
import { useEffect, useState } from 'react';
import { Keyboard, LayoutChangeEvent, StyleSheet, View } from 'react-native';
import {
  Button,
  IconButton,
  Modal,
  Portal,
  Text,
  TextInput,
} from 'react-native-paper';

import { useAppTheme } from '@/components/providers/Material3ThemeProvider';
import { Flex } from '@/components/UI/Flex';

export { Scanner2 };

interface ScannerProps {
  visible: boolean;
  onDismissCancel: () => void;
  onBarcodeScanned: (barcodeScanned: string) => void;
}

function Scanner2({
  visible,
  onDismissCancel,
  onBarcodeScanned,
}: ScannerProps) {
  const [scanningResult, setScanningResult] =
    useState<BarcodeScanningResult | null>(null);
  const color = useAppTheme();
  const [flash, setFlash] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [cameraDimensions, setCameraDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  function onCameraLayout(event: LayoutChangeEvent) {
    const { width, height } = event.nativeEvent.layout;
    setCameraDimensions({ width, height });
  }

  function normalizeCoordinates(
    points: { x: number; y: number }[],
    cameraWidth: number,
    cameraHeight: number
  ) {
    return points.map((point) => ({
      x: point.x / cameraWidth,
      y: point.y / cameraHeight,
    }));
  }

  async function playSound() {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/audio/store-scanner-beep-90395.mp3')
      );
      setSound(sound);
      await sound.playAsync();
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await sound.unloadAsync();
    } catch (error) {
      console.error('Error al reproducir audio', error);
    }
  }

  function checkIfInCenterArea(
    bounds: {
      origin: { x: number; y: number };
      size: { width: number; height: number };
    } | null,
    cornerPoints: { x: number; y: number }[],
    cameraDimensions: { width: number; height: number } | null
  ) {
    if (!cameraDimensions) return false;

    // Si tenemos bounds normalizados, usamos esos
    if (bounds) {
      const centerAreaWidth = 0.6;
      const centerAreaHeight = 0.6;

      const centerX = 0.5 - centerAreaWidth / 2;
      const centerY = 0.5 - centerAreaHeight / 2;

      return (
        bounds.origin.x >= centerX &&
        bounds.origin.y >= centerY &&
        bounds.origin.x + bounds.size.width <= centerX + centerAreaWidth &&
        bounds.origin.y + bounds.size.height <= centerY + centerAreaHeight
      );
    }

    // Si no hay bounds pero tenemos cornerPoints
    if (cornerPoints && cornerPoints.length > 0) {
      const normalizedPoints = normalizeCoordinates(
        cornerPoints,
        cameraDimensions.width,
        cameraDimensions.height
      );

      // Calcular el centro del código de barras
      const sumX = normalizedPoints.reduce((sum, point) => sum + point.x, 0);
      const sumY = normalizedPoints.reduce((sum, point) => sum + point.y, 0);
      const centerX = sumX / normalizedPoints.length;
      const centerY = sumY / normalizedPoints.length;

      // Definir área central (ajustar según necesidad)
      const centerAreaMinX = 0.3;
      const centerAreaMaxX = 0.7;
      const centerAreaMinY = 0.3;
      const centerAreaMaxY = 0.7;

      return (
        centerX >= centerAreaMinX &&
        centerX <= centerAreaMaxX &&
        centerY >= centerAreaMinY &&
        centerY <= centerAreaMaxY
      );
    }

    return false;
  }

  function barCodeScanned(scanningResult: BarcodeScanningResult) {
    const { bounds, cornerPoints } = scanningResult;

    const isInCenterArea = checkIfInCenterArea(
      bounds,
      cornerPoints || [],
      cameraDimensions
    );

    console.log('Is in center area:', isInCenterArea);

    if (isInCenterArea) {
      playSound();
      if (scanningResult.raw) {
        if (scanningResult.raw == scanningResult.data) {
          onBarcodeScanned(scanningResult.data);
          resetScanner();
        } else {
          setScanningResult(scanningResult);
        }
      } else {
        onBarcodeScanned(scanningResult.data);
        resetScanner();
      }
    }
  }

  function resetScanner() {
    setScanningResult(null);
    setFlash(false);
    setZoom(0);
  }

  function onDismissCancelLocal() {
    resetScanner();
    onDismissCancel();
  }

  function onAccept(barcode: string) {
    onBarcodeScanned(barcode);
    resetScanner();
  }

  const styles = StyleSheet.create({
    container: {
      flex: 0.7,
      backgroundColor: color.colors.surfaceBright,
      elevation: 5,
      margin: 10,
      borderRadius: 10,
      overflow: 'hidden',
    },
    camera: {
      borderRadius: 10,
      flex: 1,
      justifyContent: 'flex-end',
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    resultsDiffContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    selectResultContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      flexWrap: 'wrap',
      margin: 10,
    },
    scannerOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scannerFrame: {
      width: '60%',
      height: '30%',
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.7)',
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      borderRadius: 10,
    },
    scannerAnimation: {
      position: 'absolute',
      height: 2,
      width: '100%',
      backgroundColor: 'rgba(0, 255, 0, 0.7)',
    },
  });

  useEffect(() => {
    Keyboard.dismiss();
  }, [visible]);

  useEffect(() => {
    if (sound) {
      return () => {
        sound.unloadAsync();
      };
    }
  }, [sound]);

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismissCancelLocal}
        contentContainerStyle={styles.container}
      >
        {!scanningResult && (
          <View style={{ flex: 1 }}>
            <CameraView
              style={styles.camera}
              onBarcodeScanned={barCodeScanned}
              enableTorch={flash}
              zoom={zoom}
              onLayout={onCameraLayout} // Añade esto
            >
              <View style={styles.scannerOverlay}>
                <View style={styles.scannerFrame}>
                  {/* <View style={[styles.scannerAnimation, { top: 0 }]} />
                  <View style={[styles.scannerAnimation, { bottom: 0 }]} /> */}
                </View>
              </View>
              <Flex style={styles.buttonContainer}>
                <IconButton
                  icon={flash ? 'flash' : 'flash-off'}
                  size={20}
                  onPress={() => setFlash((current) => !current)}
                  mode="contained-tonal"
                />
                <IconButton
                  icon={'minus'}
                  size={20}
                  onPress={() =>
                    setZoom((current) => parseFloat((current - 0.1).toFixed(1)))
                  }
                  mode="contained-tonal"
                  disabled={zoom <= 0}
                />
                <Text>{zoom == 1 || zoom == 0 ? zoom : zoom.toFixed(1)}</Text>
                <IconButton
                  icon={'plus'}
                  size={20}
                  onPress={() =>
                    setZoom((current) => parseFloat((current + 0.1).toFixed(1)))
                  }
                  mode="contained-tonal"
                  disabled={zoom >= 1}
                />
                <Button onPress={onDismissCancelLocal} mode="contained-tonal">
                  Cancel
                </Button>
              </Flex>
            </CameraView>
          </View>
        )}
        {scanningResult && (
          <Flex style={styles.resultsDiffContainer}>
            <Text variant="headlineLarge" style={{ marginHorizontal: 10 }}>
              Diferencia de datos
            </Text>
            <Text variant="bodyLarge" style={{ margin: 10 }}>
              El escáner detectó dos datos de código de barras diferentes del
              mismo código de barras. Por favor, seleccione el correcto.
            </Text>
            <Flex style={styles.selectResultContainer}>
              <TextInput
                label="Barcode 1"
                value={scanningResult.data}
                style={{ flex: 1 }}
              />
              <IconButton
                onPress={() => {
                  onAccept(scanningResult.data);
                }}
                mode="contained-tonal"
                icon={'check'}
              />
            </Flex>
            <Flex style={styles.selectResultContainer}>
              <TextInput
                label="Barcode 2"
                value={scanningResult.raw || 'No raw data'}
                style={{ flex: 1 }}
              />
              <IconButton
                onPress={() => {
                  onAccept(scanningResult.raw || '');
                }}
                mode="contained-tonal"
                icon={'check'}
              />
            </Flex>
            <IconButton
              onPress={resetScanner}
              mode="contained-tonal"
              icon={'camera-retake'}
            />
          </Flex>
        )}
      </Modal>
    </Portal>
  );
}
