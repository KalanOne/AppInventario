import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { HelperText, TextInput, TextInputProps } from 'react-native-paper';

import { Flex } from '../Flex';
import { ViewStyle } from 'react-native';
import { useAppTheme } from '../providers/Material3ThemeProvider';

type CTextInputProps = {
  name: string;
  label: string;
  secureTextEntry?: boolean;
  type?: 'text' | 'number' | 'email' | 'password';
  flexStyles?: ViewStyle;
  helperText?: string;
} & TextInputProps;

export function CTextInput({
  name,
  label,
  secureTextEntry,
  type = 'text',
  flexStyles,
  helperText,
  ...props
}: CTextInputProps) {
  const [showHide, setShowHide] = useState(false);
  const color = useAppTheme();

  function showPassword() {
    setShowHide(true);
  }

  function hidePassword() {
    setShowHide(false);
  }

  return (
    <Controller
      name={name}
      render={({ field: { onChange, onBlur, value, ref }, fieldState }) => (
        <Flex style={{ marginVertical: 3, ...flexStyles }}>
          <TextInput
            label={label}
            secureTextEntry={secureTextEntry && !showHide}
            {...props}
            value={value?.toString() || ''}
            onChangeText={(text) => {
              if (type === 'number') {
                if (text === '') {
                  onChange('');
                  return;
                }
                if (
                  (text.startsWith('-') && text.length == 1) ||
                  (text.startsWith('.') && text.length == 1) ||
                  text.endsWith('.')
                ) {
                  onChange(text);
                  return;
                }
                const isNan = isNaN(Number(text));
                console.log('isNan', isNan);
                onChange(isNan ? text : Number(text));
              } else {
                onChange(text);
              }
            }}
            onBlur={onBlur}
            ref={ref}
            error={fieldState.invalid}
            right={
              secureTextEntry && showHide ? (
                <TextInput.Icon icon="eye-off" onPress={hidePassword} />
              ) : secureTextEntry && !showHide ? (
                <TextInput.Icon icon="eye" onPress={showPassword} />
              ) : undefined
            }
          />
          {helperText && (
            <HelperText
              type="info"
              padding="none"
              style={{
                color: color.colors.primary,
                // backgroundColor: 'blue',
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
              style={{ marginTop: helperText ? -10 : undefined }}
            >
              {fieldState.error?.message}
            </HelperText>
          )}
        </Flex>
      )}
    />
  );
}
