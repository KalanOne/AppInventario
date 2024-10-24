import { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
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
  handleCreateApply?: () => void;
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

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleCreateDismiss}
        contentContainerStyle={styles.containerStyle}
      >
        <Flex>
          <Text variant="titleLarge" style={styles.title}>
            Create
          </Text>
          <FormProvider {...form}>
            <Flex padding={10}>{children}</Flex>
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
                    onPress={handleCreateApply}
                    mode="contained-tonal"
                    style={styles.button}
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
