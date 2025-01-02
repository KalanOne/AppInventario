import { ReactNode, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Button, Modal, Portal, Text } from 'react-native-paper';

import { Flex } from '../Flex';
import { useAppTheme } from '../providers/Material3ThemeProvider';
import { FormProvider, UseFormReturn } from 'react-hook-form';

export { CreateModal };

interface CreateModalProps {
  visible: boolean;
  handleCreateDismiss: () => void;
  children: ReactNode;
  form: UseFormReturn<any, unknown, any>;
  handleCreateApply?: () => Promise<void> | void;
  handleCreateReset?: () => void;
  handleCreateCancel?: () => void;
}

function CreateModal({
  visible,
  handleCreateDismiss,
  children,
  form,
  handleCreateApply,
  handleCreateReset,
  handleCreateCancel,
}: CreateModalProps) {
  const color = useAppTheme();
  const [isProcessing, setIsProcessing] = useState(false);
  const styles = StyleSheet.create({
    containerStyle: {
      backgroundColor: color.colors.surfaceBright,
      padding: 10,
      margin: 10,
      borderRadius: 10,
      elevation: 5,
    },
    title: {
      marginBottom: 10,
      marginLeft: 10,
    },
    button: {
      // margin: 5,
    },
    buttonsContainer: {
      // marginVertical: 10,
      width: '100%',
      // paddingHorizontal: 10,
    },
  });

  async function handleCreateApplyLocal() {
    if (handleCreateApply) {
      setIsProcessing(true);
      try {
        await handleCreateApply();
      } finally {
        setIsProcessing(false);
      }
    }
  }

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleCreateDismiss}
        contentContainerStyle={styles.containerStyle}
      >
        <Flex paddingX={10}>
          <Text variant="titleLarge" style={styles.title}>
            Create
          </Text>
          <FormProvider {...form}>
            <ScrollView style={{ maxHeight: '80%', marginBottom: 10 }}>
              {children}
            </ScrollView>
          </FormProvider>
          {handleCreateApply || handleCreateReset || handleCreateCancel ? (
            <Flex
              direction="row"
              align="center"
              justify="space-between"
              style={styles.buttonsContainer}
            >
              <Flex>
                {handleCreateCancel && (
                  <Button
                    onPress={handleCreateCancel}
                    mode="contained-tonal"
                    style={styles.button}
                  >
                    Cancel
                  </Button>
                )}
              </Flex>

              <Flex direction="row" align="center" gap={10} justify="flex-end">
                {handleCreateReset && (
                  <Button
                    onPress={handleCreateReset}
                    mode="contained-tonal"
                    style={styles.button}
                  >
                    Reset
                  </Button>
                )}
                {handleCreateApply && (
                  <Button
                    onPress={handleCreateApplyLocal}
                    mode="contained-tonal"
                    style={styles.button}
                    disabled={isProcessing}
                    loading={isProcessing}
                  >
                    Create
                  </Button>
                )}
              </Flex>
            </Flex>
          ) : null}
        </Flex>
      </Modal>
    </Portal>
  );
}
