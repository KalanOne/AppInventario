import { ReactNode, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Button, Modal, Portal, Text } from 'react-native-paper';

import { Flex } from '../Flex';
import { useAppTheme } from '../providers/Material3ThemeProvider';
import { FormProvider, UseFormReturn } from 'react-hook-form';

export { FilterModal };

interface FilterModalProps {
  visible: boolean;
  handleFilterDismiss: () => void;
  children: ReactNode;
  form: UseFormReturn<any, unknown, any>;
  handleFilterApply?: () => Promise<void> | void;
  handleFilterReset?: () => void;
  handleFilterCancel?: () => void;
}

function FilterModal({
  visible,
  handleFilterDismiss,
  children,
  form,
  handleFilterApply,
  handleFilterReset,
  handleFilterCancel,
}: FilterModalProps) {
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
      marginVertical: 10,
      width: '100%',
      paddingHorizontal: 10,
    },
  });
  async function handleFilterApplyLocal() {
    if (handleFilterApply) {
      setIsProcessing(true);
      try {
        await handleFilterApply();
      } finally {
        setIsProcessing(false);
      }
    }
  }

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleFilterDismiss}
        contentContainerStyle={styles.containerStyle}
      >
        <Flex>
          <Text variant="titleLarge" style={styles.title}>
            Filter
          </Text>
          <FormProvider {...form}>
            <ScrollView style={{ maxHeight: '80%', marginBottom: 10 }}>
              {children}
            </ScrollView>
          </FormProvider>
          {handleFilterApply || handleFilterReset || handleFilterCancel ? (
            <Flex
              direction="row"
              align="center"
              justify="space-between"
              style={styles.buttonsContainer}
            >
              <Flex>
                {handleFilterCancel && (
                  <Button
                    onPress={handleFilterCancel}
                    mode="contained-tonal"
                    style={styles.button}
                  >
                    Cancel
                  </Button>
                )}
              </Flex>

              <Flex direction="row" align="center" gap={10} justify="flex-end">
                {handleFilterReset && (
                  <Button
                    onPress={handleFilterReset}
                    mode="contained-tonal"
                    style={styles.button}
                  >
                    Reset
                  </Button>
                )}
                {handleFilterApply && (
                  <Button
                    onPress={handleFilterApplyLocal}
                    mode="contained-tonal"
                    style={styles.button}
                    disabled={isProcessing}
                    loading={isProcessing}
                  >
                    Apply
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
