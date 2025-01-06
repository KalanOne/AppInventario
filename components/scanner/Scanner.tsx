import { BarcodeScanningResult, CameraView } from 'expo-camera';
import { useEffect, useState } from 'react';
import { Keyboard, StyleSheet } from 'react-native';
import {
  Button,
  IconButton,
  Modal,
  Portal,
  Text,
  TextInput,
} from 'react-native-paper';
import { Audio } from 'expo-av';

import { Flex } from '@/components/UI/Flex';
import { useAppTheme } from '@/components/providers/Material3ThemeProvider';

export { Scanner };

interface ScannerProps {
  visible: boolean;
  onDismissCancel: () => void;
  onBarcodeScanned: (barcodeScanned: string) => void;
}

function Scanner({ visible, onDismissCancel, onBarcodeScanned }: ScannerProps) {
  // const [facing, setFacing] = useState<CameraType>('back');
  const [scanningResult, setScanningResult] =
    useState<BarcodeScanningResult | null>(null);
  const color = useAppTheme();
  const [flash, setFlash] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

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
      console.log('Error al reproducir audio', error);
    }
  }

  function barCodeScanned(scanningResult: BarcodeScanningResult) {
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

  function resetScanner() {
    setScanningResult(null);
    // setFacing('back');
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
          <CameraView
            style={styles.camera}
            // facing={facing}
            onBarcodeScanned={barCodeScanned}
            enableTorch={flash}
            zoom={zoom}
          >
            <Flex style={styles.buttonContainer}>
              {/* <IconButton
                icon={'camera-flip'}
                size={20}
                onPress={() =>
                  setFacing((current) =>
                    current === 'back' ? 'front' : 'back'
                  )
                }
                mode="contained-tonal"
              /> */}
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
              <Button
                onPress={onDismissCancelLocal}
                mode="contained-tonal"
                // style={styles.button}
              >
                Cancel
              </Button>
            </Flex>
          </CameraView>
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
