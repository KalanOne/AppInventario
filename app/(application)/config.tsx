import {
  useAppTheme,
  useMaterial3ThemeContext,
} from '@/components/providers/Material3ThemeProvider';
import { Flex } from '@/components/UI/Flex';
import { StyleSheet } from 'react-native';
import { Button, Modal, Portal, Text } from 'react-native-paper';
import { ScrollView } from 'react-native-gesture-handler';
import ColorPicker, {
  Panel1,
  Swatches,
  Preview,
  OpacitySlider,
  HueSlider,
} from 'reanimated-color-picker';
import { useState } from 'react';

export default function ConfigScreen() {
  const color = useAppTheme();
  const [showModal, setShowModal] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const { theme, updateTheme, resetTheme } = useMaterial3ThemeContext();

  const onSelectColor = ({ hex }: { hex: string }) => {
    console.log('Selected color:', hex);
    setSelectedColor(hex);
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
            <ColorPicker
              style={{ width: '70%' }}
              value={theme.light.primary}
              onComplete={onSelectColor}
            >
              <Preview />
              <Panel1 />
              <HueSlider />
              <OpacitySlider />
              <Swatches />
            </ColorPicker>

            <Button onPress={onApplyColor} mode="contained-tonal">
              Cambiar
            </Button>
          </Modal>
        </Portal>
      </Flex>
    </Flex>
  );
}

const styles = StyleSheet.create({});
