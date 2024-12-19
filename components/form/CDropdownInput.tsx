import { Controller } from 'react-hook-form';
import { Dropdown } from 'react-native-element-dropdown';
import { DropdownProps } from 'react-native-element-dropdown/lib/typescript/components/Dropdown/model';
import { Flex } from '../Flex';
import { useEffect, useRef, useState } from 'react';
import { useAppTheme } from '../providers/Material3ThemeProvider';
import {
  Button,
  Dialog,
  HelperText,
  Icon,
  IconButton,
  Portal,
  Text,
} from 'react-native-paper';
import { AntDesign } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';

type CDropdownInputProps<T> = {
  name: string;
  label?: string;
  confirmable?: boolean;
  helperText?: string;
} & Omit<
  DropdownProps<T>,
  | 'onFocus'
  | 'onBlur'
  | 'onChange'
  | 'confirmSelectItem'
  | 'ref'
  | 'renderRightIcon'
>;

export function CDropdownInput<T>({
  name,
  label,
  confirmable = false,
  helperText,
  data,
  labelField,
  valueField,
  ...props
}: CDropdownInputProps<T>) {
  const color = useAppTheme();
  const [isFocus, setIsFocus] = useState(false);
  const [selectedDrop, setSelectedDrop] = useState<T | null>(null);
  const [confirimDialog, setConfirmDialog] = useState<{
    visible: boolean;
    item: T | null;
  }>({ visible: false, item: null });
  const dropdownRef = useRef<any>(null);

  const styles = StyleSheet.create({
    container: {
      backgroundColor: color.colors.surfaceBright,
      padding: 16,
    },
    dropdown: {
      height: 50,
      borderColor: 'gray',
      borderWidth: 0.5,
      borderRadius: 8,
      paddingHorizontal: 8,
    },
    icon: {
      marginRight: 5,
    },
    label: {
      position: 'absolute',
      backgroundColor: 'white',
      left: 22,
      top: 8,
      zIndex: 999,
      paddingHorizontal: 8,
      fontSize: 14,
    },
    placeholderStyle: {
      fontSize: 16,
      color: color.colors.secondary,
      marginStart: 10,
    },
    selectedTextStyle: {
      fontSize: 16,
      color: color.colors.secondary,
      marginStart: 10,
    },
    iconStyle: {
      width: 20,
      height: 20,
    },
    inputSearchStyle: {
      backgroundColor: color.colors.surfaceBright,
      borderRadius: 10,
      color: color.colors.secondary,
      borderColor: color.colors.primary,
    },
    containerStyle: {
      backgroundColor: color.colors.surfaceBright,
      color: color.colors.secondary,
      borderRadius: 10,
      borderColor: color.colors.primary,
    },
    itemTextStyle: {
      color: color.colors.secondary,
    },
  });

  return (
    <Controller
      name={name}
      render={({
        field: {
          onChange: controlOnChange,
          onBlur: controlOnBlur,
          value: controlValue,
          ref: controlRef,
        },
        fieldState,
      }) => {
        useEffect(() => {
          if (dropdownRef) {
            controlRef = dropdownRef.current;
          }
        }, [dropdownRef]);

        useEffect(() => {
          if (controlValue) {
            const item = data.find((item) => item[valueField] == controlValue);
            if (item) {
              setSelectedDrop(item);
            }
          }
        }, [controlValue]);

        return (
          <Flex style={{ marginVertical: 3 }}>
            {label && (
              <Text
                style={[
                  {
                    color: color.colors.secondary,
                    fontSize: 14,
                    marginBottom: 5,
                  },
                  isFocus && { color: color.colors.primary },
                  fieldState.invalid && { color: color.colors.error },
                ]}
              >
                {label}
              </Text>
            )}
            <Dropdown
              // Data
              data={data}
              labelField={labelField}
              valueField={valueField}
              value={selectedDrop}
              // Refs
              ref={dropdownRef}
              // Styles
              style={[
                styles.dropdown,
                isFocus && { borderColor: color.colors.primary },
                fieldState.invalid && { borderColor: color.colors.error },
              ]}
              placeholderStyle={[
                styles.placeholderStyle,
                fieldState.invalid && { color: color.colors.error },
              ]}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              containerStyle={styles.containerStyle}
              itemTextStyle={styles.itemTextStyle}
              maxHeight={300}
              // Renders
              renderLeftIcon={() => (
                <Icon
                  source={'magnify'}
                  color={
                    isFocus
                      ? color.colors.primary
                      : fieldState.invalid
                        ? color.colors.error
                        : color.colors.secondary
                  }
                  size={20}
                />
              )}
              renderItem={(item, selected) => (
                <Flex
                  direction="row"
                  align="center"
                  style={{ padding: 10 }}
                  gap={10}
                  backgroundColor={
                    selected ? color.colors.primaryContainer : 'transparent'
                  }
                >
                  <Text style={{ color: color.colors.secondary }}>
                    {String(item[labelField])}
                  </Text>
                  {selected && (
                    <AntDesign
                      name="check"
                      size={20}
                      color={color.colors.primary}
                    />
                  )}
                </Flex>
              )}
              renderRightIcon={() => (
                <>
                  {selectedDrop && (
                    <IconButton
                      icon={'close'}
                      iconColor={
                        isFocus
                          ? color.colors.primary
                          : fieldState.invalid
                            ? color.colors.error
                            : color.colors.secondary
                      }
                      size={20}
                      onPress={() => {
                        controlOnChange(null);
                        setSelectedDrop(null);
                      }}
                    />
                  )}
                  <Icon
                    source={'chevron-down'}
                    color={
                      isFocus
                        ? color.colors.primary
                        : fieldState.invalid
                          ? color.colors.error
                          : color.colors.secondary
                    }
                    size={20}
                  />
                </>
              )}
              // Labels
              placeholder={!isFocus ? 'Select item' : '...'}
              searchPlaceholder="Search..."
              // Events
              onFocus={() => setIsFocus(true)}
              onBlur={() => {
                controlOnBlur();
                setIsFocus(false);
              }}
              onChange={(item) => {
                controlOnChange(item[valueField]);
                setSelectedDrop(item);
                setIsFocus(false);
              }}
              // Others
              search={true}
              confirmSelectItem={confirmable}
              onConfirmSelectItem={(item) => {
                dropdownRef.current.close();
                setConfirmDialog({ visible: true, item });
              }}
              // Custom Props
              {...props}
            />
            {helperText && (
              <HelperText
                type="info"
                padding="none"
                style={{
                  color: color.colors.primary,
                }}
              >
                {helperText}
              </HelperText>
            )}
            {fieldState.invalid && (
              <HelperText
                type="error"
                visible={fieldState.invalid}
                padding="none"
              >
                {fieldState.error?.message}
              </HelperText>
            )}
            <Portal>
              <Dialog
                visible={confirimDialog.visible}
                onDismiss={() => {
                  setConfirmDialog({ visible: false, item: null });
                }}
              >
                <Dialog.Title>Confirm</Dialog.Title>
                <Dialog.Content>
                  <Text variant="bodyMedium">
                    Are you sure you want to select this item?
                  </Text>
                  {confirimDialog.item && (
                    <Text variant="bodyMedium">
                      {label}: {String(confirimDialog.item[valueField])} -{' '}
                      {String(confirimDialog.item[labelField])}
                    </Text>
                  )}
                </Dialog.Content>
                <Dialog.Actions>
                  <Button
                    onPress={() => {
                      if (!confirimDialog.item) return;
                      controlOnChange(confirimDialog.item[valueField]);
                      setSelectedDrop(confirimDialog.item);
                      setConfirmDialog({ visible: false, item: null });
                      dropdownRef.current.close();
                    }}
                  >
                    Yes
                  </Button>
                  <Button
                    onPress={() => {
                      setConfirmDialog({ visible: false, item: null });
                    }}
                  >
                    No
                  </Button>
                </Dialog.Actions>
              </Dialog>
            </Portal>
          </Flex>
        );
      }}
    />
  );
}
