import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button, Modal, Portal } from 'react-native-paper';
import ColorPicker, { Panel1, Swatches } from 'reanimated-color-picker';

import {
  useAppTheme,
  useMaterial3ThemeContext,
} from '@/components/providers/Material3ThemeProvider';
import { Flex } from '@/components/UI/Flex';

export default function ConfigScreen() {
  const color = useAppTheme();
  const [showModal, setShowModal] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const { theme, updateTheme, resetTheme } = useMaterial3ThemeContext();

  const onSelectColor = ({ hex }: { hex: string }) => {
    setSelectedColor(hex);
    updateTheme(hex.slice(0, 7));
  };

  function onDismissModal() {
    setShowModal(false);
  }

  function onApplyColor() {
    if (selectedColor) {
      updateTheme(selectedColor.slice(0, 7));
    }
    setShowModal(false);
  }

  const styles = StyleSheet.create({
    containerStyle: {
      backgroundColor: color.colors.surfaceBright,
      padding: 10,
      margin: 10,
      borderRadius: 10,
      elevation: 5,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      marginBottom: 10,
    },
    buttonsContainer: {
      width: '100%',
    },
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: '#fff',
    },
    description: {
      fontSize: 16,
      marginBottom: 16,
    },
  });

  return (
    <Flex flex={1} backgroundColor={color.colors.background}>
      <Flex
        style={{
          paddingTop: 10,
          paddingRight: 10,
          paddingBottom: 0,
          paddingLeft: 10,
          flex: 1,
        }}
      >
        <Button onPress={() => setShowModal(true)} mode="contained-tonal">
          Seleccionar color de tema
        </Button>

        <Portal>
          <Modal
            visible={showModal}
            onDismiss={onDismissModal}
            contentContainerStyle={styles.containerStyle}
          >
            <Button
              onPress={resetTheme}
              mode="contained-tonal"
              style={{
                marginBottom: 10,
              }}
            >
              Tema por defecto
            </Button>
            <ColorPicker
              style={{ width: '70%' }}
              value={theme.light.primary}
              onComplete={onSelectColor}
            >
              <Swatches />
            </ColorPicker>

            {/* <Button onPress={onApplyColor} mode="contained-tonal">
              Cambiar
            </Button> */}
          </Modal>
        </Portal>
      </Flex>
    </Flex>
  );
}

const styles = StyleSheet.create({});
