import { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
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
  handleFilterApply?: () => void;
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
        onDismiss={handleFilterDismiss}
        contentContainerStyle={styles.containerStyle}
      >
        <Flex>
          <Text variant="titleLarge" style={styles.title}>
            Filter
          </Text>
          <FormProvider {...form}>
            <Flex padding={10}>{children}</Flex>
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
                    onPress={handleFilterApply}
                    mode="contained-tonal"
                    style={styles.button}
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