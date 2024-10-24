import { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { Button, Modal, Portal, Text } from 'react-native-paper';

import { Flex } from '../Flex';
import { useAppTheme } from '../providers/Material3ThemeProvider';
import { FormProvider, UseFormReturn } from 'react-hook-form';

export { UpdateModal };

interface UpdateModalProps {
  visible: boolean;
  handleUpdateDismiss: () => void;
  children: ReactNode;
  form: UseFormReturn<any, unknown, any>;
  handleUpdateApply?: () => void;
  handleUpdateCancel?: () => void;
}

function UpdateModal({
  visible,
  handleUpdateDismiss,
  children,
  form,
  handleUpdateApply,
  handleUpdateCancel,
}: UpdateModalProps) {
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
        onDismiss={handleUpdateDismiss}
        contentContainerStyle={styles.containerStyle}
      >
        <Flex>
          <Text variant="titleLarge" style={styles.title}>
            Update
          </Text>
          <FormProvider {...form}>
            <Flex padding={10}>{children}</Flex>
          </FormProvider>
          {handleUpdateApply || handleUpdateCancel ? (
            <Flex
              direction="row"
              align="center"
              justify="space-between"
              style={styles.buttonsContainer}
            >
              <Flex>
                {handleUpdateCancel && (
                  <Button
                    onPress={handleUpdateCancel}
                    mode="contained-tonal"
                    style={styles.button}
                  >
                    Cancel
                  </Button>
                )}
              </Flex>

              <Flex direction="row" align="center" gap={10} justify="flex-end">
                {handleUpdateApply && (
                  <Button
                    onPress={handleUpdateApply}
                    mode="contained-tonal"
                    style={styles.button}
                  >
                    Update
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
