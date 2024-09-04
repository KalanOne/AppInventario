import {
  HelperText,
  Text,
  TextInput,
  TextInputProps,
} from "react-native-paper";
import { Controller } from "react-hook-form";
import { Flex } from "../Flex";
import { useState } from "react";

type CTextInputProps = {
  name: string;
  label: string;
  secureTextEntry?: boolean;
} & TextInputProps;

export function CTextInput({
  name,
  label,
  secureTextEntry,
  ...props
}: CTextInputProps) {
  const [showHide, setShowHide] = useState(false);
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
        <Flex>
          <TextInput
            label={label}
            secureTextEntry={secureTextEntry && !showHide}
            {...props}
            value={value}
            onChangeText={onChange}
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
          {fieldState.invalid && (
            <HelperText
              type="error"
              visible={fieldState.invalid}
              padding="none"
            >
              {fieldState.error?.message}
            </HelperText>
          )}
        </Flex>
      )}
    />
  );
}
